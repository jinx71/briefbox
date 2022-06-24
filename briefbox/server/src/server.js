require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { ok } = require('./utils/apiResponse');

const hnRoutes = require('./routes/hnRoutes');
const authRoutes = require('./routes/authRoutes');
const savedRoutes = require('./routes/savedRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security + parsers + logging
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    credentials: true,
    exposedHeaders: ['X-Cache', 'X-Source'],
  })
);
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Rate limit our own API — be generous, the engineering point is that the
// cache layer (not this limiter) protects the upstream HN API.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — slow down', errors: [] },
});
app.use('/api', limiter);

// Health
app.get('/api/health', (req, res) =>
  ok(res, { status: 'ok', uptime: process.uptime(), ts: Date.now() })
);

// Routes
app.use('/api/hn', hnRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/saved', savedRoutes);

// 404 + error handler — always last
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[server] BriefBox API listening on http://localhost:${PORT}`);
    console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

if (require.main === module) {
  start().catch((err) => {
    console.error('[server] Fatal startup error:', err);
    process.exit(1);
  });
}

module.exports = app;
