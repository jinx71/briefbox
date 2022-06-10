const SavedItem = require('../models/SavedItem');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');

const list = asyncHandler(async (req, res) => {
  const items = await SavedItem.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
  return ok(res, items);
});

const add = asyncHandler(async (req, res) => {
  const { hnId, title, url, by, score, descendants, time, type } = req.body;
  if (!hnId || !title) return fail(res, 'hnId and title are required', 422);

  try {
    const item = await SavedItem.create({
      user: req.user._id,
      hnId,
      title,
      url,
      by,
      score,
      descendants,
      time,
      type,
    });
    return ok(res, item, 'Saved', 201);
  } catch (err) {
    if (err.code === 11000) return fail(res, 'Already saved', 409);
    throw err;
  }
});

const remove = asyncHandler(async (req, res) => {
  const hnId = parseInt(req.params.hnId, 10);
  if (!Number.isFinite(hnId)) return fail(res, 'Invalid hnId', 400);

  const result = await SavedItem.deleteOne({ user: req.user._id, hnId });
  if (result.deletedCount === 0) return fail(res, 'Not saved', 404);
  return ok(res, { hnId }, 'Removed');
});

const ids = asyncHandler(async (req, res) => {
  const items = await SavedItem.find({ user: req.user._id }).select('hnId').lean();
  return ok(res, items.map((i) => i.hnId));
});

module.exports = { list, add, remove, ids };
