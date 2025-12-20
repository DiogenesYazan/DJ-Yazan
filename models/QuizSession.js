const mongoose = require('mongoose');

const QuizSessionSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  channelId: { type: String, required: true }, // ID do canal de texto
  voiceChannelId: { type: String, required: true }, // ID do canal de voz
  currentRound: { type: Number, default: 0 },
  maxRounds: { type: Number, required: true },
  playlistUrl: { type: String },
  scores: { type: Map, of: Number, default: {} }, // Mapa userId -> pontos
  active: { type: Boolean, default: true }
}, {
  timestamps: true // Cria createdAt e updatedAt automaticamente
});

module.exports = mongoose.model('QuizSession', QuizSessionSchema);
