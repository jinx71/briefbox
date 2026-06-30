/**
 * Hacker News service layer.
 *
 * Two engineering wins live here:
 *  1) Smart per-endpoint caching with inflight-request de-duplication so a
 *     burst of concurrent requests for the same item collapses into one
 *     upstream call. Story-list TTL is short (fresh feeds); item TTL is
 *     longer (immutable-ish content).
 *  2) Recursive comment-tree fetcher that walks the `kids` graph with a
 *     bounded depth and a concurrency-limited Promise pool, then returns a
 *     single nested tree the client can render directly.
 */

const axios = require('axios');
const NodeCache = require('node-cache');

const HN_BASE = 'https://hacker-news.firebaseio.com/v0';

const TTL = {
  list: 5 * 60,    // 5 min — top/new/best feeds change slowly
  item: 10 * 60,   // 10 min — items are mostly immutable
  tree: 5 * 60,    // 5 min — comment trees may grow
  user: 30 * 60,   // 30 min
};

const cache = new NodeCache({ stdTTL: TTL.item, checkperiod: 60, useClones: false });
const inflight = new Map(); // dedup concurrent calls for the same key

const stats = { hits: 0, misses: 0, errors: 0, mockServed: 0 };

const http = axios.create({ baseURL: HN_BASE, timeout: 8000 });

const withInflight = async (key, fn) => {
  if (inflight.has(key)) return inflight.get(key);
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
};

const cachedFetch = async (key, ttl, fetcher) => {
  const cached = cache.get(key);
  if (cached !== undefined) {
    stats.hits += 1;
    return { value: cached, hit: true };
  }
  stats.misses += 1;
  const value = await withInflight(key, fetcher);
  if (value !== undefined && value !== null) cache.set(key, value, ttl);
  return { value, hit: false };
};

// ---- Mock fallback so the UX works even when HN is unreachable ----
const MOCK_STORIES = [
  { id: 1, title: 'Show HN: BriefBox — Hacker News, but cosy', by: 'sazed', score: 412, descendants: 87, time: Math.floor(Date.now() / 1000) - 3600, url: 'https://example.com/briefbox', type: 'story' },
  { id: 2, title: 'Why server-side caching beats client polling for free APIs', by: 'caching_guru', score: 289, descendants: 54, time: Math.floor(Date.now() / 1000) - 7200, url: 'https://example.com/caching', type: 'story' },
  { id: 3, title: 'The MERN stack is having a moment again in 2022', by: 'dev_observer', score: 198, descendants: 122, time: Math.floor(Date.now() / 1000) - 10800, url: 'https://example.com/mern', type: 'story' },
  { id: 4, title: 'Recursive comment trees: a small engineering puzzle', by: 'tree_walker', score: 156, descendants: 33, time: Math.floor(Date.now() / 1000) - 14400, url: 'https://example.com/trees', type: 'story' },
  { id: 5, title: 'Dark mode is no longer optional — building it as a first-class concern', by: 'ui_dev', score: 134, descendants: 41, time: Math.floor(Date.now() / 1000) - 18000, url: 'https://example.com/dark', type: 'story' },
  { id: 6, title: 'Ask HN: How do you structure a portfolio of 12 apps?', text: 'I am building a portfolio of MERN apps. What architecture patterns do you find most useful when each app stands alone?', by: 'sazed', score: 88, descendants: 47, time: Math.floor(Date.now() / 1000) - 21600, type: 'story' },
  { id: 7, title: 'Tailwind 3 vs MUI 5: which is the better default for a portfolio?', by: 'css_thinker', score: 76, descendants: 29, time: Math.floor(Date.now() / 1000) - 25200, url: 'https://example.com/tw-vs-mui', type: 'story' },
  { id: 8, title: 'A practical guide to JWT auth in Express + Mongoose', by: 'auth_writer', score: 64, descendants: 18, time: Math.floor(Date.now() / 1000) - 28800, url: 'https://example.com/jwt', type: 'story' },
  { id: 9, title: 'Node-cache is underrated — three patterns I use every project', by: 'backend_sam', score: 58, descendants: 22, time: Math.floor(Date.now() / 1000) - 32400, url: 'https://example.com/node-cache', type: 'story' },
  { id: 10, title: 'Show HN: A 60-line inflight request de-duplicator', by: 'minimal_hacker', score: 49, descendants: 15, time: Math.floor(Date.now() / 1000) - 36000, url: 'https://example.com/dedup', type: 'story' },
  { id: 11, title: 'Why I still use React 17 in 2022', by: 'pragmatist', score: 42, descendants: 89, time: Math.floor(Date.now() / 1000) - 39600, url: 'https://example.com/r17', type: 'story' },
  { id: 12, title: 'CRA is fine, actually', by: 'tooling_takes', score: 38, descendants: 65, time: Math.floor(Date.now() / 1000) - 43200, url: 'https://example.com/cra', type: 'story' },
];

