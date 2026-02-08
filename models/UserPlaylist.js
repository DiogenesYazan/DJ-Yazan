const mongoose = require('mongoose');

const userPlaylistSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  name: { 
    type: String, 
    required: true,
    maxlength: 50
  },
  description: { 
    type: String,
    maxlength: 200
  },
  isPublic: { 
    type: Boolean, 
    default: false 
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
  collection: 'user_playlists'
});

// Índice composto para garantir nomes únicos por usuário
userPlaylistSchema.index({ userId: 1, name: 1 }, { unique: true });

// Limite de 200 músicas por playlist
userPlaylistSchema.pre('save', function(next) {
  if (this.tracks.length > 200) {
    this.tracks = this.tracks.slice(0, 200);
  }
  next();
});

// Limite de 25 playlists por usuário (verificado no comando)
module.exports = mongoose.model('UserPlaylist', userPlaylistSchema);
