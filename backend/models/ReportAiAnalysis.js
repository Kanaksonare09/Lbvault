const mongoose = require('mongoose');

const reportAiAnalysisSchema = new mongoose.Schema({
    reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', unique: true, required: true },
    ocrText: { type: String, default: '' },
    summaryEn: { type: String, default: '' },
    insightsEn: { type: String, default: '' },
    doctorBriefEn: { type: String, default: '' },
    suggestions: [{ type: String }],
    translations: { type: Map, of: String, default: {} },
    audioUrls: { type: Map, of: String, default: {} },
    modelVersion: { type: String },
    generatedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('ReportAiAnalysis', reportAiAnalysisSchema);
