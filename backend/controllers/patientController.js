const User = require('../models/User');
const Report = require('../models/Report');

exports.searchPatients = async (req, res) => {
    try {
        const query = req.query.query;
        
        if (!query) {
            // Default View: Show historical patients for this pathology lab
            if (req.user && req.user.role === 'pathology') {
                const interactedPatientIds = await Report.distinct('patientId', { uploadedBy: req.user.id });
                if (interactedPatientIds.length > 0) {
                    const historicalPatients = await User.find({ _id: { $in: interactedPatientIds } })
                                                         .select('-password')
                                                         .sort({ createdAt: -1 })
                                                         .limit(50);
                    return res.status(200).json(historicalPatients);
                }
            }
            return res.status(200).json([]);
        }
        
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

        const patients = await User.find(searchCriteria).select('-password');
        
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

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
