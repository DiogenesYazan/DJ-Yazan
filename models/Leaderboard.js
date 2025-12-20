const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  month: { type: String, required: true, index: true }, // Format: YYYY-M
  songs: { type: Number, default: 0 },
  time: { type: Number, default: 0 },
  lastPlayed: { type: Date, default: Date.now }
});

// Composite index for fast lookups
leaderboardSchema.index({ guildId: 1, userId: 1, month: 1 }, { unique: true });
leaderboardSchema.index({ guildId: 1, month: 1, songs: -1 });
leaderboardSchema.index({ guildId: 1, month: 1, time: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
