const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');

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
