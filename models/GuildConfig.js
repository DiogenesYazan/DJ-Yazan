const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true, index: true },
  alwaysOn: { type: Boolean, default: false }, // 24/7 mode
  defaultVolume: { type: Number, default: 100 },
  autoplay: { type: Boolean, default: false } // Autoplay relacionados
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
