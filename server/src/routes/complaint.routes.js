const express = require('express');
const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaint.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadComplaintImages } = require('../middleware/upload.middleware');
const {
  validateCreateComplaint,
  validateUpdateComplaint,
} = require('../middleware/validateComplaint.middleware');

const router = express.Router();

// All complaint routes require login
router.use(protect);

// Multer runs first, then validation, then controller
router.post(
  '/',
  uploadComplaintImages,
  validateCreateComplaint,
  createComplaint
);

router.get('/', getAllComplaints);
router.get('/my', getMyComplaints);
router.get('/:id', getComplaintById);

router.put(
  '/:id',
  uploadComplaintImages,
  validateUpdateComplaint,
  updateComplaint
);

router.delete('/:id', deleteComplaint);

module.exports = router;
