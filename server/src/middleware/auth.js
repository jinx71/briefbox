const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { fail } = require('../utils/apiResponse');
const { dbReady } = require('../config/db');

const protect = async (req, res, next) => {
  if (!dbReady()) {
    return fail(res, 'Auth unavailable (database not connected)', 503);
  }

  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'Not authorized — no token', 401);
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return fail(res, 'User not found', 401);
    req.user = user;
    return next();
  } catch (err) {
    return fail(res, 'Not authorized — invalid token', 401);
  }
};

// Soft auth — attach user if token valid, otherwise continue anonymously
const softAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ') || !dbReady()) return next();

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(decoded.id).select('-password');
    if (user) req.user = user;
  } catch (_e) {
    // Ignore — anonymous fallthrough
  }
  return next();
};

module.exports = { protect, softAuth };
