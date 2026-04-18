const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const patientController = require('../controllers/patientController');
const doctorController = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');

// Profile management
router.get('/profile', authMiddleware('doctor'), doctorController.getProfile);
router.put('/profile', authMiddleware('doctor'), doctorController.updateProfile);

// Get all reports shared with this doctor (Global feed)
router.get('/shared-reports', authMiddleware('doctor'), reportController.getSharedReportsForDoctor);

// Get list of unique patients who granted access
router.get('/patients', authMiddleware('doctor'), patientController.getAuthorizedPatients);

// Get all reports for a specific authorized patient
router.get('/patient/:patientId/reports', authMiddleware('doctor'), reportController.getPatientReportsForDoctor);

// Get a complete aggregated dashboard for a specific patient (Metadata + Trends + Intelligence)
router.get('/patient/:id/dashboard', authMiddleware('doctor'), reportController.getPatientDashboardData);

// Get historical biomarker trends for a patient
router.get('/patient/:patientId/trends', authMiddleware('doctor'), reportController.getPatientTrends);

// Add a clinical note to a specific report
router.post('/reports/:id/note', authMiddleware('doctor'), reportController.addDoctorNote);

// Doctor AI Chat — synthesize patient's entire health history
router.post('/patient/:patientId/chat', authMiddleware('doctor'), doctorController.doctorChatWithPatient);

module.exports = router;
