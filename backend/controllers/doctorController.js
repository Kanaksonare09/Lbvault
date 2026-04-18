const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Report = require('../models/Report');
const ReportBiomarker = require('../models/ReportBiomarker');
const ReportAiAnalysis = require('../models/ReportAiAnalysis');
const axios = require('axios');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Get base user info
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Get professional profile
        let profile = await DoctorProfile.findOne({ userId });
        
        // If profile doesn't exist, provide a skeleton response
        if (!profile) {
            return res.status(200).json({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                specialty: 'Not specified',
                degree: 'Not specified',
                experience: '0 Years',
                hospital: 'Not specified',
                address: 'Not specified',
                registrationNumber: `PENDING-${user.lvId || user._id}`
            });
        }

        // 3. Return aggregated profile
        res.status(200).json({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            specialty: profile.specialty || 'General Practitioner',
            degree: profile.degree || 'MBBS',
            experience: profile.experienceYears || '0 Years',
            hospital: profile.hospitalName || profile.clinicName || 'Private Practice',
            address: profile.clinicAddress || 'Not specified',
            registrationNumber: profile.registrationNumber,
            isVerified: profile.isVerified
        });
    } catch (error) {
        console.error('Get Doctor Profile Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, specialty, degree, experience, hospital, address, registrationNumber } = req.body;

        // 1. Update base User info (name, phone)
        await User.findByIdAndUpdate(userId, { name, phone });

        // 2. Check if DoctorProfile exists to handle required registrationNumber
        const existingProfile = await DoctorProfile.findOne({ userId });
        
        const profileUpdates = {
            specialty,
            degree,
            experienceYears: experience,
            hospitalName: hospital,
            clinicAddress: address
        };

        // If creating for the first time or updating registrationNumber
        if (!existingProfile && !registrationNumber) {
            const user = await User.findById(userId);
            profileUpdates.registrationNumber = `PENDING-${user.lvId || Date.now()}`;
        } else if (registrationNumber) {
            profileUpdates.registrationNumber = registrationNumber;
        }

        const profile = await DoctorProfile.findOneAndUpdate(
            { userId },
            { $set: profileUpdates },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('Update Doctor Profile Error:', error);
        res.status(500).json({ 
            message: 'Failed to update profile', 
            error: error.message 
        });
    }
};

/**
 * POST /api/doctor/patient/:patientId/chat
 * Doctor AI Chat — synthesizes the patient's entire health history into a
 * grounded clinical answer. Context: all reports + all biomarkers + AI summaries.
 */
exports.doctorChatWithPatient = async (req, res) => {
    try {
        const { patientId } = req.params;
        const { message, history = [] } = req.body;
        const doctorId = req.user.id;

        if (!message?.trim()) {
            return res.status(400).json({ message: 'Message is required.' });
        }

        // 1. Access control — patient must have granted access to this doctor
        const patient = await User.findOne({ _id: patientId, role: 'patient', doctorAccess: doctorId })
            .select('name lvId');
        if (!patient) {
            return res.status(403).json({ message: 'Access Denied: This patient has not shared their data with you.' });
        }

        // 2. Fetch all reports + biomarkers + AI summaries in parallel
        const reports = await Report.find({ patientId, isDeleted: false })
            .sort({ createdAt: -1 })
            .populate('pathologyId', 'name')
            .lean();

        const reportIds = reports.map(r => r._id);

        const [allBiomarkers, allAnalyses] = await Promise.all([
            ReportBiomarker.find({ reportId: { $in: reportIds } }).lean(),
            ReportAiAnalysis.find({ reportId: { $in: reportIds } }).lean()
        ]);

        // 3. Build compact clinical context string
        let clinicalContext = `PATIENT: ${patient.name} (ID: ${patient.lvId})\n`;
        clinicalContext += `TOTAL REPORTS: ${reports.length}\n\n`;

        // Aggregate abnormal biomarkers across all reports
        const abnormalBiomarkers = allBiomarkers.filter(b => b.isAbnormal || b.severity !== 'Normal');
        if (abnormalBiomarkers.length > 0) {
            clinicalContext += `=== ABNORMAL FINDINGS ACROSS ALL REPORTS ===\n`;
            abnormalBiomarkers.forEach(b => {
                clinicalContext += `• ${b.biomarkerName.toUpperCase()}: ${b.value} ${b.unit || ''}`
                    + (b.referenceMin != null ? ` [ref: ${b.referenceMin}–${b.referenceMax}]` : '')
                    + ` [${b.severity}]`
                    + (b.interpretation ? ` — ${b.interpretation}` : '') + '\n';
            });
            clinicalContext += '\n';
        }

        // Latest report detail
        const latestReport = reports[0];
        if (latestReport) {
            const latestAnalysis = allAnalyses.find(a => a.reportId.toString() === latestReport._id.toString());
            clinicalContext += `=== LATEST REPORT: ${latestReport.reportName || 'Unnamed'} (${new Date(latestReport.createdAt).toLocaleDateString()}) ===\n`;
            if (latestReport.testType) clinicalContext += `Test Type: ${latestReport.testType}\n`;
            if (latestReport.pathologyId?.name) clinicalContext += `Lab: ${latestReport.pathologyId.name}\n`;
            if (latestAnalysis?.summaryEn) {
                // Trim to avoid huge token usage
                clinicalContext += `AI Summary: ${latestAnalysis.summaryEn.substring(0, 800)}\n`;
            }
            clinicalContext += '\n';
        }

        // Historical summaries (older reports, short snippets)
        const olderReports = reports.slice(1, 4); // up to 3 older reports
        if (olderReports.length > 0) {
            clinicalContext += `=== HISTORICAL REPORTS ===\n`;
            olderReports.forEach(r => {
                const analysis = allAnalyses.find(a => a.reportId.toString() === r._id.toString());
                clinicalContext += `[${new Date(r.createdAt).toLocaleDateString()}] ${r.reportName || 'Report'}: `;
                const biomarkersForReport = allBiomarkers.filter(b => b.reportId.toString() === r._id.toString());
                const abnItems = biomarkersForReport.filter(b => b.isAbnormal);
                if (abnItems.length > 0) {
                    clinicalContext += abnItems.map(b => `${b.biomarkerName} ${b.value} ${b.unit || ''} (${b.severity})`).join(', ');
                } else if (analysis?.summaryEn) {
                    clinicalContext += analysis.summaryEn.substring(0, 150) + '...';
                } else {
                    clinicalContext += 'No AI analysis available.';
                }
                clinicalContext += '\n';
            });
        }

        // 4. Build system prompt for the doctor-facing AI
        const systemPrompt = `You are LabVault Clinical AI, an expert medical intelligence assistant for doctors.
You are analyzing a patient's complete health history from their uploaded lab reports.
You must answer the doctor's clinical question clearly, concisely, and accurately.

CLINICAL RULES:
- Be precise and clinical — the doctor is a medical professional.
- Highlight worsening trends, chronic abnormalities, and risk patterns.
- Mention specific biomarker values and dates when relevant.
- Flag any critical values that need immediate attention.
- If asked for a summary, organize by: Overall Health Status → Key Abnormalities → Trends → Recommendations.
- Keep answers under 350 words unless the doctor asks for a full report.
- Never refuse to answer — always provide the best clinical insight from available data.
- If data is insufficient, state what's missing and what it would tell you.

PATIENT CLINICAL CONTEXT:
${clinicalContext}`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-8).map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: message.trim() }
        ];

        console.log(`[DOCTOR CHAT] Patient: ${patient.name} | Question: "${message.trim().substring(0, 60)}..."`);

        // 5. Call Groq (fast) with Ollama fallback
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        const useGroq = GROQ_API_KEY && !GROQ_API_KEY.includes('your_groq');

        let response;
        if (useGroq) {
            response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                model: 'llama-3.1-8b-instant',
                messages,
                temperature: 0.3,
                max_tokens: 600
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                timeout: 20000
            });
        } else {
            response = await axios.post('http://127.0.0.1:11434/v1/chat/completions', {
                model: 'llama3.2',
                messages,
                temperature: 0.3,
                max_tokens: 600
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 60000
            });
        }

        const answer = response.data.choices?.[0]?.message?.content?.trim()
            || 'Unable to generate a response. Please try again.';

        console.log(`[DOCTOR CHAT] Response generated (${answer.length} chars) via ${useGroq ? 'Groq' : 'Ollama'}`);
        res.status(200).json({ answer, contextUsed: { reportCount: reports.length, abnormalCount: abnormalBiomarkers.length } });

    } catch (error) {
        console.error('[DOCTOR CHAT ERROR]', error.message);
        res.status(500).json({ message: 'Clinical AI is currently unavailable. Please try again.' });
    }
};
