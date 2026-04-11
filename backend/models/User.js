const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    lvId: { type: String, unique: true, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, sparse: true },
    password: { type: String, required: true }, // Equivalent to passwordHash
    role: { type: String, enum: ['patient', 'pathology', 'doctor', 'admin', 'SuperAdmin'], required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'], default: 'APPROVED' },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    doctorAccess: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    affiliatedLabs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastLoginAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
