const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const generateLvId = require('../utils/generateLvId');
const PatientProfile = require('../models/PatientProfile');
const PathologyProfile = require('../models/PathologyProfile');
const DoctorProfile = require('../models/DoctorProfile');

exports.signup = async (req, res) => {
    try {
        const { 
            name, email, password, role, 
            medicalLicenseNumber, hospitalName, specialization, 
            labName, registrationNumber, address 
        } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Set status based on role
        const { affiliatedLabId } = req.body;
        let status = 'APPROVED';
        if ((role === 'doctor' || role === 'pathology') && !affiliatedLabId) {
            status = 'PENDING';
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate LV-ID
        const lvId = await generateLvId();

        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            lvId,
            status,
            affiliatedLabs: affiliatedLabId ? [affiliatedLabId] : []
        });

        await user.save();

        // Establish the relational 1:1 profile
        if (role === 'patient') {
            await PatientProfile.create({ userId: user._id });
        } else if (role === 'pathology') {
            await PathologyProfile.create({ 
                userId: user._id, 
                labName: labName || name, 
                licenseNumber: registrationNumber || `PENDING-${Date.now()}` 
            });
        } else if (role === 'doctor') {
            const licenseCertificateUrl = req.file ? `/uploads/certificates/${req.file.filename}` : '';
            await DoctorProfile.create({ 
                userId: user._id, 
                specialty: specialization,
                registrationNumber: medicalLicenseNumber || `PENDING-${Date.now()}`,
                hospitalName: hospitalName,
                licenseCertificateUrl: licenseCertificateUrl
            });
        }

        // Return token only if status is APPROVED
        if (status === 'APPROVED') {
            const token = jwt.sign({ id: user._id, role: user.role, lvId: user.lvId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
            return res.status(201).json({ token, user: { _id: user._id, name, email, role, lvId, status } });
        } else {
            // For PENDING status, return success without token
            return res.status(201).json({ 
                message: 'Registration successful! Your account is pending admin approval.',
                user: { _id: user._id, name, email, role, lvId, status } 
            });
        }
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // ROLE-BASED STATUS CHECK: Block PENDING users for Doctors and Pathology
        if ((user.role === 'doctor' || user.role === 'pathology') && user.status !== 'APPROVED') {
            return res.status(403).json({ 
                success: false,
                message: 'Your account is pending admin approval. You will be notified once verified.',
                status: user.status 
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role, lvId: user.lvId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

        res.status(200).json({ token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, lvId: user.lvId, status: user.status } });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Also fetch patient profile for extended fields
        const PatientProfile = require('../models/PatientProfile');
        const profile = await PatientProfile.findOne({ userId: req.user.id }).lean();
        
        res.status(200).json({ ...user.toObject(), profile: profile || {} });
    } catch (error) {
        console.error('Get Me Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, dateOfBirth, gender, bloodGroup, emergencyContactName, emergencyContactPhone, preferredLanguage } = req.body;

        // Update User core fields
        const userUpdates = {};
        if (name) userUpdates.name = name.trim();
        if (phone !== undefined) userUpdates.phone = phone;
        if (address !== undefined) userUpdates.address = address;

        if (Object.keys(userUpdates).length > 0) {
            await User.findByIdAndUpdate(req.user.id, userUpdates);
        }

        // Update PatientProfile extended fields
        const PatientProfile = require('../models/PatientProfile');
        const profileUpdates = {};
        if (dateOfBirth !== undefined) profileUpdates.dateOfBirth = dateOfBirth || null;
        if (gender !== undefined) profileUpdates.gender = gender;
        if (bloodGroup !== undefined) profileUpdates.bloodGroup = bloodGroup;
        if (emergencyContactName !== undefined) profileUpdates.emergencyContactName = emergencyContactName;
        if (emergencyContactPhone !== undefined) profileUpdates.emergencyContactPhone = emergencyContactPhone;
        if (preferredLanguage !== undefined) profileUpdates.preferredLanguage = preferredLanguage;

        await PatientProfile.findOneAndUpdate(
            { userId: req.user.id },
            profileUpdates,
            { upsert: true, new: true }
        );

        const updatedUser = await User.findById(req.user.id).select('-password');
        const profile = await PatientProfile.findOne({ userId: req.user.id }).lean();

        res.status(200).json({ message: 'Profile updated successfully', user: { ...updatedUser.toObject(), profile: profile || {} } });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new password are required.' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters.' });
        }

        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Change Password Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.searchDoctors = async (req, res) => {
    try {
        const query = req.query.query || '';
        const searchCriteria = {
            role: 'doctor',
            status: 'APPROVED',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        };

        const doctors = await User.find(searchCriteria).select('name email lvId avatarUrl');
        
        // Manually populate common doctor profile fields
        const DoctorProfile = require('../models/DoctorProfile');
        const doctorsWithProfiles = await Promise.all(doctors.map(async (doc) => {
            const profile = await DoctorProfile.findOne({ userId: doc._id }).select('specialty hospitalName');
            return {
                ...doc.toObject(),
                specialty: profile?.specialty || 'Healthcare Provider',
                hospitalName: profile?.hospitalName || 'Clinic'
            };
        }));

        res.status(200).json(doctorsWithProfiles);
    } catch (error) {
        console.error('Search Doctors Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
