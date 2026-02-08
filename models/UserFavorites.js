const mongoose = require('mongoose');

const userFavoritesSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  tracks: [{
    title: { type: String, required: true },
    author: { type: String },
    uri: { type: String, required: true },
    identifier: { type: String },
    duration: { type: Number },
    thumbnail: { type: String },
    addedAt: { type: Date, default: Date.now }
  }]
}, { 
  timestamps: true,
  collection: 'user_favorites'
});

// Limite de 100 favoritos por usuário
userFavoritesSchema.pre('save', function(next) {
  if (this.tracks.length > 100) {
    this.tracks = this.tracks.slice(-100); // Mantém os 100 mais recentes
  }
  next();
});

module.exports = mongoose.model('UserFavorites', userFavoritesSchema);
