const Complaint = require('../models/Complaint');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { uploadMultipleToCloudinary } = require('../utils/uploadImage');

/**
 * @route   POST /api/v1/complaints
 * @access  Private
 */
const createComplaint = catchAsync(async (req, res) => {
  const { title, description, category, location } = req.body;

  let images = [];
  if (req.files && req.files.length > 0) {
    images = await uploadMultipleToCloudinary(req.files);
  }

  const complaint = await Complaint.create({
    title: title.trim(),
    description: description.trim(),
    category,
    location,
    images,
    reportedBy: req.user._id,
  });

  await complaint.populate('reportedBy', 'name email role');

  res.status(201).json({
    success: true,
    message: 'Complaint created successfully.',
    data: { complaint },
  });
});

/**
 * @route   GET /api/v1/complaints
 * @access  Private
 */
const getAllComplaints = catchAsync(async (req, res) => {
  const { status, category, page = 1, limit = 10 } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (category) filter.category = category;

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
 * @route   GET /api/v1/complaints/my
 * @access  Private
 */
const getMyComplaints = catchAsync(async (req, res) => {
  const { status, category, page = 1, limit = 10 } = req.query;

  const filter = { reportedBy: req.user._id };

  if (status) filter.status = status;
  if (category) filter.category = category;

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
 * @route   GET /api/v1/complaints/:id
 * @access  Private
 */
const getComplaintById = catchAsync(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('reportedBy', 'name email role')
    .populate('statusHistory.changedBy', 'name email role');

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  const isOwner = complaint.reportedBy._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to view this complaint.');
  }

  res.status(200).json({
    success: true,
    data: { complaint },
  });
});

/**
 * @route   PUT /api/v1/complaints/:id
 * @access  Private (owner or admin)
 */
const updateComplaint = catchAsync(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  const isOwner = complaint.reportedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not allowed to update this complaint.');
  }

  // Citizens can only edit if status = pending
  if (!isAdmin && complaint.status !== 'pending') {
    throw new ApiError(400, 'You can only edit complaints when they are pending.');
  }

  if (isOwner && !isAdmin && req.body.status !== undefined) {
    throw new ApiError(403, 'You cannot change complaint status.');
  }

  // Upload and append new images (max 5 total)
  if (req.files && req.files.length > 0) {
    const newImages = await uploadMultipleToCloudinary(req.files);
    const combinedImages = [...complaint.images, ...newImages];

    if (combinedImages.length > 5) {
      throw new ApiError(
        400,
        `Maximum 5 images allowed. This complaint already has ${complaint.images.length} image(s).`
      );
    }

    complaint.images = combinedImages;
  }

  const allowedFields = ['title', 'description', 'category', 'location'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === 'title' || field === 'description') {
        complaint[field] = req.body[field].trim();
      } else if (field === 'location') {
        // Handle parsing if it is passed as a string or an object
        let locationData = req.body.location;
        if (typeof locationData === 'string') {
          try {
            locationData = JSON.parse(locationData);
          } catch {
            locationData = {};
          }
        }
        Object.keys(locationData).forEach((key) => {
          complaint.location[key] = locationData[key];
        });
        complaint.markModified('location');
      } else {
        complaint[field] = req.body[field];
      }
    }
  });

  await complaint.save();
  await complaint.populate('reportedBy', 'name email role');

  res.status(200).json({
    success: true,
    message: 'Complaint updated successfully.',
    data: { complaint },
  });
});

/**
 * @route   DELETE /api/v1/complaints/:id
 * @access  Private (owner or admin)
 */
const deleteComplaint = catchAsync(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    throw new ApiError(404, 'Complaint not found.');
  }

  const isOwner = complaint.reportedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not allowed to delete this complaint.');
  }

  // Citizens can only delete if status = pending
  if (!isAdmin && complaint.status !== 'pending') {
    throw new ApiError(400, 'You can only delete complaints when they are pending.');
  }

  await complaint.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Complaint deleted successfully.',
  });
});

module.exports = {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
};
