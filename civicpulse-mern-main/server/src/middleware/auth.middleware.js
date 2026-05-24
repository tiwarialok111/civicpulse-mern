const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * Protect routes — user must be logged in with a valid JWT.
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  // Check Authorization header: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. Please log in.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User no longer exists.');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Your account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(401, 'Invalid or expired token.');
  }
});

/**
 * Restrict routes to specific roles.
 * Usage: authorize('admin', 'officer')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not allowed to access this route.`)
      );
    }
    next();
  };
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new ApiError(403, 'Access denied. Admins only.'));
  }
};

module.exports = { protect, authorize, adminOnly };
