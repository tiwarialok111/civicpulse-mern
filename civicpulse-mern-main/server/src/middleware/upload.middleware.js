const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('../utils/ApiError');

const UPLOAD_DIR = path.join(__dirname, '../../temp/uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

// Create temp upload folder if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueName}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPG, JPEG, and PNG images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

/**
 * Accept up to 5 images with field name "images".
 * Wraps multer errors into friendly ApiError messages.
 */
const uploadComplaintImages = (req, res, next) => {
  const handler = upload.array('images', MAX_FILES);

  handler(req, res, (err) => {
    if (!err) return next();

    if (err instanceof ApiError) {
      return next(err);
    }

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'Each image must be 5MB or less.'));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(new ApiError(400, 'You can upload a maximum of 5 images.'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(
          new ApiError(400, 'Unexpected file field. Use "images" as the field name.')
        );
      }
      return next(new ApiError(400, err.message));
    }

    return next(err);
  });
};

module.exports = {
  uploadComplaintImages,
  UPLOAD_DIR,
};