const MOCK_COMMENT_POOL = [
  { by: 'commenter_a', text: 'Great write-up. The bit about inflight de-duplication is genuinely one of those small-but-mighty tricks.' },
  { by: 'skeptic',     text: 'I disagree on point three — the caching layer adds complexity that most teams will not maintain well.' },
  { by: 'builder',     text: 'We do something similar in production. Two notes: <p>1) Watch out for stale-while-revalidate edge cases. <p>2) TTL choice is everything.' },
  { by: 'curious',     text: 'How does this compare to using a CDN layer in front? Genuine question.' },
  { by: 'lurker',      text: 'Thanks for sharing.' },
  { by: 'expert',      text: 'There&#x27;s an entire <a href="https://example.com/paper">paper</a> on this exact pattern. The TL;DR: the win scales with concurrent reads, not throughput.' },
  { by: 'newcomer',    text: 'Just started learning the MERN stack — this is exactly the level of detail I was looking for. Saved!' },
  { by: 'critic',      text: 'Why not just use Redis? Feels like reinventing the wheel.' },
  { by: 'pragmatist',  text: '@critic — fair, but node-cache has zero infra cost and is plenty for the scales described here.' },
  { by: 'observer',    text: 'Subtle point: the inflight Map is keyed by the request, not the result — so collisions across users are impossible.' },
];

const buildMockTree = (parentId, depth, maxDepth, breadth) => {
  if (depth >= maxDepth) return [];
  const count = Math.max(1, Math.floor(breadth - depth * 1.5));
  const out = [];
  for (let i = 0; i < count; i += 1) {
    const sample = MOCK_COMMENT_POOL[(parentId * 7 + depth * 3 + i) % MOCK_COMMENT_POOL.length];
    const id = parentId * 100 + depth * 10 + i + 1000;
    out.push({
      id,
      by: sample.by,
      text: sample.text,
      time: Math.floor(Date.now() / 1000) - (depth + 1) * 1800 - i * 600,
      type: 'comment',
      deleted: false,
      dead: false,
      parent: parentId,
      kids: [],
      replies: buildMockTree(id, depth + 1, maxDepth, breadth),
    });
  }
  return out;
};

const mockStoryWithTree = (id) => {
  const story = MOCK_STORIES.find((s) => s.id === Number(id)) || MOCK_STORIES[0];
  return {
    ...story,
    replies: buildMockTree(story.id, 0, 4, 4),
  };
};

// ---- Public API ----

const fetchStoryIds = async (feed) => {
  const map = { top: 'topstories', new: 'newstories', best: 'beststories' };
  const path = map[feed];
  if (!path) throw Object.assign(new Error('Invalid feed'), { statusCode: 400 });

  try {
    const { value, hit } = await cachedFetch(`ids:${feed}`, TTL.list, async () => {
      const { data } = await http.get(`/${path}.json`);
      return Array.isArray(data) ? data : [];
    });
    return { ids: value, hit, mock: false };
  } catch (err) {
    stats.errors += 1;
    stats.mockServed += 1;
    return { ids: MOCK_STORIES.map((s) => s.id), hit: false, mock: true };
  }
};

