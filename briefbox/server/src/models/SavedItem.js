const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hnId: {
      type: Number,
      required: true,
    },
    title: { type: String, required: true },
    url: { type: String },
    by: { type: String },
    score: { type: Number, default: 0 },
    descendants: { type: Number, default: 0 },
    time: { type: Number },
    type: { type: String, default: 'story' },
  },
  { timestamps: true }
);

// One save per (user, story)
savedItemSchema.index({ user: 1, hnId: 1 }, { unique: true });

module.exports = mongoose.model('SavedItem', savedItemSchema);
