// Centralized error funnel. asyncHandler-wrapped controllers reject into here,
// as do `next(err)` calls and the 404 thrown by notFound.js.
const errorHandler = (err, req, res, _next) => {
  // Prefer explicit error status; fall back to a pre-set response status, else 500.
  let status = err.statusCode;
  if (!status) status = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  if (status === 200) status = 500;

  if (process.env.NODE_ENV !== 'test') {
    console.error('[error]', err.message);
    if (process.env.NODE_ENV === 'development') console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    errors: err.errors || [],
  });
};

module.exports = errorHandler;
