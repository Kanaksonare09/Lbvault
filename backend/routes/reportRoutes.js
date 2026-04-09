const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.post('/upload', authMiddleware(['pathology', 'patient']), upload.single('report'), reportController.uploadReport);
router.get('/', authMiddleware(), reportController.getReports);
router.get('/my-reports', authMiddleware(), reportController.getReports);
// Get report by ID
router.get('/:id', authMiddleware(), reportController.getReportById);

// Get exhaustive details for a report (OCR + AI + Biomarkers)
router.get('/:reportId/details', authMiddleware(), reportController.getReportDetails);
router.get('/:id/summary', authMiddleware(), reportController.getReportSummary);
router.post('/generate-voice', authMiddleware(), reportController.generateVoice);
router.get('/:id/status', authMiddleware(), reportController.getReportStatus);
router.post('/grant-access', authMiddleware('patient'), reportController.grantAccess);

module.exports = router;
