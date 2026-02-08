// ============================================
// 🌐 SERVIDOR WEB STANDALONE
// ============================================
// Este arquivo roda o servidor web de forma independente do bot
// Use para separar o dyno web do dyno worker no Heroku

require('dotenv').config();
const express = require('express');
const http = require('http');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const mongoose = require('mongoose');

// Páginas
const { getLandingPage } = require('./pages/landing');
const { getTermsPage } = require('./pages/terms');
const { getPrivacyPage } = require('./pages/privacy');
const { getDashboardPage, getLoginPage } = require('./pages/dashboard');
const { getLeaderboardPage } = require('./pages/leaderboardWeb');
const { getCommandsPage } = require('./pages/commands');

// Models
const Leaderboard = require('../models/Leaderboard');
const UserFavorites = require('../models/UserFavorites');
const UserPlaylist = require('../models/UserPlaylist');
const UserSession = require('../models/UserSession');

// Middleware
const { addUserToLocals, isAuthenticated } = require('./middleware/auth');

// Passport Discord Strategy
const DiscordStrategy = require('passport-discord').Strategy;

// ============================================
// 📊 ESTATÍSTICAS (em modo standalone, busca do banco)
// ============================================

const botStartTime = Date.now();

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// ============================================
// 🚀 INICIALIZAÇÃO
// ============================================

