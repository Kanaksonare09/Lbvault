const User = require('../models/User');
const Report = require('../models/Report');
const PatientProfile = require('../models/PatientProfile');
const Notification = require('../models/Notification');
const ReportBiomarker = require('../models/ReportBiomarker');
const DoctorProfile = require('../models/DoctorProfile');

exports.searchPatients = async (req, res) => {
    try {
        const query = req.query.query;
        
        let users = [];

        if (!query) {
            // Default View: Show historical patients for this pathology lab
            if (req.user && req.user.role === 'pathology') {
                const interactedPatientIds = await Report.distinct('patientId', { uploadedBy: req.user.id });
                if (interactedPatientIds.length > 0) {
                    users = await User.find({ _id: { $in: interactedPatientIds } })
                                     .select('-password')
                                     .sort({ createdAt: -1 })
                                     .limit(50);
                }
            }
        } else {
            const searchCriteria = {
                role: 'patient',
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { lvId: { $regex: query, $options: 'i' } },
                    { email: { $regex: query, $options: 'i' } }
                ]
            };

            // DOCTOR ACCESS CONTROL: Only show patients who granted permission
            if (req.user.role === 'doctor') {
                searchCriteria.doctorAccess = req.user.id;
            }

            users = await User.find(searchCriteria).select('-password');
        }

        if (users.length === 0) return res.status(200).json([]);

        // ── Bulk-fetch PatientProfile for all found patients ──────────────
        const userIds = users.map(u => u._id);
        const profiles = await PatientProfile.find({ userId: { $in: userIds } }).lean();
        const profileMap = {};
        profiles.forEach(p => { profileMap[p.userId.toString()] = p; });

        const enriched = users.map(u => {
            const base = enrichPatient(u);
            const prof = profileMap[u._id.toString()] || {};
            // Prefer PatientProfile fields if present
            if (!base.gender    && prof.gender)      base.gender    = prof.gender;
            if (!base.bloodGroup && prof.bloodGroup) base.bloodGroup = prof.bloodGroup;
            if (!base.age && prof.dateOfBirth) {
                const dob = new Date(prof.dateOfBirth);
                const now = new Date();
                let years = now.getFullYear() - dob.getFullYear();
                const m = now.getMonth() - dob.getMonth();
                if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
                base.age = years;
            }
            return base;
        });

        res.status(200).json(enriched);
    } catch (error) {
        console.error('Search Patients Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Compute age from dateOfBirth if age not directly set
function enrichPatient(patient) {
    const p = patient.toObject ? patient.toObject() : { ...patient };
    if (!p.age && p.dateOfBirth) {
        const dob = new Date(p.dateOfBirth);
        const now = new Date();
        let years = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
        p.age = years;
    }
    return p;
}

exports.registerPatient = async (req, res) => {
    try {
        // Simple passthrough to auth controller logic in a real monolithic set up
        // Currently relying on authController.signup or dedicated pathology-patient registration
        res.status(201).json({ message: 'Patient registered successfully (Stub)' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updatePatient = async (req, res) => {
    // Stub
    res.status(200).json({ message: 'Patient updated' });
};

exports.deletePatient = async (req, res) => {
    // Stub
    res.status(200).json({ message: 'Patient deleted' });
};

exports.requestReview = async (req, res) => {
    try {
        const patient = await User.findById(req.user.id).select('-password');
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const { reportId, reportName } = req.body;

        // Notify every doctor who has access to this patient
        const doctorIds = patient.doctorAccess || [];
        if (doctorIds.length === 0) {
            return res.status(200).json({ message: 'Request logged. No linked doctors found yet — share access first.' });
        }

        const notificationMsg = `📅 Review request from ${patient.name}: They would like a consultation on report "${reportName || 'a recent report'}". Contact: ${patient.email}${patient.phone ? ` | ${patient.phone}` : ''}.`;

        await Promise.all(doctorIds.map(doctorId =>
            Notification.create({
                recipient: doctorId,
                actor: patient._id,
                type: 'system',
                message: notificationMsg,
                link: reportId ? `/dashboard/doctor/patient/${patient._id}/dashboard` : undefined,
            })
        ));

        res.status(200).json({ success: true, message: `Review request sent to ${doctorIds.length} doctor(s).` });
    } catch (error) {
        console.error('Request Review Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

/* ── Biomarker-name → specialty map ─────────────────────────────────── */
const BM_SPECIALTY_MAP = [
    { keywords: ['creatinine', 'urea', 'uric acid', 'kidney', 'renal'],         specialty: 'Nephrology',      reason: 'Kidney function markers' },
    { keywords: ['hba1c', 'glucose', 'insulin', 'blood sugar', 'diabetes'],      specialty: 'Endocrinology',   reason: 'Glycemic / metabolic markers' },
    { keywords: ['tsh', 'thyroid', 't3', 't4', 'thyroxine'],                     specialty: 'Endocrinology',   reason: 'Thyroid function' },
    { keywords: ['cholesterol', 'hdl', 'ldl', 'triglyceride', 'lipid'],          specialty: 'Cardiology',      reason: 'Lipid / cardiovascular markers' },
    { keywords: ['hemoglobin', 'wbc', 'rbc', 'platelet', 'hematology', 'cbc'],   specialty: 'Hematology',      reason: 'Blood cell markers' },
    { keywords: ['crp', 'esr', 'inflammation', 'rheum', 'arthrit'],              specialty: 'Rheumatology',    reason: 'Inflammation markers' },
    { keywords: ['vitamin d', 'calcium', 'phosphor', 'bone'],                   specialty: 'General Medicine', reason: 'Nutritional / bone health' },
    { keywords: ['alt', 'ast', 'bilirubin', 'liver', 'hepat', 'albumin'],        specialty: 'Gastroenterology', reason: 'Liver function markers' },
    { keywords: ['psa', 'testosterone'],                                          specialty: 'Urology',         reason: 'Hormonal markers' },
    { keywords: ['fsh', 'lh', 'estrogen', 'progesterone'],                       specialty: 'Gynecology',      reason: 'Reproductive hormones' },
];

exports.getRecommendedDoctors = async (req, res) => {
    try {
        const patientId = req.user.id;

        // 1. Get the patient's abnormal biomarkers
        const abnormalBiomarkers = await ReportBiomarker.find({
            patientId,
            isAbnormal: true,
        }).sort({ testDate: -1 }).limit(50);

        // 2. Map biomarker names to required specialties
        const specialtySet = new Map(); // specialty -> reason
        for (const bm of abnormalBiomarkers) {
            const name = (bm.biomarkerName || '').toLowerCase();
            for (const entry of BM_SPECIALTY_MAP) {
                if (entry.keywords.some(k => name.includes(k))) {
                    if (!specialtySet.has(entry.specialty)) {
                        specialtySet.set(entry.specialty, { reason: entry.reason, biomarker: bm.biomarkerName });
                    }
                    break;
                }
            }
        }

        // 3. Fetch all approved doctors
        const allDoctors = await User.find({ role: 'doctor' }).select('_id name email').lean();
        const doctorIds  = allDoctors.map(d => d._id);
        const profiles   = await DoctorProfile.find({ userId: { $in: doctorIds } })
            .select('userId specialty hospitalName clinicName experienceYears isVerified').lean();

        const profileMap = {};
        profiles.forEach(p => { profileMap[p.userId.toString()] = p; });

        // 4. Score and rank — matched specialty first, then others
        const specialties = [...specialtySet.keys()];
        const results = [];

        for (const doc of allDoctors) {
            const prof = profileMap[doc._id.toString()];
            if (!prof) continue;
            const docSpecialty = (prof.specialty || '').toLowerCase();

            // Check for specialty match
            const matchEntry = specialties.find(sp => docSpecialty.includes(sp.toLowerCase()));
            const matchInfo  = matchEntry ? specialtySet.get(matchEntry) : null;

            results.push({
                _id:          doc._id,
                name:         doc.name,
                specialty:    prof.specialty || 'General Medicine',
                hospital:     prof.hospitalName || prof.clinicName || 'Private Practice',
                experience:   prof.experienceYears ? `${prof.experienceYears}y exp` : null,
                isVerified:   prof.isVerified,
                matchScore:   matchInfo ? 2 : 1,
                matchReason:  matchInfo ? matchInfo.reason : null,
                matchBiomarker: matchInfo ? matchInfo.biomarker : null,
            });
        }

        // Sort: matched first, then alphabetical
        results.sort((a, b) => b.matchScore - a.matchScore || a.name.localeCompare(b.name));

        res.status(200).json({ doctors: results.slice(0, 6), matchedSpecialties: specialties });
    } catch (error) {
        console.error('Recommended Doctors Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.requestConsultation = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { concern }  = req.body;

        const patient = await User.findById(req.user.id).select('name email phone _id');
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const doctor = await User.findOne({ _id: doctorId, role: 'doctor' }).select('name _id');
        if (!doctor)  return res.status(404).json({ message: 'Doctor not found' });

        // ── Auto-grant doctor access so they can view the patient dashboard ──
        // Uses $addToSet so no duplicates are created
        await User.findByIdAndUpdate(patient._id, {
            $addToSet: { doctorAccess: doctor._id }
        });

        const msg = [
            `📊 Consultation request from ${patient.name}.`,
            concern ? `Health concern: ${concern}.` : null,
            `Contact: ${patient.email}${patient.phone ? ' | ' + patient.phone : ''}.`,
            `Access has been granted — click to view their full report history.`,
        ].filter(Boolean).join(' ');

        await Notification.create({
            recipient: doctor._id,
            actor:     patient._id,
            type:      'system',
            message:   msg,
            link:      `/dashboard/doctor/patient/${patient._id}/dashboard`,
        });

        res.status(200).json({ success: true, message: `Consultation request sent to Dr. ${doctor.name}. Access granted.` });
    } catch (error) {
        console.error('Request Consultation Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAuthorizedPatients = async (req, res) => {
    try {
        const doctorId = req.user.id;
        
        // Find all patients who have granted access to this doctor
        const patients = await User.find({ role: 'patient', doctorAccess: doctorId })
                                   .select('name lvId email avatarUrl lastLoginAt createdAt')
                                   .sort({ name: 1 });
        
        res.status(200).json(patients);
    } catch (error) {
        console.error('Get Authorized Patients Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
