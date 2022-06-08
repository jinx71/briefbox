const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const hnService = require('../services/hnService');

const VALID_FEEDS = ['top', 'new', 'best'];

const getFeed = asyncHandler(async (req, res) => {
  const feed = (req.params.feed || 'top').toLowerCase();
  if (!VALID_FEEDS.includes(feed)) return fail(res, `Invalid feed (use one of ${VALID_FEEDS.join(', ')})`, 400);

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const perPage = Math.min(30, Math.max(5, parseInt(req.query.perPage, 10) || 20));

  const result = await hnService.fetchStories(feed, { page, perPage });
  res.set('X-Source', result.mock ? 'mock' : 'hn');
  return ok(res, result, result.mock ? 'Served from mock fallback' : 'OK');
});

const getStory = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return fail(res, 'Invalid id', 400);

  const result = await hnService.fetchStoryWithComments(id);
  if (!result.story) return fail(res, 'Story not found', 404);

  res.set('X-Cache', result.hit ? 'HIT' : 'MISS');
  res.set('X-Source', result.mock ? 'mock' : 'hn');
  return ok(res, result.story);
});

const getItem = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) return fail(res, 'Invalid id', 400);

  const { item, hit, mock } = await hnService.fetchItem(id);
  if (!item) return fail(res, 'Item not found', 404);

  res.set('X-Cache', hit ? 'HIT' : 'MISS');
  res.set('X-Source', mock ? 'mock' : 'hn');
  return ok(res, item);
});

const getUser = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) return fail(res, 'Invalid username', 400);

  const { user, hit, mock } = await hnService.fetchUser(username);
  if (!user) return fail(res, 'User not found', 404);

  res.set('X-Cache', hit ? 'HIT' : 'MISS');
  res.set('X-Source', mock ? 'mock' : 'hn');
  return ok(res, user);
});

const getStats = asyncHandler(async (req, res) => {
  return ok(res, hnService.getStats());
});

const clearCache = asyncHandler(async (req, res) => {
  return ok(res, hnService.clearCache());
});

module.exports = { getFeed, getStory, getItem, getUser, getStats, clearCache };
