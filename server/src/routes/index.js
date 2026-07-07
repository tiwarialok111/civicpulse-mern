const express = require('express');
const authRoutes = require('./auth.routes');
const complaintRoutes = require('./complaint.routes');
const adminRoutes = require('./admin.routes');
const publicRoutes = require('./public.routes');
const profileRoutes = require('./profile.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);
router.use('/profile', profileRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CivicPulse API is running.',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

module.exports = router;

