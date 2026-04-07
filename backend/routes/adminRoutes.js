const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Admin Routes
router.post('/login', adminController.adminLogin);

// Protected Admin Routes (SuperAdmin Only)
router.get('/pending-users', authMiddleware('SuperAdmin'), adminController.getPendingUsers);
router.post('/approve-user', authMiddleware('SuperAdmin'), adminController.approveUser);
router.post('/reject-user', authMiddleware('SuperAdmin'), adminController.rejectUser);

module.exports = router;
