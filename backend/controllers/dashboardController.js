const Report = require('../models/Report');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getPathologyAnalytics = async (req, res) => {
    try {
        console.log('Fetching Pathology Analytics for:', req.user?.id);
        const pathologyId = req.user.id;

        // 1. Core KPIs
        const totalReports = await Report.countDocuments({ uploadedBy: pathologyId });
        const uniquePatients = await Report.distinct('patientId', { uploadedBy: pathologyId });
        const totalPatients = uniquePatients.length;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const uploadedToday = await Report.countDocuments({ uploadedBy: pathologyId, createdAt: { $gte: startOfDay } });

        // 2. Volume Trend (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const volumeHistory = await Report.aggregate([
            {
                $match: {
                    uploadedBy: new mongoose.Types.ObjectId(pathologyId),
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // 3. Category Distribution (Pie Chart)
        const categoryDistribution = await Report.aggregate([
            { $match: { uploadedBy: new mongoose.Types.ObjectId(pathologyId) } },
            {
                $group: {
                    _id: "$testType",
                    value: { $sum: 1 }
                }
            },
            { $project: { name: "$_id", value: 1, _id: 0 } }
        ]);

        // 4. Recent Reports
        const recentReports = await Report.find({ uploadedBy: pathologyId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('patientId', 'name');

        const recentUploads = recentReports.map(r => ({
            reportId: r._id,
            patientName: r.patientId ? r.patientId.name : 'Unknown',
            testType: r.testType || 'General',
            uploadDate: r.createdAt,
            fileUrl: r.fileUrl
        }));

        res.status(200).json({
            uploadedToday,
            reportTrend: "+12%",
            totalPatients,
            patientTrend: "+5%",
            totalReports,
            systemStatus: "Active",
            volumeHistory,
            categoryDistribution,
            recentUploads
        });
    } catch (error) {
        console.error('Dashboard Analytics Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
