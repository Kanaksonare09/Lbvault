const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadCertificate } = require('../config/multerConfig');

router.post('/signup', authController.signup);
router.post('/signup/doctor', uploadCertificate.single('degreeCertificate'), authController.signup);
router.post('/login', authController.login);
router.get('/me', authMiddleware(), authController.getMe);
router.put('/profile', authMiddleware(), authController.updateProfile);
router.put('/change-password', authMiddleware(), authController.changePassword);
router.get('/search-doctors', authMiddleware(), authController.searchDoctors);

module.exports = router;
