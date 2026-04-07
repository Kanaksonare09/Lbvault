/**
 * LabVault Admin Seed Script
 * Creates the default admin account in MongoDB.
 * Run once: node scripts/seedAdmin.js
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/labvault';

const userSchema = new mongoose.Schema({
    lvId:      { type: String, unique: true, required: true },
    email:     { type: String, required: true, unique: true },
    phone:     { type: String },
    password:  { type: String, required: true },
    role:      { type: String, enum: ['patient', 'pathology', 'doctor', 'admin'], required: true },
    name:      { type: String, required: true },
    isActive:  { type: Boolean, default: true },
    isVerified:{ type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const ADMIN = {
    email:    'admin@labvault.com',
    password: 'Admin@123',
    name:     'LabVault Admin',
    role:     'admin',
    lvId:     'LV-ADMIN-001',
    isVerified: true,
};

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB:', MONGODB_URI);

        const existing = await User.findOne({ email: ADMIN.email });
        if (existing) {
            console.log('⚠️  Admin account already exists:');
            console.log(`   Email   : ${ADMIN.email}`);
            console.log(`   Password: ${ADMIN.password}`);
            console.log(`   Role    : ${existing.role}`);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(ADMIN.password, salt);

        await User.create({ ...ADMIN, password: hashed });

        console.log('');
        console.log('🎉 Admin account created successfully!');
        console.log('─────────────────────────────────────');
        console.log(`   Email   : ${ADMIN.email}`);
        console.log(`   Password: ${ADMIN.password}`);
        console.log(`   Role    : admin`);
        console.log(`   LV-ID   : ${ADMIN.lvId}`);
        console.log('─────────────────────────────────────');
        console.log('');
    } catch (err) {
        console.error('❌ Seed Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
