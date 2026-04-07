require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/labvault_final', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB...');

        const adminEmail = 'admin@labvault.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists. Skipping...');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        const admin = new User({
            name: 'Root SuperAdmin',
            email: adminEmail,
            password: hashedPassword,
            role: 'SuperAdmin',
            lvId: 'ADM-001',
            status: 'APPROVED',
            isVerified: true
        });

        await admin.save();
        console.log('SuperAdmin created successfully!');
        console.log('Email: admin@labvault.com');
        console.log('Password: Admin@123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
