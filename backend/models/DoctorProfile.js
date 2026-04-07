const mongoose = require('mongoose');

const doctorProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    specialty: { type: String },
    degree: { type: String },
    experienceYears: { type: String },
    registrationNumber: { type: String, unique: true, required: true },
    clinicName: { type: String },
    hospitalName: { type: String },
    clinicAddress: { type: String },
    contactEmail: { type: String },
    isVerified: { type: Boolean, default: false },
    isErDoctor: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
