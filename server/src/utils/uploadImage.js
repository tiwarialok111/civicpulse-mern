const fs = require('fs/promises');
const cloudinary = require('../config/cloudinary');

/**
 * Upload a single local file to Cloudinary, then delete the temp file.
 */
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'civicpulse/complaints',
      resource_type: 'image',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } finally {
    // Always remove local temp file after upload attempt
    await fs.unlink(filePath).catch(() => {});
  }
};

/**
 * Upload multiple files to Cloudinary.
 */
const uploadMultipleToCloudinary = async (files = []) => {
  if (!files.length) return [];

  return Promise.all(files.map((file) => uploadToCloudinary(file.path)));
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
};
