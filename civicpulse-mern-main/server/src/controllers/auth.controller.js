const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const generateToken = require('../utils/generateToken');

/**
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide name, email, and password.');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'Email is already registered.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'citizen', // default role for new signups is citizen
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful.',
    data: {
      user,
      token,
    },
  });
});

/**
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide email and password.');
  }

  // Need to explicitly select password since it's hidden by default
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.isActive) {
    throw new ApiError(401, 'Your account has been deactivated.');
  }

  const token = generateToken(user._id);

  // Remove password from response
  user.password = undefined;

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      user,
      token,
    },
  });
});

/**
 * @route   GET /api/v1/auth/me
 * @access  Private (protected route example)
 */
const getMe = catchAsync(async (req, res) => {
  // req.user is set by auth middleware
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
};
