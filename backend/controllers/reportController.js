const Report = require('../models/Report');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const ReportBiomarker = require('../models/ReportBiomarker');
const ReportAiAnalysis = require('../models/ReportAiAnalysis');
const ReportAccess = require('../models/ReportAccess');
const aiService = require('../services/aiService');
const ttsService = require('../services/ttsService');
const { createNotification } = require('./notificationController');

exports.uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { patientId, patientLvId, reportName, testType } = req.body;
        
        let patient;
        // If a pathology is uploading, they must supply the patient identifier
        if (req.user.role === 'pathology') {
            if (patientId) {
                patient = await User.findOne({ _id: patientId, role: 'patient' });
            } else if (patientLvId) {
                patient = await User.findOne({ lvId: patientLvId, role: 'patient' });
            }
        } else {
            // Otherwise, it is a patient uploading their own file
            patient = await User.findById(req.user.id);
        }

        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const fileUrl = `/uploads/reports/${req.file.filename}`;

        // 1. Create Core Report
        const report = new Report({
            patientId: patient._id,
            lvId: patient.lvId,
            uploadedBy: req.user.id,
            uploadedByRole: req.user.role,
            pathologyId: req.user.role === 'pathology' ? req.user.id : null,
            reportName,
            testType,
            fileUrl,
        });

        await report.save();

        // 2. Synchronous AI Pipeline (Wait for results so user sees them in one click)
        try {
            const path = require('path');
            const fs = require('fs');
            const absoluteFilePath = path.join(__dirname, '..', report.fileUrl.replace(/^\//, ''));
            console.log(`[SYNC PIPELINE] Pushing document to AI Engine: ${absoluteFilePath}`);

            let geminiResult;
            if (fs.existsSync(absoluteFilePath)) {
                geminiResult = await aiService.extractBiomarkersFromDocument(absoluteFilePath);
            }

            if (!geminiResult) throw new Error("Document analysis failed.");

            const extractedText = geminiResult.rawOcrText || "Raw extracted text for " + reportName;
            const aiBiomarkers = geminiResult.biomarkers || [];
            const clinicalSummary = geminiResult.summary || "No summary generated.";

            // Save extracted Biomarkers to NoSQL Relation
            for (const b of aiBiomarkers) {
                try {
                    const val = Number(b.value) || 0;
                    
                    // Normalize severity to valid enum values
                    const raw = (b.severity || 'Normal').toLowerCase();
                    let severity = 'Normal';
                    if (raw.includes('critical') || raw.includes('danger')) severity = 'Critical';
                    else if (raw.includes('moderate') || raw.includes('elevated') || raw.includes('high') || raw.includes('low')) severity = 'Moderate';
                    else if (raw.includes('mild') || raw.includes('slight') || raw.includes('border')) severity = 'Mild';

                    // TREND ANALYSIS
                    const lastResult = await ReportBiomarker.findOne({ 
                        patientId: patient._id, 
                        biomarkerName: String(b.name || 'Unknown').toLowerCase() 
                    }).sort({ testDate: -1 });

                    let trend = 'Stable';
                    if (lastResult) {
                        if (val > lastResult.value) trend = 'Increasing';
                        else if (val < lastResult.value) trend = 'Decreasing';
                    }

                    await ReportBiomarker.create({
                        reportId: report._id,
                        patientId: patient._id,
                        biomarkerName: String(b.name || 'Unknown').toLowerCase(),
                        value: val,
                        unit: String(b.unit || ''),
                        referenceMin: b.min || 0,
                        referenceMax: b.max || 0,
                        isAbnormal: severity !== 'Normal',
                        severity,
                        interpretation: b.interpretation || `Value detected as ${trend.toLowerCase()}.`,
                        confidence: b.confidence || 0.9,
                        source: 'ai_extracted',
                        testDate: report.createdAt
                    });
                } catch (bioErr) {
                    console.warn(`[SYNC PIPELINE] Skipping biomarker "${b.name}":`, bioErr.message);
                }
            }

            console.log(`[SYNC PIPELINE] Saving Clinical Observation...`);
            
            await ReportAiAnalysis.findOneAndUpdate(
                { reportId: report._id },
                { ocrText: extractedText, summaryEn: clinicalSummary },
                { upsert: true, new: true }
            );

            console.log(`[SYNC PIPELINE] Fully complete for Report ${report._id}`);
            report.status = 'ready';
            await report.save();
        } catch (pipelineErr) {
            console.error('[SYNC PIPELINE ERROR]:', pipelineErr.message);
            report.status = 'failed';
            await report.save();
        }

        // TRIGGER NOTIFICATION: Patient notified if pathology uploads
        if (req.user.role === 'pathology') {
            await createNotification({
                recipient: patient._id,
                actor: req.user.id,
                type: 'new_report',
                message: `New lab results for ${reportName} are now available.`,
                link: `/dashboard/patient/insights?id=${report._id}`
            });
        }

        // 3. Respond only AFTER analysis is ready
        res.status(201).json({ 
            message: 'Report uploaded and analyzed!', 
            report: {
                ...report.toObject(),
                status: report.status
            } 
        });
    } catch (error) {
        console.error('Upload Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server Error' });
        }
    }
};

