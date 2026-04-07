const Report = require('../models/Report');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const ReportBiomarker = require('../models/ReportBiomarker');
const ReportAiAnalysis = require('../models/ReportAiAnalysis');
const ReportAccess = require('../models/ReportAccess');
const aiService = require('../services/aiService');
const ttsService = require('../services/ttsService');

exports.uploadReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const { patientId, patientLvId, reportName, testType } = req.body;
        
        let patient;
        // If a pathology is uploading, they must supply the patient identifier
        if (req.user.role === 'pathology') {
            if (patientId) {
                patient = await User.findOne({ _id: patientId, role: 'patient' });
            } else if (patientLvId) {
                patient = await User.findOne({ lvId: patientLvId, role: 'patient' });
            }
        } else {
            // Otherwise, it is a patient uploading their own file
            patient = await User.findById(req.user.id);
        }

        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const fileUrl = `/uploads/reports/${req.file.filename}`;

        // 1. Create Core Report
        const report = new Report({
            patientId: patient._id,
            lvId: patient.lvId,
            uploadedBy: req.user.id,
            uploadedByRole: req.user.role,
            pathologyId: req.user.role === 'pathology' ? req.user.id : null,
            reportName,
            testType,
            fileUrl,
        });

        await report.save();

        // 2. Synchronous AI Pipeline (Wait for results so user sees them in one click)
        try {
            const path = require('path');
            const fs = require('fs');
            const absoluteFilePath = path.join(__dirname, '..', report.fileUrl.replace(/^\//, ''));
            console.log(`[SYNC PIPELINE] Pushing document to AI Engine: ${absoluteFilePath}`);

            let geminiResult;
            if (fs.existsSync(absoluteFilePath)) {
                geminiResult = await aiService.extractBiomarkersFromDocument(absoluteFilePath);
            }

            if (!geminiResult) throw new Error("Document analysis failed.");

            const extractedText = geminiResult.rawOcrText || "Raw extracted text for " + reportName;
            const aiBiomarkers = geminiResult.biomarkers || [];
            const clinicalSummary = geminiResult.summary || "No summary generated.";

            // Save extracted Biomarkers to NoSQL Relation
            for (const b of aiBiomarkers) {
                try {
                    const val = Number(b.value) || 0;
                    
                    // Normalize severity to valid enum values
                    const raw = (b.severity || 'Normal').toLowerCase();
                    let severity = 'Normal';
                    if (raw.includes('critical') || raw.includes('danger')) severity = 'Critical';
                    else if (raw.includes('moderate') || raw.includes('elevated') || raw.includes('high') || raw.includes('low')) severity = 'Moderate';
                    else if (raw.includes('mild') || raw.includes('slight') || raw.includes('border')) severity = 'Mild';

                    // TREND ANALYSIS
                    const lastResult = await ReportBiomarker.findOne({ 
                        patientId: patient._id, 
                        biomarkerName: String(b.name || 'Unknown').toLowerCase() 
                    }).sort({ testDate: -1 });

                    let trend = 'Stable';
                    if (lastResult) {
                        if (val > lastResult.value) trend = 'Increasing';
                        else if (val < lastResult.value) trend = 'Decreasing';
                    }

                    await ReportBiomarker.create({
                        reportId: report._id,
                        patientId: patient._id,
                        biomarkerName: String(b.name || 'Unknown').toLowerCase(),
                        value: val,
                        unit: String(b.unit || ''),
                        referenceMin: b.min || 0,
                        referenceMax: b.max || 0,
                        isAbnormal: severity !== 'Normal',
                        severity,
                        interpretation: b.interpretation || `Value detected as ${trend.toLowerCase()}.`,
                        confidence: b.confidence || 0.9,
                        source: 'ai_extracted',
                        testDate: report.createdAt
                    });
                } catch (bioErr) {
                    console.warn(`[SYNC PIPELINE] Skipping biomarker "${b.name}":`, bioErr.message);
                }
            }

            console.log(`[SYNC PIPELINE] Saving Clinical Observation...`);
            
            await ReportAiAnalysis.findOneAndUpdate(
                { reportId: report._id },
                { ocrText: extractedText, summaryEn: clinicalSummary },
                { upsert: true, new: true }
            );

            console.log(`[SYNC PIPELINE] Fully complete for Report ${report._id}`);
        } catch (pipelineErr) {
            console.error('[SYNC PIPELINE ERROR]:', pipelineErr.message);
        }

        // 3. Respond only AFTER analysis is ready
        res.status(201).json({ 
            message: 'Report uploaded and analyzed!', 
            report: {
                ...report.toObject(),
                processingStatus: 'completed'
            } 
        });
    } catch (error) {
        console.error('Upload Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server Error' });
        }
    }
};

