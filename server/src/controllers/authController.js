const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const { dbReady } = require('../config/db');

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const checkValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    fail(res, 'Validation failed', 422, errors.array());
    return false;
  }
  return true;
};

const register = asyncHandler(async (req, res) => {
  if (!dbReady()) return fail(res, 'Auth unavailable (database not connected)', 503);
  if (!checkValidation(req, res)) return;

  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return fail(res, 'Username or email already in use', 409);

  const user = await User.create({ username, email, password });
  const token = sign(user._id);

  return ok(
    res,
    {
      token,
      user: { id: user._id, username: user.username, email: user.email },
    },
    'Registered',
    201
  );
});

const login = asyncHandler(async (req, res) => {
  if (!dbReady()) return fail(res, 'Auth unavailable (database not connected)', 503);
  if (!checkValidation(req, res)) return;

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return fail(res, 'Invalid credentials', 401);

  const matched = await user.matchPassword(password);
  if (!matched) return fail(res, 'Invalid credentials', 401);

  const token = sign(user._id);
  return ok(res, {
    token,
    user: { id: user._id, username: user.username, email: user.email },
  });
});

const me = asyncHandler(async (req, res) => {
  return ok(res, {
    id: req.user._id,
    username: req.user.username,
    email: req.user.email,
    createdAt: req.user.createdAt,
  });
});

module.exports = { register, login, me };
