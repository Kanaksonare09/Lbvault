const mongoose = require('mongoose');

const reportBiomarkerSchema = new mongoose.Schema({
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Denormalized logic 
    biomarkerName: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String },
    referenceMin: { type: Number },
    referenceMax: { type: Number },
    isAbnormal: { type: Boolean, default: false },
    severity: { type: String, enum: ['Normal', 'Mild', 'Moderate', 'Critical'], default: 'Normal' },
    interpretation: { type: String }, // For AI-based reasoning when ranges are missing
    confidence: { type: Number, default: 1.0 }, 
    source: { type: String, enum: ['ai_extracted', 'lab_api', 'manual'], default: 'ai_extracted' },
    testDate: { type: Date, required: true }
}, { timestamps: true });

// Compound unique constraint so a single report doesn't have duplicate identical biomarkers
reportBiomarkerSchema.index({ reportId: 1, biomarkerName: 1 }, { unique: true });

module.exports = mongoose.model('ReportBiomarker', reportBiomarkerSchema);