async function startStandaloneServer() {
  // Conectar ao MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado ao MongoDB');
  } catch (err) {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  }

  const app = express();
  const PORT = process.env.PORT || 3000;
  const server = http.createServer(app);

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ========== SESSÃO E AUTH ==========
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dj-yazan-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    }
  }));

  // Passport config
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialização
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  // Discord Strategy
  const scopes = ['identify', 'guilds'];
  const callbackURL = process.env.CALLBACK_URL || `${process.env.APP_URL}/auth/discord/callback`;

  passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: scopes
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Salva sessão no banco
      await UserSession.findOneAndUpdate(
        { odiscordId: profile.id },
        {
          odiscordId: profile.id,
          username: profile.username,
          discriminator: profile.discriminator || '0',
          avatar: profile.avatar,
          guilds: profile.guilds?.map(g => ({
            id: g.id,
            name: g.name,
            icon: g.icon,
            owner: g.owner,
            permissions: g.permissions
          })) || [],
          accessToken,
          refreshToken,
          lastLogin: new Date()
        },
        { upsert: true, new: true }
      );

      return done(null, {
        odiscordId: profile.id,
        username: profile.username,
        avatar: profile.avatar,
        guilds: profile.guilds || []
      });
    } catch (err) {
      console.error('Erro ao salvar sessão:', err);
      return done(err, null);
    }
  }));

  // User to locals
  app.use(addUserToLocals);

  // ========== ROTAS DE AUTH ==========

  app.get('/auth/discord', passport.authenticate('discord'));

  app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => res.redirect('/dashboard')
  );

  app.get('/auth/logout', (req, res) => {
    req.logout(() => {
      res.redirect('/');
    });
  });

  app.get('/auth/me', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: 'Não autenticado' });
    }
  });

  // ========== PÁGINAS ==========

  // Landing Page
  app.get('/', async (req, res) => {
    // Em modo standalone, buscar stats do banco ou usar valores padrão
    const stats = {
      uptime: formatUptime(Date.now() - botStartTime),
      servers: '50+', // Placeholder - atualiza quando o bot envia dados
      users: '10,000+',
      activePlayers: 0,
      isOnline: true // Assume online
    };
    res.send(getLandingPage(stats));
  });

  // Commands Page
  app.get('/commands', (req, res) => {
    res.send(getCommandsPage());
  });

  // Dashboard Page
  app.get('/dashboard', async (req, res) => {
    try {
      let userStats = { songs: 0, time: 0, quizPoints: 0 };
      let favorites = [];
      let playlists = [];
      
      if (req.user) {
        const leaderboardData = await Leaderboard.aggregate([
          { $match: { userId: req.user.discordId } },
          { $group: { 
            _id: '$userId', 
            songs: { $sum: '$songs' }, 
            time: { $sum: '$time' },
            quizPoints: { $sum: '$quizPoints' }
          }}
        ]);
        
        if (leaderboardData.length > 0) {
          userStats = leaderboardData[0];
        }

        const userFavs = await UserFavorites.findOne({ userId: req.user.discordId });
        favorites = userFavs?.tracks || [];

        playlists = await UserPlaylist.find({ userId: req.user.discordId })
          .select('name description trackCount isPublic createdAt')
          .limit(10);
      }

      res.send(getDashboardPage(req.user, userStats, favorites, playlists, []));
    } catch (err) {
      console.error('Erro no dashboard:', err);
      res.status(500).send('Erro ao carregar dashboard');
    }
  });

  // Leaderboard Page
  app.get('/leaderboard', async (req, res) => {
    const guildId = req.query.guild || null;
    let leaderboardData = [];
    
    if (guildId) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthKey = `${currentYear}-${currentMonth}`;
      
      leaderboardData = await Leaderboard.find({ 
        guildId: guildId,
        month: monthKey
      }).sort({ songs: -1 }).limit(50);
    }
    
    res.send(getLeaderboardPage(leaderboardData, []));
  });

  // Terms & Privacy
  app.get('/terms', (req, res) => res.send(getTermsPage()));
  app.get('/privacy', (req, res) => res.send(getPrivacyPage()));

  // ========== API ENDPOINTS ==========

  // API: Leaderboard por servidor
  app.get('/api/leaderboard/:guildId', async (req, res) => {
    try {
      const { guildId } = req.params;
      const { type = 'songs', period = 'month' } = req.query;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthKey = `${currentYear}-${currentMonth}`;
      
      const sortField = type === 'time' ? 'time' : type === 'quiz' ? 'quizPoints' : 'songs';
      
      const data = await Leaderboard.find({ 
        guildId: guildId,
        month: monthKey
      }).sort({ [sortField]: -1 }).limit(100);
      
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Favoritos do usuário
  app.get('/api/favorites', isAuthenticated, async (req, res) => {
    try {
      const userFavs = await UserFavorites.findOne({ userId: req.user.discordId });
      res.json(userFavs?.tracks || []);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Playlists do usuário
  app.get('/api/playlists', isAuthenticated, async (req, res) => {
    try {
      const playlists = await UserPlaylist.find({ userId: req.user.discordId });
      res.json(playlists);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // API: Comandos
  app.get('/api/commands', (req, res) => {
    const commands = [
      { name: 'play', description: 'Toca uma música', category: 'music' },
      { name: 'skip', description: 'Pula a música atual', category: 'music' },
      { name: 'queue', description: 'Mostra a fila', category: 'music' },
      { name: 'pause', description: 'Pausa/retoma', category: 'music' },
      { name: 'stop', description: 'Para a música', category: 'music' },
      { name: 'loop', description: 'Alterna loop', category: 'music' },
      { name: 'shuffle', description: 'Embaralha a fila', category: 'music' },
      { name: 'volume', description: 'Ajusta volume', category: 'music' },
      { name: 'seek', description: 'Pula para posição', category: 'music' },
      { name: 'nowplayed', description: 'Música atual', category: 'music' },
      { name: 'lyrics', description: 'Busca letras', category: 'music' },
      { name: 'favorites', description: 'Gerencia favoritos', category: 'playlist' },
      { name: 'myplaylists', description: 'Playlists pessoais', category: 'playlist' },
      { name: 'playlist', description: 'Toca uma playlist', category: 'playlist' },
      { name: 'autoplay', description: 'Liga/desliga autoplay', category: 'config' },
      { name: '247', description: 'Modo 24/7', category: 'config' },
      { name: 'leaderboard', description: 'Ranking do servidor', category: 'fun' },
      { name: 'mystats', description: 'Suas estatísticas', category: 'fun' },
      { name: 'quiz', description: 'Quiz musical', category: 'fun' },
      { name: 'ping', description: 'Latência do bot', category: 'util' },
      { name: 'help', description: 'Lista comandos', category: 'util' },
      { name: 'about', description: 'Sobre o bot', category: 'util' }
    ];
    res.json(commands);
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: 'standalone', timestamp: new Date().toISOString() });
  });

  // ========== START SERVER ==========

  server.listen(PORT, () => {
    console.log('============================================');
    console.log('🌐 DJ YAZAN - WEB SERVER (STANDALONE)');
    console.log('============================================');
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🔗 URL: ${process.env.APP_URL || `http://localhost:${PORT}`}`);
    console.log('============================================');
  });
}

// Inicia o servidor
startStandaloneServer();
