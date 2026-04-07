const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/search', authMiddleware(['pathology', 'doctor']), patientController.searchPatients);
router.post('/register', authMiddleware(['pathology']), patientController.registerPatient);
router.get('/:id/reports', authMiddleware(['patient', 'doctor', 'admin']), reportController.getPatientReports);
router.put('/:id', authMiddleware(['pathology']), patientController.updatePatient);
router.delete('/:id', authMiddleware(['pathology']), patientController.deletePatient);

module.exports = router;
