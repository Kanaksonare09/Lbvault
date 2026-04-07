const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware(), authController.getMe);
router.put('/profile', authMiddleware(), authController.updateProfile);
router.put('/change-password', authMiddleware(), authController.changePassword);

module.exports = router;
