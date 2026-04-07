const ReportBiomarker = require('../models/ReportBiomarker');
const Report = require('../models/Report');

exports.getAnalytics = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Security: patients can only see their own analytics
        if (req.user.role === 'patient' && req.user.id !== patientId) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        // 1. Fetch all reports for the patient
        const reports = await Report.find({ patientId })
            .sort({ createdAt: 1 })
            .select('_id reportName testType createdAt fileUrl');

        // 2. Fetch all biomarkers for the patient (all reports)
        const biomarkers = await ReportBiomarker.find({ patientId })
            .sort({ testDate: 1 })
            .lean();

        // 3. Build per-biomarker trend lines
        // { "hemoglobin": [ { date, value, unit, severity, reportId, reportName } ] }
        const trendMap = {};
        for (const bm of biomarkers) {
            const name = bm.biomarkerName;
            if (!trendMap[name]) trendMap[name] = [];
            const report = reports.find(r => r._id.toString() === bm.reportId?.toString());
            trendMap[name].push({
                date: bm.testDate || bm.createdAt,
                value: bm.value,
                unit: bm.unit,
                severity: bm.severity,
                interpretation: bm.interpretation,
                referenceMin: bm.referenceMin,
                referenceMax: bm.referenceMax,
                reportId: bm.reportId,
                reportName: report?.reportName || 'Unknown Report'
            });
        }

        // 4. Build latest snapshot (most recent value per biomarker)
        const latestSnapshot = Object.entries(trendMap).map(([name, entries]) => {
            const latest = entries[entries.length - 1];
            return {
                name,
                ...latest,
                trend: entries.length >= 2
                    ? entries[entries.length - 1].value > entries[entries.length - 2].value
                        ? 'Increasing'
                        : entries[entries.length - 1].value < entries[entries.length - 2].value
                            ? 'Decreasing' : 'Stable'
                    : 'Stable'
            };
        });

        // 5. Risk distribution
        const riskCounts = { Normal: 0, Mild: 0, Moderate: 0, Critical: 0 };
        biomarkers.forEach(b => {
            if (riskCounts[b.severity] !== undefined) riskCounts[b.severity]++;
        });

        // 6. Build report timeline (one entry per report with its biomarkers)
        const reportTimeline = reports.map(r => {
            const reportBiomarkers = biomarkers.filter(b => b.reportId?.toString() === r._id.toString());
            return {
                _id: r._id,
                reportName: r.reportName,
                testType: r.testType,
                createdAt: r.createdAt,
                biomarkerCount: reportBiomarkers.length,
                abnormalCount: reportBiomarkers.filter(b => b.isAbnormal).length,
            };
        });

        res.status(200).json({
            totalReports: reports.length,
            totalBiomarkers: biomarkers.length,
            riskCounts,
            trendMap,
            latestSnapshot,
            reportTimeline,
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
