# BriefBox — Tech News, Cosier

A reader for Hacker News with **nested comment trees**, **save-for-later**, and a **first-class dark mode**. Tenth app in the MERN portfolio.

> **Engineering lesson:** _Recursive nested-tree rendering._ The headline win lives in `client/src/components/Comment.js` (each comment recursively renders its replies) and `server/src/services/hnService.js` (a bounded, concurrency-limited tree fetcher with caching and inflight de-duplication).

---

## Features

- **Three feeds**: Top, Best, New — switchable from the navbar.
- **Story detail with recursive comments**: depth-bounded, concurrency-controlled fetch on the server; recursive React component on the client with per-node collapse.
- **Save for later** (optional sign-in): JWT auth + Mongo store. Optimistic UI with rollback on failure.
- **Dark mode**: three-state toggle (Light / Dark / Auto). Preference persisted in localStorage and applied pre-render to avoid flash.
- **Visible caching**: `CacheBadge` component reflects `X-Cache` and `X-Source` response headers (HIT / MISS / MOCK).
- **Mock fallback**: if Hacker News is unreachable, the server serves a deterministic mock dataset so the UX always works.
- **Loading / empty / error** states on every async view; mobile-first; keyboard-focusable.

---

## Tech stack (2021–2022 pinned)

**Frontend** — React 17.0.2, React Router 6.3, React Query 3.39, Tailwind 3.1, axios 0.27.2, dayjs 1.11, react-toastify 9, CRA 5.0.1.

**Backend** — Node 16, Express 4.18.1, Mongoose 6.5, jsonwebtoken 8, bcryptjs 2.4, express-validator 6.14, helmet 6, morgan 1.10, express-rate-limit 6, node-cache 5, axios 0.27.2.

---

## Project layout

```
briefbox/
├── client/                     # React (CRA)
│   ├── src/
│   │   ├── api/                # axios client + HN / auth / saved
│   │   ├── components/         # StoryCard, Comment (recursive), CacheBadge, Skeleton…
│   │   ├── context/            # ThemeContext, AuthContext, SavedContext
│   │   ├── hooks/              # useTheme, useAuth, useSaved
│   │   ├── pages/              # Feed, StoryDetail, Saved, Login, Register, NotFound
│   │   └── utils/              # format (dayjs), sanitize (HN HTML)
│   ├── tailwind.config.js
│   └── package.json
├── server/                     # Express + Mongoose
│   ├── src/
│   │   ├── config/db.js        # graceful: runs without Mongo (auth/saved disabled)
│   │   ├── services/hnService.js   # ⭐ caching, inflight dedup, recursive tree fetch, mock fallback
│   │   ├── controllers/        # hn, auth, saved
│   │   ├── routes/             # /api/hn, /api/auth, /api/saved
│   │   ├── middleware/         # protect/softAuth, errorHandler, notFound
│   │   ├── models/             # User, SavedItem
│   │   ├── utils/              # apiResponse, asyncHandler
│   │   └── server.js
│   └── package.json
├── package.json                # concurrently runs client + server
└── README.md
```

---

## Setup

```bash
# 1. Install dependencies in all three workspaces
npm run install:all

# 2. Copy env templates and fill in MONGO_URI / JWT_SECRET if you want auth + saved
cp server/.env.example server/.env
cp client/.env.example client/.env

# 3. Run both server and client concurrently
npm run dev
```

The client starts on **http://localhost:3000**, the API on **http://localhost:5000**.

### No Mongo? No problem.

If `MONGO_URI` is unreachable, the server logs a warning and continues in HN-read-only mode — `/api/auth/*` and `/api/saved/*` return `503`, but every feed and story still works. This is intentional so the demo is always one command away.

### No Hacker News access?

If the HN API request fails, `hnService` serves a deterministic mock dataset and sets `X-Source: mock`. You'll see a `mock` pill on the feed and a yellow `CacheBadge` on the story page.

---

## API surface

| Method | Path                       | Notes                                   |
|--------|----------------------------|-----------------------------------------|
| GET    | `/api/health`              | Uptime + status                         |
| GET    | `/api/hn/feed/:feed`       | `feed` ∈ `top \| best \| new` · `?page=1&perPage=20` |
| GET    | `/api/hn/story/:id`        | Story + nested comments. Sets `X-Cache`, `X-Source`. |
| GET    | `/api/hn/item/:id`         | Raw HN item                             |
| GET    | `/api/hn/user/:username`   | HN user profile                         |
| GET    | `/api/hn/cache/stats`      | Cache hits/misses/errors                |
| POST   | `/api/hn/cache/clear`      | Flush the cache                         |
| POST   | `/api/auth/register`       | `{ username, email, password }`         |
| POST   | `/api/auth/login`          | `{ email, password }`                   |
| GET    | `/api/auth/me`             | _(auth)_ Current user                   |
| GET    | `/api/saved`               | _(auth)_ List saved stories             |
| GET    | `/api/saved/ids`           | _(auth)_ List of `hnId`s only           |
| POST   | `/api/saved`               | _(auth)_ Save a story                   |
| DELETE | `/api/saved/:hnId`         | _(auth)_ Unsave a story                 |

All responses follow `{ success, data, message, errors? }`.

---

## The recursive lesson, in two paragraphs

**Server.** `hnService.fetchCommentTree(id)` walks the HN `kids` graph depth-first. Each level is fetched through a concurrency-limited pool (default 6 parallel), capped at `maxDepth=5` and `maxPerLevel=30` so a pathological thread can't melt the server. Items are individually cached, _and_ the assembled tree is cached under `tree:<id>` so a hot story serves comments in a single Map lookup. A shared `inflight` Map collapses concurrent requests for the same key into one upstream call.

**Client.** `Comment` accepts a node and a `depth`, renders the body, then maps over `comment.replies` and returns another `<Comment depth={depth + 1}>`. Depth-based left borders cycle through six accent shades for legibility, and per-node collapse state lives in `useState` so collapsing a deep thread is instant. The whole tree is one component that calls itself.

---

## Definition of Done

- [x] `npm install` + one `npm run dev` boots both client and server.
- [x] `.env.example` present in client and server; real `.env` git-ignored.
- [x] README with features, setup, env vars, tech stack.
- [x] Responsive on mobile and desktop, with focus rings, semantic HTML, and ARIA where needed.
- [x] Loading / empty / error states on every async view.
- [x] Shared design system + orange accent + dark mode.
- [x] Forms validated client-side (custom) and server-side (express-validator).
- [x] HN API proxied through Express; node-cache TTL caching + inflight dedup; visible cache badge.
- [x] JWT auth + protected routes for `/saved`; bcrypt password hashing; passwords never returned.
- [x] No console errors.
