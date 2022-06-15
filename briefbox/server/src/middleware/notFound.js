const notFound = (req, res, next) => {
  const err = new Error(`Not found: ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

module.exports = notFound;