exports.getReports = async (req, res) => {
    try {
        let query = { isDeleted: false };
        if (req.user.role === 'patient') {
            query.patientId = req.user.id;
        } else if (req.user.role === 'pathology') {
            query.pathologyId = req.user.id;
        } else if (req.user.role === 'doctor') {
            // Find reports this doctor has access to
            const access = await ReportAccess.find({ doctorId: req.user.id, status: 'approved' }).select('reportId');
            const reportIds = access.map(a => a.reportId);
            query._id = { $in: reportIds };
        } // admin sees all

        // Note: For full robustness, you might populate patientId and pathologyId 
        const reports = await Report.find(query)
            .sort({ reportDate: -1 })
            .populate('patientId', 'name lvId email')
            .populate('pathologyId', 'name lvId'); // name refers to labName via users table
            
        res.status(200).json(reports);
    } catch (error) {
        console.error('Get Reports Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getSharedReportsForDoctor = async (req, res) => {
    try {
        const doctorId = req.user.id;

        // 1. Find all patients where doctorAccess includes the given doctorId
        const patients = await User.find({ role: 'patient', doctorAccess: doctorId }).select('_id');
        
        if (!patients || patients.length === 0) {
            return res.status(200).json([]); // Return empty if no patients found
        }

        const patientIds = patients.map(p => p._id);

        // 2. Fetch all reports linked to those patients
        const reports = await Report.find({ patientId: { $in: patientIds }, isDeleted: false })
            .sort({ reportDate: -1 })
            .populate('patientId', 'name lvId email')
            .populate('pathologyId', 'name lvId');

        res.status(200).json(reports);
    } catch (error) {
        console.error('Get Shared Reports Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('patientId', 'name lvId email doctorAccess')
            .lean(); // Return plain object so we can attach relational data
            
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // DOCTOR ACCESS CONTROL Check
        if (req.user.role === 'doctor') {
            const patient = report.patientId;
            if (!patient || !patient.doctorAccess || !patient.doctorAccess.some(id => id.toString() === req.user.id)) {
                return res.status(403).json({ message: 'Access Denied: You are not authorized to view this report.' });
            }
        }

        // Fetch associated relational data
        const biomarkers = await ReportBiomarker.find({ reportId: report._id });
        const aiAnalysis = await ReportAiAnalysis.findOne({ reportId: report._id });

        // Map back to legacy frontend format temporarily until frontend is fully migrated
        const responseData = {
            ...report,
            extractedData: biomarkers.reduce((acc, b) => ({ ...acc, [b.biomarkerName]: b.value }), {}),
            biomarkers: biomarkers, // Added so new Insights page can render range bars
            aiSummary: aiAnalysis?.summaryEn || null,
            voiceSummaryUrl: aiAnalysis?.audioUrls?.get('en') || null
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Get Report By Id Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReportStatus = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).select('status createdAt');
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json({ 
            status: report.status, 
            createdAt: report.createdAt,
            isProcessing: report.status === 'processing'
        });
    } catch (error) {
        console.error('Get Report Status Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReportSummary = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate('patientId', 'doctorAccess');
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // DOCTOR ACCESS CONTROL Check
        if (req.user.role === 'doctor') {
            const patient = report.patientId;
            if (!patient || !patient.doctorAccess || !patient.doctorAccess.some(id => id.toString() === req.user.id)) {
                return res.status(403).json({ message: 'Access Denied: You are not authorized to view this summary.' });
            }
        }

        let analysis = await ReportAiAnalysis.findOne({ reportId: req.params.id });
        if (!analysis) {
            analysis = await ReportAiAnalysis.findOneAndUpdate(
                { reportId: req.params.id },
                { ocrText: 'Missing OCR data.', summaryEn: '' },
                { upsert: true, new: true }
            );
        }
        
        const language = req.query.lang || 'en';
        const force = req.query.force === 'true';

        // Use the new single-pass engine if summary is missing OR force-recalculating
        if (!analysis.summaryEn || force || (language !== 'en' && !analysis.translations.get(language))) {
            console.log(`[AI CONTROLLER] Generating/Updating analysis for ${req.params.id}...`);
            const result = await aiService.analyzeReportUniversal(analysis.ocrText, language);
            
            if (language === 'en') {
                analysis.summaryEn = result.summary;
            } else {
                if (!analysis.translations) analysis.translations = new Map();
                analysis.translations.set(language, result.summary);
            }
            await analysis.save();
        }
        
        const summary = language === 'en' ? analysis.summaryEn : analysis.translations.get(language);
        const voiceUrl = analysis.audioUrls?.get(language);

        res.status(200).json({ summary, voiceSummaryUrl: voiceUrl });
    } catch (error) {
        console.error('Summary Generation Fatal:', error.message);
        res.status(500).json({ message: 'AI processing failed locally. Please check Ollama logs.' });
    }
};

exports.generateVoice = async (req, res) => {
    try {
        const { reportId, language, text } = req.body;
        
        if (reportId) {
            const report = await Report.findById(reportId).populate('patientId', 'doctorAccess');
            if (!report) return res.status(404).json({ message: 'Report not found' });

            // DOCTOR ACCESS CONTROL Check
            if (req.user.role === 'doctor') {
                const patient = report.patientId;
                if (!patient || !patient.doctorAccess || !patient.doctorAccess.some(id => id.toString() === req.user.id)) {
                    return res.status(403).json({ message: 'Access Denied: You are not authorized to generate voice for this report.' });
                }
            }
        }

        const rewriteService = require('../services/rewriteService');
        const scriptService = require('../services/scriptService');

        let summaryText = text;
        let analysis = reportId ? await ReportAiAnalysis.findOne({ reportId }) : null;

        if (!analysis && reportId) {
            analysis = await ReportAiAnalysis.findOneAndUpdate(
                { reportId },
                { ocrText: 'Regenerating insights.', summaryEn: '' },
                { upsert: true, new: true }
            );
        }

        // Step 1: Get the base summary text
        if (!summaryText && analysis) {
            summaryText = language === 'en' ? analysis.summaryEn : analysis.translations?.get(language);
            if (!summaryText) {
                const result = await aiService.analyzeReportUniversal(analysis.ocrText, language);
                summaryText = result.summary;
                if (language === 'en') analysis.summaryEn = summaryText;
                else {
                    if (!analysis.translations) analysis.translations = new Map();
                    analysis.translations.set(language, summaryText);
                }
                await analysis.save();
            }
        }

        if (!summaryText) return res.status(400).json({ message: 'No summary text available.' });

        // Step 2: EMPATHY LAYER — Rewrite as a warm, doctor-like message
        const langCode = language?.toLowerCase().includes('hi') ? 'hi'
            : language?.toLowerCase().includes('mr') ? 'mr'
            : language?.toLowerCase().includes('te') ? 'te' : 'en';

        console.log(`[VOICE PIPELINE] Applying Empathy Layer for language: ${langCode}`);
        const empatheticText = await rewriteService.rewriteAsEmpathetic(summaryText, langCode);

        // Step 3: SCRIPT GENERATOR — Build structured voice script
        const voiceScript = scriptService.buildVoiceScript(empatheticText, langCode);
        console.log(`[VOICE PIPELINE] Voice script (${voiceScript.length} chars) ready for TTS.`);

        // Step 4: TTS — Convert script to audio
        const audioUrl = await ttsService.generateAndStoreAudio(voiceScript, langCode);

        // Step 5: Save everything to DB
        if (analysis) {
            if (!analysis.audioUrls) analysis.audioUrls = new Map();
            analysis.audioUrls.set(langCode, audioUrl);
            // Cache the voice script too
            if (!analysis.translations) analysis.translations = new Map();
            analysis.translations.set(`script_${langCode}`, voiceScript);
            await analysis.save();
        }

        res.status(200).json({
            audioUrl,
            voiceScript,
            empatheticSummary: empatheticText,
            language: langCode
        });
    } catch (error) {
        console.error('Voice Generation Error:', error.message);
        res.status(500).json({ message: 'Voice generation failed. Please try again.' });
    }
};

exports.grantAccess = async (req, res) => {
    try {
        const { reportId, doctorId } = req.body;
        
        const report = await Report.findOne({ _id: reportId, patientId: req.user.id });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        await ReportAccess.findOneAndUpdate(
            { reportId, doctorId },
            { patientId: req.user.id, status: 'approved' },
            { upsert: true, new: true }
        );

        // TRIGGER NOTIFICATION: Doctor notified of access
        await createNotification({
            recipient: doctorId,
            actor: req.user.id,
            type: 'access_granted',
            message: `${req.user.name} has granted you access to their reports.`,
            link: `/dashboard/doctor/patient/${req.user.id}/dashboard`
        });

        res.status(200).json({ message: 'Access granted successfully' });
    } catch (error) {
        console.error('Grant Access Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Utility to add backward compatibility for doctorComment
const mapReportNotes = (report) => {
    const reportObj = report.toObject ? report.toObject() : report;
    const lastNote = reportObj.doctorNotes && reportObj.doctorNotes.length > 0 
        ? reportObj.doctorNotes[reportObj.doctorNotes.length - 1].note 
        : "";
    return { ...reportObj, doctorComment: lastNote };
};

exports.getPatientReports = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterId = req.user.id;
        const requesterRole = req.user.role;

        if (requesterRole === 'patient' && requesterId !== id) {
            return res.status(403).json({ message: "Access Denied: You cannot view another patient's reports." });
        }

        if (requesterRole === 'doctor') {
            const patient = await User.findOne({ _id: id, role: 'patient', doctorAccess: requesterId });
            if (!patient) {
                return res.status(403).json({ message: "Access Denied: You do not have permission to view this patient's history." });
            }
        }

        const reports = await Report.find({ patientId: id, isDeleted: false })
            .sort({ reportDate: -1 })
            .populate('pathologyId', 'name lvId');

        res.status(200).json(reports.map(mapReportNotes));
    } catch (error) {
        console.error('Get Patient Reports Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getPatientReportsForDoctor = async (req, res) => {
    try {
        const { patientId } = req.params;
        const doctorId = req.user.id;

        const patient = await User.findOne({ _id: patientId, role: 'patient', doctorAccess: doctorId });
        if (!patient) {
            return res.status(403).json({ message: "Access Denied: You do not have permission to view this patient's history." });
        }

        const reports = await Report.find({ patientId, isDeleted: false })
            .sort({ reportDate: -1 })
            .populate('pathologyId', 'name lvId');

        res.status(200).json(reports.map(mapReportNotes));
    } catch (error) {
        console.error('Get Patient Reports For Doctor Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addDoctorNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (!note) {
            return res.status(400).json({ message: 'Note content is required' });
        }

        const report = await Report.findById(id).populate('patientId', 'doctorAccess');
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (req.user.role === 'doctor') {
            const patient = report.patientId;
            if (!patient || !patient.doctorAccess || !patient.doctorAccess.some(docId => docId.toString() === req.user.id)) {
                return res.status(403).json({ message: 'Access Denied: You are not authorized to add a note to this report.' });
            }
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only healthcare providers can add clinical notes.' });
        }

        report.doctorNotes.push({
            note,
            doctorId: req.user.id,
            createdAt: new Date()
        });

        await report.save();

        // TRIGGER NOTIFICATION: Patient notified of clinical note
        await createNotification({
            recipient: report.patientId._id || report.patientId,
            actor: req.user.id,
            type: 'clinical_note',
            message: `Dr. ${req.user.name} added a clinical note to your ${report.reportName} report.`,
            link: `/dashboard/patient/insights?id=${report._id}`
        });

        res.status(200).json({
            success: true,
            message: 'Note added successfully',
            doctorNotes: report.doctorNotes,
            doctorComment: note // Return for compatibility
        });
    } catch (error) {
        console.error('Add Doctor Note Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getReportDetails = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report = await Report.findById(reportId)
            .populate('patientId', 'name lvId email doctorAccess')
            .populate('pathologyId', 'name lvId');
            
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // Security check for doctors
        if (req.user.role === 'doctor') {
            const patient = report.patientId;
            if (!patient || !patient.doctorAccess || !patient.doctorAccess.some(id => id.toString() === req.user.id)) {
                return res.status(403).json({ message: 'Access Denied: You are not authorized to view this report.' });
            }
        }

        const biomarkers = await ReportBiomarker.find({ reportId });
        const aiAnalysis = await ReportAiAnalysis.findOne({ reportId });

        res.status(200).json({
            report,
            biomarkers,
            aiSummary: aiAnalysis?.summaryEn || null,
            ocrText: aiAnalysis?.ocrText || null,
            abnormalities: biomarkers.filter(b => b.isAbnormal || b.severity !== 'Normal')
        });
    } catch (error) {
        console.error('Get Report Details Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getPatientTrends = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Verify doctor has access
        if (req.user.role === 'doctor') {
            const patient = await User.findOne({ _id: patientId, role: 'patient', doctorAccess: req.user.id });
            if (!patient) {
                return res.status(403).json({ message: "Access Denied: You do not have permission to view trends for this patient." });
            }
        }

        const data = await ReportBiomarker.find({ patientId }).sort({ testDate: 1 });
        
        // Group by biomarkerName
        const trends = data.reduce((acc, curr) => {
            const name = curr.biomarkerName.toLowerCase();
            if (!acc[name]) acc[name] = [];
            acc[name].push({
                value: curr.value,
                unit: curr.unit,
                date: curr.testDate,
                severity: curr.severity,
                isAbnormal: curr.isAbnormal
            });
            return acc;
        }, {});

        res.status(200).json(trends);
    } catch (error) {
        console.error('Get Patient Trends Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getPatientDashboardData = async (req, res) => {
    try {
        const { id: patientId } = req.params;

        // 1. Security & Patient Info
        const patient = await User.findOne({ _id: patientId, role: 'patient' })
            .select('name email lvId doctorAccess');
        
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        if (req.user.role === 'doctor' && (!patient.doctorAccess || !patient.doctorAccess.some(id => id.toString() === req.user.id))) {
            return res.status(403).json({ message: 'Access Denied: You do not have permission to view this patient dashboard.' });
        }

        // 2. Parallel Fetching for Efficiency
        const [reports, biomarkers, aiAnalyses] = await Promise.all([
            Report.find({ patientId, isDeleted: false }).sort({ reportDate: -1 }).populate('pathologyId', 'name'),
            ReportBiomarker.find({ patientId }).sort({ testDate: 1 }),
            ReportAiAnalysis.find({ reportId: { $in: (await Report.find({ patientId, isDeleted: false }).select('_id')).map(r => r._id) } })
        ]);

        // 3. Assemble Trends
        const trends = biomarkers.reduce((acc, curr) => {
            const name = curr.biomarkerName;
            if (!acc[name]) acc[name] = [];
            acc[name].push({
                value: curr.value,
                unit: curr.unit,
                date: curr.testDate,
                isAbnormal: curr.isAbnormal
            });
            return acc;
        }, {});

        // 4. Combine Reports with their analysis and COMPARISON logic
        const enrichedReports = reports.map((report, index) => {
            const reportBiomarkers = biomarkers.filter(b => b.reportId.toString() === report._id.toString());
            const analysis = aiAnalyses.find(a => a.reportId.toString() === report._id.toString());
            
            // Comparison with previous report (index + 1 because reports are sorted by date DESC)
            const previousReport = reports[index + 1];
            const previousBiomarkers = previousReport 
                ? biomarkers.filter(b => b.reportId.toString() === previousReport._id.toString())
                : [];

            const biomarkersWithComparison = reportBiomarkers.map(b => {
                const prev = previousBiomarkers.find(pb => pb.biomarkerName === b.biomarkerName);
                let trendDirection = 'stable';
                let improvementStatus = 'neutral';

                if (prev) {
                    if (b.value > prev.value) trendDirection = 'up';
                    else if (b.value < prev.value) trendDirection = 'down';

                    // Clinical Improving/Deteriorating logic (Simplified)
                    if (prev.isAbnormal && !b.isAbnormal) improvementStatus = 'improving';
                    else if (!prev.isAbnormal && b.isAbnormal) improvementStatus = 'deteriorating';
                    else if (b.isAbnormal && prev.isAbnormal) {
                        // Check if moving toward normal range
                        const mid = (b.referenceMin + b.referenceMax) / 2 || prev.value;
                        if (Math.abs(b.value - mid) < Math.abs(prev.value - mid)) improvementStatus = 'improving';
                        else improvementStatus = 'deteriorating';
                    }
                }

                return {
                    ...b.toObject(),
                    comparison: prev ? {
                        previousValue: prev.value,
                        trendDirection,
                        improvementStatus
                    } : null
                };
            });

            return {
                ...report.toObject(),
                biomarkers: biomarkersWithComparison,
                ai: analysis ? {
                    summary: analysis.summaryEn,
                    ocrText: analysis.ocrText,
                    insights: analysis.insightsEn,
                    suggestions: analysis.suggestions || []
                } : null,
                abnormalities: biomarkersWithComparison.filter(b => b.isAbnormal || b.severity !== 'Normal')
            };
        });

        res.status(200).json({
            patient,
            reports: enrichedReports,
            trends: Object.entries(trends).map(([parameter, values]) => ({ parameter, values }))
        });
    } catch (error) {
        console.error('Dashboard Aggregation Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
