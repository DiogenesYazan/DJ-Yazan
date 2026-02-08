// ============================================
// 📊 MODEL: ESTATÍSTICAS DO BOT
// ============================================
// Armazena estatísticas do bot para compartilhar entre dynos

const mongoose = require('mongoose');

const botStatsSchema = new mongoose.Schema({
  // ID fixo para ter apenas um documento
  _id: {
    type: String,
    default: 'bot-stats'
  },
  
  // Estatísticas
  guildCount: {
    type: Number,
    default: 0
  },
  
  userCount: {
    type: Number,
    default: 0
  },
  
  activePlayers: {
    type: Number,
    default: 0
  },
  
  commandsUsed: {
    type: Number,
    default: 0
  },
  
  songsPlayed: {
    type: Number,
    default: 0
  },
  
  isOnline: {
    type: Boolean,
    default: false
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  botStartTime: {
    type: Date,
    default: Date.now
  }
});

// Método para atualizar stats
botStatsSchema.statics.updateStats = async function(data) {
  return this.findOneAndUpdate(
    { _id: 'bot-stats' },
    { 
      ...data,
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );
};

// Método para buscar stats
botStatsSchema.statics.getStats = async function() {
  let stats = await this.findById('bot-stats');
  
  if (!stats) {
    stats = await this.create({ _id: 'bot-stats' });
  }
  
  return stats;
};

module.exports = mongoose.model('BotStats', botStatsSchema);
