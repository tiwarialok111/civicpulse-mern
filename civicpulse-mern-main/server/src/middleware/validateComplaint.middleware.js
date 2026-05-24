const ApiError = require('../utils/ApiError');
const {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
} = require('../models/Complaint');

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidNumber = (value) =>
  typeof value === 'number' && !Number.isNaN(value);

/**
 * Parse multipart form fields into usable values.
 * Location can be sent as JSON string or separate fields.
 */
const parseMultipartFields = (req) => {
  if (typeof req.body.location === 'string') {
    try {
      req.body.location = JSON.parse(req.body.location);
    } catch {
      // validation will catch invalid location
    }
  } else if (
    req.body.address !== undefined ||
    req.body.latitude !== undefined ||
    req.body.longitude !== undefined
  ) {
    req.body.location = {
      address: req.body.address,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    };
  }
};

/**
 * Validate request body when creating a complaint.
 */
const validateCreateComplaint = (req, res, next) => {
  parseMultipartFields(req);

  const { title, description, category, location } = req.body;
  const errors = [];

  if (!isNonEmptyString(title)) {
    errors.push('Title is required.');
  }

  if (!isNonEmptyString(description)) {
    errors.push('Description is required.');
  }

  if (!category || !COMPLAINT_CATEGORIES.includes(category)) {
    errors.push(
      `Category must be one of: ${COMPLAINT_CATEGORIES.join(', ')}.`
    );
  }

  if (!location || typeof location !== 'object') {
    errors.push('Location is required.');
  } else {
    if (!isNonEmptyString(location.address)) {
      errors.push('Location address is required.');
    }

    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);

    if (!isValidNumber(latitude) || latitude < -90 || latitude > 90) {
      errors.push('Valid latitude is required (-90 to 90).');
    }

    if (!isValidNumber(longitude) || longitude < -180 || longitude > 180) {
      errors.push('Valid longitude is required (-180 to 180).');
    }

    req.body.location = {
      address: location.address.trim(),
      latitude,
      longitude,
    };
  }

  if (req.files && req.files.length > 5) {
    errors.push('You can upload a maximum of 5 images.');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join(' ')));
  }

  next();
};

/**
 * Validate request body when updating a complaint.
 * At least one field or new image upload must be provided.
 */
const validateUpdateComplaint = (req, res, next) => {
  parseMultipartFields(req);

  const { title, description, category, status, location } = req.body;
  const errors = [];
  const hasUpdateField =
    title !== undefined ||
    description !== undefined ||
    category !== undefined ||
    status !== undefined ||
    location !== undefined ||
    (req.files && req.files.length > 0);

  if (!hasUpdateField) {
    return next(
      new ApiError(400, 'Please provide at least one field to update.')
    );
  }

  if (title !== undefined && !isNonEmptyString(title)) {
    errors.push('Title cannot be empty.');
  }

  if (description !== undefined && !isNonEmptyString(description)) {
    errors.push('Description cannot be empty.');
  }

  if (category !== undefined && !COMPLAINT_CATEGORIES.includes(category)) {
    errors.push(
      `Category must be one of: ${COMPLAINT_CATEGORIES.join(', ')}.`
    );
  }

  if (status !== undefined && !COMPLAINT_STATUSES.includes(status)) {
    errors.push(
      `Status must be one of: ${COMPLAINT_STATUSES.join(', ')}.`
    );
  }

  if (location !== undefined) {
    if (typeof location !== 'object' || location === null) {
      errors.push('Location must be an object.');
    } else {
      const { address, latitude, longitude } = location;

      if (address !== undefined && !isNonEmptyString(address)) {
        errors.push('Location address cannot be empty.');
      }

      if (latitude !== undefined) {
        const lat = Number(latitude);
        if (!isValidNumber(lat) || lat < -90 || lat > 90) {
          errors.push('Valid latitude is required (-90 to 90).');
        }
      }

      if (longitude !== undefined) {
        const lng = Number(longitude);
        if (!isValidNumber(lng) || lng < -180 || lng > 180) {
          errors.push('Valid longitude is required (-180 to 180).');
        }
      }

      if (!errors.length) {
        req.body.location = {
          ...(address !== undefined && { address: address.trim() }),
          ...(latitude !== undefined && { latitude: Number(latitude) }),
          ...(longitude !== undefined && { longitude: Number(longitude) }),
        };
      }
    }
  }

  if (req.files && req.files.length > 5) {
    errors.push('You can upload a maximum of 5 images per request.');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, errors.join(' ')));
  }

  next();
};

module.exports = {
  validateCreateComplaint,
  validateUpdateComplaint,
};
