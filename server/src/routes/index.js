const express = require('express');
const authRoutes = require('./auth.routes');
const complaintRoutes = require('./complaint.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin', adminRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CivicPulse API is running.',
  });
});

module.exports = router;
