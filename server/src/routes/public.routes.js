const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');

const router = express.Router();

/**
 * GET /api/v1/public/stats
 * Returns aggregated platform stats (no auth required) for the landing page.
 */
router.get('/stats', async (req, res) => {
  try {
    const [total, resolved, citizens, categories] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'resolved' }),
      User.countDocuments({ role: 'citizen' }),
      Complaint.distinct('category'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        resolved,
        citizens,
        categories: categories.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch public stats.' });
  }
});

module.exports = router;
