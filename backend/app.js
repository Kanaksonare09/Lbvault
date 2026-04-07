require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Additional prefix overrides for frontend compatibility
app.use('/api/patient/reports', reportRoutes);

const reportController = require('./controllers/reportController');
const authMiddleware = require('./middleware/authMiddleware');

// Backwards compatibility for frontend
app.post('/api/voice', authMiddleware(), reportController.generateVoice);

// New unified instruction routes
app.post('/api/ai/audio', authMiddleware(), reportController.generateVoice);

// Ask AI — patient chat with their report context
const aiController = require('./controllers/aiController');
app.post('/api/ai/ask', authMiddleware(), aiController.askAI);

app.use('/api/analytics', analyticsRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const accessRoutes = require('./routes/accessRoutes');
app.use('/api/access', accessRoutes);

const patientRoutes = require('./routes/patientRoutes');
app.use('/api/patients', patientRoutes);

// Doctor routes basic stub mapping until fully implemented
app.get('/api/doctor/patients', authMiddleware('doctor'), (req, res) => res.json([]));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

module.exports = app;