exports.getReports = async (req, res) => {
    try {
        let query = { isDeleted: false };
        if (req.user.role === 'patient') {
            query.patientId = req.user.id;
        } else if (req.user.role === 'pathology') {
            query.pathologyId = req.user.id;
        } else if (req.user.role === 'doctor') {
            // Find reports this doctor has access to
            const access = await ReportAccess.find({ doctorId: req.user.id, status: 'approved' }).select('reportId');
            const reportIds = access.map(a => a.reportId);
            query._id = { $in: reportIds };
        } // admin sees all

        // Note: For full robustness, you might populate patientId and pathologyId 
        const reports = await Report.find(query)
            .sort({ reportDate: -1 })
            .populate('patientId', 'name lvId email')
            .populate('pathologyId', 'name lvId'); // name refers to labName via users table
            
        res.status(200).json(reports);
    } catch (error) {
        console.error('Get Reports Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('patientId', 'name lvId email')
            .lean(); // Return plain object so we can attach relational data
            
        if (!report) return res.status(404).json({ message: 'Report not found' });

        // Fetch associated relational data
        const biomarkers = await ReportBiomarker.find({ reportId: report._id });
        const aiAnalysis = await ReportAiAnalysis.findOne({ reportId: report._id });

        // Map back to legacy frontend format temporarily until frontend is fully migrated
        const responseData = {
            ...report,
            extractedData: biomarkers.reduce((acc, b) => ({ ...acc, [b.biomarkerName]: b.value }), {}),
            biomarkers: biomarkers, // Added so new Insights page can render range bars
            aiSummary: aiAnalysis?.summaryEn || null,
            voiceSummaryUrl: aiAnalysis?.audioUrls?.get('en') || null
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Get Report By Id Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getReportSummary = async (req, res) => {
    try {
        let analysis = await ReportAiAnalysis.findOne({ reportId: req.params.id });
        if (!analysis) {
            analysis = await ReportAiAnalysis.findOneAndUpdate(
                { reportId: req.params.id },
                { ocrText: 'Missing OCR data.', summaryEn: '' },
                { upsert: true, new: true }
            );
        }
        
        const language = req.query.lang || 'en';
        const force = req.query.force === 'true';

        // Use the new single-pass engine if summary is missing OR force-recalculating
        if (!analysis.summaryEn || force || (language !== 'en' && !analysis.translations.get(language))) {
            console.log(`[AI CONTROLLER] Generating/Updating analysis for ${req.params.id}...`);
            const result = await aiService.analyzeReportUniversal(analysis.ocrText, language);
            
            if (language === 'en') {
                analysis.summaryEn = result.summary;
            } else {
                if (!analysis.translations) analysis.translations = new Map();
                analysis.translations.set(language, result.summary);
            }
            await analysis.save();
        }
        
        const summary = language === 'en' ? analysis.summaryEn : analysis.translations.get(language);
        const voiceUrl = analysis.audioUrls?.get(language);

        res.status(200).json({ summary, voiceSummaryUrl: voiceUrl });
    } catch (error) {
        console.error('Summary Generation Fatal:', error.message);
        res.status(500).json({ message: 'AI processing failed locally. Please check Ollama logs.' });
    }
};

exports.generateVoice = async (req, res) => {
    try {
        const { reportId, language, text } = req.body;
        const rewriteService = require('../services/rewriteService');
        const scriptService = require('../services/scriptService');

        let summaryText = text;
        let analysis = reportId ? await ReportAiAnalysis.findOne({ reportId }) : null;

        if (!analysis && reportId) {
            analysis = await ReportAiAnalysis.findOneAndUpdate(
                { reportId },
                { ocrText: 'Regenerating insights.', summaryEn: '' },
                { upsert: true, new: true }
            );
        }

        // Step 1: Get the base summary text
        if (!summaryText && analysis) {
            summaryText = language === 'en' ? analysis.summaryEn : analysis.translations?.get(language);
            if (!summaryText) {
                const result = await aiService.analyzeReportUniversal(analysis.ocrText, language);
                summaryText = result.summary;
                if (language === 'en') analysis.summaryEn = summaryText;
                else {
                    if (!analysis.translations) analysis.translations = new Map();
                    analysis.translations.set(language, summaryText);
                }
                await analysis.save();
            }
        }

        if (!summaryText) return res.status(400).json({ message: 'No summary text available.' });

        // Step 2: EMPATHY LAYER — Rewrite as a warm, doctor-like message
        const langCode = language?.toLowerCase().includes('hi') ? 'hi'
            : language?.toLowerCase().includes('mr') ? 'mr'
            : language?.toLowerCase().includes('te') ? 'te' : 'en';

        console.log(`[VOICE PIPELINE] Applying Empathy Layer for language: ${langCode}`);
        const empatheticText = await rewriteService.rewriteAsEmpathetic(summaryText, langCode);

        // Step 3: SCRIPT GENERATOR — Build structured voice script
        const voiceScript = scriptService.buildVoiceScript(empatheticText, langCode);
        console.log(`[VOICE PIPELINE] Voice script (${voiceScript.length} chars) ready for TTS.`);

        // Step 4: TTS — Convert script to audio
        const audioUrl = await ttsService.generateAndStoreAudio(voiceScript, langCode);

        // Step 5: Save everything to DB
        if (analysis) {
            if (!analysis.audioUrls) analysis.audioUrls = new Map();
            analysis.audioUrls.set(langCode, audioUrl);
            // Cache the voice script too
            if (!analysis.translations) analysis.translations = new Map();
            analysis.translations.set(`script_${langCode}`, voiceScript);
            await analysis.save();
        }

        res.status(200).json({
            audioUrl,
            voiceScript,
            empatheticSummary: empatheticText,
            language: langCode
        });
    } catch (error) {
        console.error('Voice Generation Error:', error.message);
        res.status(500).json({ message: 'Voice generation failed. Please try again.' });
    }
};

exports.grantAccess = async (req, res) => {
    try {
        const { reportId, doctorId } = req.body;
        
        const report = await Report.findOne({ _id: reportId, patientId: req.user.id });
        if (!report) return res.status(404).json({ message: 'Report not found' });

        await ReportAccess.findOneAndUpdate(
            { reportId, doctorId },
            { patientId: req.user.id, status: 'approved' },
            { upsert: true, new: true }
        );

        res.status(200).json({ message: 'Access granted successfully' });
    } catch (error) {
        console.error('Grant Access Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
