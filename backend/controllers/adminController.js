const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notificationController');

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, role: 'SuperAdmin' });
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed: Invalid credentials or insufficient permissions.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Authentication failed: Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, lvId: user.lvId },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ 
            status: 'PENDING', 
            role: { $in: ['doctor', 'pathology'] } 
        }).select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pendingUsers.length,
            users: pendingUsers
        });
    } catch (error) {
        console.error('Get Pending Users Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.approveUser = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.status !== 'PENDING') {
            return res.status(400).json({ message: `User is already ${user.status}` });
        }

        if (!['doctor', 'pathology'].includes(user.role)) {
            return res.status(400).json({ message: 'This user role does not require approval or is invalid for this action.' });
        }

        user.status = 'APPROVED';
        user.isVerified = true; // Auto-verify on approval
        await user.save();

        // TRIGGER NOTIFICATION: Doctor notified of approval
        await createNotification({
            recipient: user._id,
            actor: req.user.id,
            type: 'account_approved',
            message: 'Welcome! Your medical professional account has been approved and is now active.',
            link: '/dashboard/doctor'
        });

        // Optional: Log who performed the action (req.user.id)
        console.log(`[ADMIN ACTION] User ${userId} APPROVED by Admin ${req.user.id} at ${new Date().toISOString()}`);

        res.status(200).json({
            success: true,
            message: 'User approved successfully',
            user: { id: user._id, status: user.status }
        });
    } catch (error) {
        console.error('Approve User Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.rejectUser = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.status !== 'PENDING') {
            return res.status(400).json({ message: `User is already ${user.status}` });
        }

        user.status = 'REJECTED';
        await user.save();

        console.log(`[ADMIN ACTION] User ${userId} REJECTED by Admin ${req.user.id} at ${new Date().toISOString()}`);

        res.status(200).json({
            success: true,
            message: 'User rejected successfully',
            user: { id: user._id, status: user.status }
        });
    } catch (error) {
        console.error('Reject User Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.suspendUser = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only doctors and labs can be suspended (not SuperAdmin)
        if (user.role === 'SuperAdmin') {
            return res.status(400).json({ message: 'Cannot suspend a SuperAdmin' });
        }

        user.status = 'SUSPENDED';
        await user.save();

        console.log(`[ADMIN ACTION] User ${userId} SUSPENDED by Admin ${req.user.id} at ${new Date().toISOString()}`);

        res.status(200).json({
            success: true,
            message: 'User suspended successfully',
            user: { id: user._id, status: user.status }
        });
    } catch (error) {
        console.error('Suspend User Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
