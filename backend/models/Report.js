const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lvId: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedByRole: { type: String, enum: ['patient', 'pathology', 'api', 'doctor'], required: true },
    pathologyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User where role=pathology
    reportName: { type: String, required: true },
    testType: { type: String }, // e.g., 'Complete Blood Count'
    category: { type: String, enum: ['blood', 'urine', 'imaging', 'biopsy', 'other'], default: 'other' },
    fileUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    reportDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['processing', 'ready', 'failed'], default: 'processing' },
    isDeleted: { type: Boolean, default: false },
    doctorNotes: [{
        note: { type: String, required: true },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
