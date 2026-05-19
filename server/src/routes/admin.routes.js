const express = require('express');
const {
  getStats,
  getAdminComplaints,
  updateComplaintStatus,
  updateComplaintPriority,
  deleteComplaintAdmin,
} = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

// Require login and admin role for all admin routes
router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getStats);
router.get('/stats', getStats); // Keep support for both stats and dashboard
router.get('/complaints', getAdminComplaints);
router.put('/complaints/:id/status', updateComplaintStatus);
router.put('/complaints/:id/priority', updateComplaintPriority);
router.delete('/complaints/:id', deleteComplaintAdmin);

module.exports = router;
