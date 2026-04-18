const User = require('../models/User');
const Report = require('../models/Report');
const mongoose = require('mongoose');

exports.grantAccess = async (req, res) => {
    try {
        const { doctorId } = req.body;
        
        // 1. Debugging Logs
        console.log('[DEBUG] Access Granting Request:');
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('User Context:', req.user ? { id: req.user.id, role: req.user.role } : 'Undefined');

        // 2. Validate Incoming Request
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: User context missing.' });
        }
        
        if (!doctorId) {
            return res.status(400).json({ message: 'Missing doctorId in request body.' });
        }

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: 'Invalid doctorId format. Must be a valid MongoDB ObjectId.' });
        }

        // 3. Grant access at the patient level (User model)
        const patient = await User.findById(req.user.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        // Ensure doctorAccess array exists (sanity check)
        if (!patient.doctorAccess) {
            patient.doctorAccess = [];
        }

        if (!patient.doctorAccess.includes(doctorId)) {
            patient.doctorAccess.push(doctorId);
            await patient.save();
        }
        
        res.status(200).json({ message: 'Access granted successfully' });
    } catch (error) {
        console.error('Grant Access Fatal Error:', error);
        
        // Return full error details in development/debugging
        res.status(500).json({ 
            message: 'Internal Server Error in grantAccess controller.',
            error: error.message,
            stack: error.stack 
        });
    }
};

exports.revokeAccess = async (req, res) => {
    try {
        const { doctorId } = req.body;
        
        const patient = await User.findById(req.user.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        patient.doctorAccess = patient.doctorAccess.filter(id => id.toString() !== doctorId);
        await patient.save();
        
        res.status(200).json({ message: 'Access revoked successfully' });
    } catch (error) {
        console.error('Revoke Access Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAccessList = async (req, res) => {
    try {
        const patient = await User.findById(req.user.id).populate('doctorAccess', 'name email role');
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        // Format response for the frontend (Expected: { doctorId: { _id, name }, ... })
        const formattedList = patient.doctorAccess.map(doc => ({
            _id: doc._id,
            doctorId: {
                _id: doc._id,
                name: doc.name,
                email: doc.email
            },
            status: 'active'
        }));
        
        res.status(200).json(formattedList);
    } catch (error) {
        console.error('Get Access List Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