const fetchItem = async (id) => {
  try {
    const { value, hit } = await cachedFetch(`item:${id}`, TTL.item, async () => {
      const { data } = await http.get(`/item/${id}.json`);
      return data;
    });
    return { item: value, hit, mock: false };
  } catch (err) {
    stats.errors += 1;
    stats.mockServed += 1;
    const mock = MOCK_STORIES.find((s) => s.id === Number(id));
    return { item: mock || null, hit: false, mock: true };
  }
};

const fetchStories = async (feed, { page = 1, perPage = 20 } = {}) => {
  const { ids, mock: idsMock } = await fetchStoryIds(feed);
  const start = (page - 1) * perPage;
  const pageIds = ids.slice(start, start + perPage);

  if (idsMock) {
    const items = pageIds.map((id) => MOCK_STORIES.find((s) => s.id === id)).filter(Boolean);
    return { stories: items, total: ids.length, page, perPage, mock: true };
  }

  // Concurrency-limited fetch — small pool to be polite to HN
  const items = await pool(pageIds, 8, async (id) => {
    const { item } = await fetchItem(id);
    return item;
  });

  return {
    stories: items.filter((i) => i && !i.dead && !i.deleted),
    total: ids.length,
    page,
    perPage,
    mock: false,
  };
};

// Simple concurrency pool — runs `limit` tasks in parallel through the list
const pool = async (items, limit, worker) => {
  const results = new Array(items.length);
  let idx = 0;
  const runners = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (idx < items.length) {
      const my = idx;
      idx += 1;
      try {
        results[my] = await worker(items[my], my);
      } catch (_e) {
        results[my] = null;
      }
    }
  });
  await Promise.all(runners);
  return results;
};

/**
 * Recursively fetch a comment tree.
 *
 * - `maxDepth` bounds traversal so a pathological thread can't melt the server
 * - `maxPerLevel` truncates wide threads (sortable client-side later)
 * - Concurrency pool keeps upstream pressure sane
 */
const fetchCommentTree = async (id, { depth = 0, maxDepth = 5, maxPerLevel = 30 } = {}) => {
  const { item } = await fetchItem(id);
  if (!item) return null;

  const kids = Array.isArray(item.kids) ? item.kids.slice(0, maxPerLevel) : [];
  let replies = [];

  if (kids.length > 0 && depth < maxDepth) {
    const fetched = await pool(kids, 6, async (kidId) =>
      fetchCommentTree(kidId, { depth: depth + 1, maxDepth, maxPerLevel })
    );
    replies = fetched.filter((c) => c && !c.deleted && !c.dead);
  }

  return { ...item, replies };
};

const fetchStoryWithComments = async (id) => {
  const cacheKey = `tree:${id}`;
  const hit = cache.get(cacheKey);
  if (hit !== undefined) {
    stats.hits += 1;
    return { story: hit, hit: true, mock: false };
  }
  stats.misses += 1;

  try {
    const tree = await withInflight(cacheKey, () => fetchCommentTree(id));
    if (!tree) return { story: null, hit: false, mock: false };
    cache.set(cacheKey, tree, TTL.tree);
    return { story: tree, hit: false, mock: false };
  } catch (err) {
    stats.errors += 1;
    stats.mockServed += 1;
    return { story: mockStoryWithTree(id), hit: false, mock: true };
  }
};

const fetchUser = async (username) => {
  try {
    const { value, hit } = await cachedFetch(`user:${username}`, TTL.user, async () => {
      const { data } = await http.get(`/user/${encodeURIComponent(username)}.json`);
      return data;
    });
    return { user: value, hit, mock: false };
  } catch (err) {
    stats.errors += 1;
    return { user: null, hit: false, mock: true };
  }
};

const getStats = () => ({
  ...stats,
  cachedKeys: cache.keys().length,
  inflight: inflight.size,
});

const clearCache = () => {
  cache.flushAll();
  return { cleared: true };
};

module.exports = {
  fetchStoryIds,
  fetchStories,
  fetchItem,
  fetchStoryWithComments,
  fetchUser,
  getStats,
  clearCache,
};
