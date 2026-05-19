const Complaint = require('../models/Complaint');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * @route   GET /api/v1/admin/stats (and /admin/dashboard)
 * @access  Admin
 */
const getStats = catchAsync(async (req, res) => {
  const [total, pending, inProgress, resolved, rejected] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'pending' }),
    Complaint.countDocuments({ status: 'in-progress' }),
    Complaint.countDocuments({ status: 'resolved' }),
    Complaint.countDocuments({ status: 'rejected' }),
  ]);

  const recentComplaints = await Complaint.find()
    .populate('reportedBy', 'name email role')
    .sort({ createdAt: -1 })
    .limit(5);

  const categoryStats = await Complaint.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      recentComplaints,
      categoryStats,
    },
  });
});

/**
 * @route   GET /api/v1/admin/complaints
 * @access  Admin
 */
const getAdminComplaints = catchAsync(async (req, res) => {
  const { status, category, search, priority, page = 1, limit = 10 } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { title: regex },
      { description: regex },
      { 'location.address': regex },
    ];
  }

  const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
  const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
  const skip = (pageNumber - 1) * limitNumber;

  const [complaints, total] = await Promise.all([
    Complaint.find(filter)
      .populate('reportedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber),
    Complaint.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: complaints.length,
    data: {
      complaints,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    },
  });
});

/**
 * @route   PUT /api/v1/admin/complaints/:id/status
 * @access  Admin
 */
const updateComplaintStatus = catchAsync(async (req, res) => {
  const { status, remark } = req.body;

  if (!status) {
    throw new ApiError(400, 'Please provide status.');
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  complaint.status = status;
  complaint.updatedBy = req.user._id;

  if (status === 'resolved') {
    complaint.resolvedAt = new Date();
  } else {
    complaint.resolvedAt = undefined;
  }

  if (remark !== undefined) {
    complaint.adminRemark = remark;
  }

  // Push to statusHistory
  complaint.statusHistory.push({
    status,
    changedBy: req.user._id,
    timestamp: new Date(),
    note: remark || `Status changed to ${status}`,
  });

  await complaint.save();
  await complaint.populate('reportedBy', 'name email role');
  await complaint.populate('statusHistory.changedBy', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Complaint status updated successfully.',
    data: { complaint },
  });
});

/**
 * @route   PUT /api/v1/admin/complaints/:id/priority
 * @access  Admin
 */
const updateComplaintPriority = catchAsync(async (req, res) => {
  const { priority } = req.body;

  if (!priority) {
    throw new ApiError(400, 'Please provide priority.');
  }

  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  complaint.priority = priority;
  complaint.updatedBy = req.user._id;

  await complaint.save();
  await complaint.populate('reportedBy', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Complaint priority updated successfully.',
    data: { complaint },
  });
});

/**
 * @route   DELETE /api/v1/admin/complaints/:id
 * @access  Admin
 */
const deleteComplaintAdmin = catchAsync(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  await complaint.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Complaint deleted successfully.',
  });
});

module.exports = {
  getStats,
  getAdminComplaints,
  updateComplaintStatus,
  updateComplaintPriority,
  deleteComplaintAdmin,
};
