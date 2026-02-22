const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  alwaysOn: { type: Boolean, default: false }, // 24/7 mode
  textChannelId: { type: String, default: null }, // Canal de texto para o modo 24/7
  voiceChannelId: { type: String, default: null }, // Canal de voz para o modo 24/7
  defaultVolume: { type: Number, default: 100 },
  autoplay: { type: Boolean, default: false } // Autoplay relacionados
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
