const mongoose = require('mongoose');

const QuizSessionSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true }, // ID do canal de texto
  voiceChannelId: { type: String, required: true }, // ID do canal de voz
  currentRound: { type: Number, default: 0 },
  maxRounds: { type: Number, required: true },
  playlistUrl: { type: String },
  scores: { type: Map, of: Number, default: {} }, // Mapa userId -> pontos
  active: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware para atualizar o updatedAt
QuizSessionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('QuizSession', QuizSessionSchema);
