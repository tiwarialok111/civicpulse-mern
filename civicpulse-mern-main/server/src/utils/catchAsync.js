/**
 * Wraps async route handlers so errors go to the error middleware.
 * Usage: catchAsync(async (req, res) => { ... })
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
