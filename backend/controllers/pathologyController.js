const PathologyProfile = require('../models/PathologyProfile');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Get base user info
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 2. Get pathology profile
        let profile = await PathologyProfile.findOne({ userId });
        
        // If profile doesn't exist, provide a skeleton
        if (!profile) {
            return res.status(200).json({
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                labName: user.name || 'Your Lab Name',
                licenseNumber: 'Not specified',
                address: 'Not specified',
                city: 'Not specified',
                isVerified: false
            });
        }

        // 3. Return aggregated profile
        res.status(200).json({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            labName: profile.labName || user.name,
            licenseNumber: profile.licenseNumber || 'Not specified',
            address: profile.address || 'Not specified',
            city: profile.city || 'Not specified',
            isVerified: profile.isVerified,
            paymentPlan: profile.paymentPlan
        });
    } catch (error) {
        console.error('Get Pathology Profile Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { labName, phone, licenseNumber, address, city } = req.body;

        // 1. Update base User info (phone)
        await User.findByIdAndUpdate(userId, { phone });

        // 2. Update/Create pathology profile
        const profileUpdates = {
            labName,
            licenseNumber,
            address,
            city
        };

        const profile = await PathologyProfile.findOneAndUpdate(
            { userId },
            { $set: profileUpdates },
            { new: true, upsert: true }
        );

        res.status(200).json({
            success: true,
            message: 'Lab profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('Update Pathology Profile Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAffiliatedDoctors = async (req, res) => {
    try {
        const labId = req.user.id;
        
        const doctors = await User.find({
            role: 'doctor',
            affiliatedLabs: labId
        }).select('name email phone specialty status registrationNumber licenseNumber');

        res.status(200).json(doctors);
    } catch (error) {
        console.error('Get Affiliated Doctors Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
