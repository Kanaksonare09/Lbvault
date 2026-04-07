const express = require('express');
const router = express.Router();
const pathologyController = require('../controllers/pathologyController');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware('pathology'), pathologyController.getProfile);
router.put('/profile', authMiddleware('pathology'), pathologyController.updateProfile);
router.get('/analytics', authMiddleware('pathology'), dashboardController.getPathologyAnalytics);
router.get('/doctors', authMiddleware('pathology'), pathologyController.getAffiliatedDoctors);

module.exports = router;
