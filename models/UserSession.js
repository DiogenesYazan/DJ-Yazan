const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  discordId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  username: { 
    type: String, 
    required: true 
  },
  globalName: {
    type: String
  },
  avatar: { 
    type: String 
  },
  email: { 
    type: String 
  },
  accessToken: { 
    type: String, 
    required: true 
  },
  refreshToken: { 
    type: String, 
    required: true 
  },
  tokenExpires: { 
    type: Date, 
    required: true 
  },
  guilds: [{ 
    id: String, 
    name: String, 
    icon: String,
    isAdmin: Boolean,
    hasBot: Boolean
  }],
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  collection: 'user_sessions'
});

// Método para verificar se token expirou
userSessionSchema.methods.isTokenExpired = function() {
  return new Date() >= this.tokenExpires;
};

// Método para obter URL do avatar
userSessionSchema.methods.getAvatarUrl = function(size = 128) {
  if (this.avatar) {
    const format = this.avatar.startsWith('a_') ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${this.discordId}/${this.avatar}.${format}?size=${size}`;
  }
  // Avatar padrão do Discord
  const defaultIndex = (BigInt(this.discordId) >> 22n) % 6n;
  return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
};

module.exports = mongoose.model('UserSession', userSessionSchema);
