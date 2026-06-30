const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('[db] MONGO_URI not set — running without persistence (auth/saved disabled)');
    return false;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    console.log(`[db] MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`[db] MongoDB connection failed: ${err.message}`);
    console.warn('[db] Continuing in read-only HN mode (auth/saved disabled)');
    return false;
  }
};

const dbReady = () => isConnected && mongoose.connection.readyState === 1;

module.exports = { connectDB, dbReady };
