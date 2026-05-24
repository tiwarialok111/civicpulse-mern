const mongoose = require('mongoose');

const COMPLAINT_CATEGORIES = [
  'Road Damage',
  'Garbage',
  'Water Leakage',
  'Street Light',
  'Drainage',
  'Traffic',
];

const COMPLAINT_STATUSES = ['pending', 'in-progress', 'resolved', 'rejected'];
const COMPLAINT_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: COMPLAINT_CATEGORIES,
        message: 'Invalid category',
      },
    },
    status: {
      type: String,
      enum: {
        values: COMPLAINT_STATUSES,
        message: 'Invalid status',
      },
      default: 'pending',
    },
    priority: {
      type: String,
      enum: {
        values: COMPLAINT_PRIORITIES,
        message: 'Invalid priority',
      },
      default: 'medium',
    },
    adminRemark: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: COMPLAINT_STATUSES,
          required: true,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          default: '',
        },
      },
    ],
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180'],
      },
    },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
      ],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'You can upload a maximum of 5 images',
      },
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful indexes for common queries
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
module.exports.COMPLAINT_CATEGORIES = COMPLAINT_CATEGORIES;
module.exports.COMPLAINT_STATUSES = COMPLAINT_STATUSES;
module.exports.COMPLAINT_PRIORITIES = COMPLAINT_PRIORITIES;
