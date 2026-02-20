// ============================================
// 🌐 SERVIDOR WEB EXPRESS
// ============================================

const express = require('express');
const https = require('https');
const http = require('http');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');

// Páginas
const { getLandingPage } = require('./pages/landing');
const { getTermsPage } = require('./pages/terms');
const { getPrivacyPage } = require('./pages/privacy');
const { getDashboardPage } = require('./pages/dashboard');
const { getLeaderboardPage } = require('./pages/leaderboardWeb');
const { getCommandsPage } = require('./pages/commands');

// Middleware e Rotas
const { createAuthRouter } = require('./routes/auth');
const { addUserToLocals, isAuthenticated } = require('./middleware/auth');

// WebSocket
const { createPlayerSocket } = require('./sockets/playerSocket');

// Models (serão passados como parâmetro)
let UserFavorites, UserPlaylist, Leaderboard;

// ============================================
// 🔄 SISTEMA ANTI-IDLE (KEEP-ALIVE)
// ============================================
// NOTA: Comentado pois agora web e bot rodam em dynos separados
// O dyno web do Heroku não hiberna quando há tráfego regular
// Descomente se quiser usar bot e site no mesmo dyno

/*
const PING_INTERVAL = 10 * 60 * 1000; // Ping a cada 10 minutos
let pingInterval = null;

function startKeepAlive(appUrl) {
  if (pingInterval) clearInterval(pingInterval);
  
  const ping = () => {
    const url = appUrl || process.env.APP_URL;
    if (!url) {
      console.log('⚠️ APP_URL não definida - keep-alive desativado');
      return;
    }
    
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      console.log(`🏓 Keep-alive ping: ${res.statusCode} - ${new Date().toLocaleTimeString('pt-BR')}`);
    }).on('error', (err) => {
      console.log(`⚠️ Keep-alive erro: ${err.message}`);
    });
  };
  
  // Primeiro ping após 5 minutos
  setTimeout(ping, 5 * 60 * 1000);
  
  // Pings subsequentes a cada 10 minutos
  pingInterval = setInterval(ping, PING_INTERVAL);
  
  console.log('🔄 Sistema keep-alive iniciado (ping a cada 10 min)');
}
*/

// Função stub para manter compatibilidade
function startKeepAlive(appUrl) {
  console.log('ℹ️ Keep-alive desativado (web e bot em dynos separados)');
}

// Estatísticas globais do bot
const botStats = {
  songsPlayed: 0,
  commandsUsed: 0
};

// Momento de início do bot
const botStartTime = Date.now();

// Função para formatar uptime
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

// Cria e configura o servidor Express
function createWebServer(client, LeaderboardModel, UserFavoritesModel, UserPlaylistModel) {
  // Armazena referências aos modelos
  Leaderboard = LeaderboardModel;
  UserFavorites = UserFavoritesModel;
  UserPlaylist = UserPlaylistModel;
  
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  // Cria servidor HTTP para Socket.IO
  const server = http.createServer(app);
  
  // Inicializa WebSocket
  const playerSocket = createPlayerSocket(server, client);
  
  // Middleware para JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // ========== SESSÃO E AUTH ==========
  
  // Configurar sessões com MongoDB
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dj-yazan-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 7 * 24 * 60 * 60 // 7 dias
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    }
  }));
  
  // Inicializar Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Adicionar user aos locals
  app.use(addUserToLocals);
  
  // Rotas de autenticação
  app.use('/auth', createAuthRouter(client));
  
  // ========== PÁGINAS ==========
  
  // Landing Page
  app.get('/', (req, res) => {
    const stats = {
      uptime: formatUptime(Date.now() - botStartTime),
      servers: client?.guilds?.cache?.size || 0,
      users: client?.guilds?.cache?.reduce((acc, g) => acc + g.memberCount, 0) || 0,
      activePlayers: client?.lavalink?.players?.size || 0,
      isOnline: client?.isReady() || false
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
        // Buscar estatísticas do usuário
        const leaderboardData = await Leaderboard.aggregate([
          { $match: { userId: req.user.discordId } },
          { $group: { 
            _id: '$userId', 
            songs: { $sum: '$songs' }, 
            time: { $sum: '$time' },
            quizPoints: { $sum: '$quizPoints' }
          }}
        ]);
        
        if (leaderboardData[0]) {
          userStats = leaderboardData[0];
        }
        
        // Buscar favoritos
        const userFavs = await UserFavorites?.findOne({ userId: req.user.discordId });
        favorites = userFavs?.tracks || [];
        
        // Buscar playlists
        playlists = await UserPlaylist?.find({ userId: req.user.discordId }) || [];
      }
      
      res.send(getDashboardPage(req.user, userStats, favorites, playlists));
    } catch (error) {
      console.error('Erro no dashboard:', error);
      res.send(getDashboardPage(req.user, { songs: 0, time: 0, quizPoints: 0 }, [], []));
    }
  });
  
  // Leaderboard Page
  app.get('/leaderboard', async (req, res) => {
    try {
      const guildId = req.query.guild;
      const type = req.query.type || 'songs';
      
      let guild = null;
      let leaderboard = [];
      
      if (guildId && client.guilds.cache.has(guildId)) {
        guild = client.guilds.cache.get(guildId);
        
        // Buscar leaderboard do mês atual
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthKey = `${currentYear}-${currentMonth}`;
        
        const sortField = type === 'time' ? 'time' : type === 'quizPoints' ? 'quizPoints' : 'songs';
        
        const data = await Leaderboard.find({ guildId, month: monthKey })
          .sort({ [sortField]: -1 })
          .limit(50);
        
        // Enriquecer com dados do Discord
        leaderboard = await Promise.all(data.map(async (entry, index) => {
          try {
            const member = await guild.members.fetch(entry.userId).catch(() => null);
            return {
              rank: index + 1,
              userId: entry.userId,
              username: member?.user?.username || 'Usuário Desconhecido',
              displayName: member?.displayName || member?.user?.globalName || 'Desconhecido',
              avatar: member?.user?.displayAvatarURL({ size: 64 }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
              value: entry[sortField],
              isCurrentUser: req.user?.discordId === entry.userId
            };
          } catch {
            return {
              rank: index + 1,
              userId: entry.userId,
              username: 'Usuário Desconhecido',
              displayName: 'Desconhecido',
              avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
              value: entry[sortField],
              isCurrentUser: false
            };
          }
        }));
      }
      
      res.send(getLeaderboardPage({ guild, leaderboard, type, user: req.user }));
    } catch (error) {
      console.error('Erro no leaderboard:', error);
      res.send(getLeaderboardPage({ guild: null, leaderboard: [], type: 'songs', user: req.user }));
    }
  });
  
  // Terms of Service
  app.get('/terms', (req, res) => {
    res.send(getTermsPage());
  });
  
  // Privacy Policy
  app.get('/privacy', (req, res) => {
    res.send(getPrivacyPage());
  });
  
  // ========== API ENDPOINTS ==========
  
  // Status do bot
  app.get('/api/status', (req, res) => {
    res.json({
      online: client?.isReady() || false,
      uptime: formatUptime(Date.now() - botStartTime),
      uptimeMs: Date.now() - botStartTime,
      ping: client?.ws?.ping || 0,
      lavalinkNodes: {
        total: client?.lavalink?.nodeManager?.nodes?.size || 0,
        connected: Array.from(client?.lavalink?.nodeManager?.nodes?.values() || []).filter(n => n.connected).length
      }
    });
  });
  
  // Estatísticas do bot
  app.get('/api/stats', async (req, res) => {
    try {
      const totalSongs = await Leaderboard.aggregate([
        { $group: { _id: null, total: { $sum: '$songs' } } }
      ]);
      
      res.json({
        servers: client?.guilds?.cache?.size || 0,
        users: client?.guilds?.cache?.reduce((acc, g) => acc + g.memberCount, 0) || 0,
        activePlayers: client?.lavalink?.players?.size || 0,
        totalSongsPlayed: totalSongs[0]?.total || 0,
        commandsUsed: botStats.commandsUsed
      });
    } catch (error) {
      res.json({ error: 'Erro ao buscar estatísticas' });
    }
  });
  
  // Redirect para invite do bot (Discord App Discovery)
  app.get('/invite', (req, res) => {
    res.redirect('https://discord.com/discovery/applications/1110368033291120703');
  });
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // ========== API - FAVORITOS ==========
  
  // Listar favoritos do usuário logado
  app.get('/api/favorites', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    try {
      const userFavs = await UserFavorites?.findOne({ userId: req.user.discordId });
      res.json(userFavs?.tracks || []);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar favoritos' });
    }
  });
  
  // ========== API - PLAYLISTS ==========
  
  // Listar playlists do usuário logado
  app.get('/api/playlists', async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    try {
      const playlists = await UserPlaylist?.find({ userId: req.user.discordId });
      res.json(playlists || []);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar playlists' });
    }
  });
  
  // ========== API - LEADERBOARD ==========
  
  // Leaderboard de um servidor
  app.get('/api/leaderboard/:guildId', async (req, res) => {
    try {
      const { guildId } = req.params;
      const { type = 'songs', limit = 25 } = req.query;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthKey = `${currentYear}-${currentMonth}`;
      
      const sortField = type === 'time' ? 'time' : type === 'quizPoints' ? 'quizPoints' : 'songs';
      
      const data = await Leaderboard.find({ guildId, month: monthKey })
        .sort({ [sortField]: -1 })
        .limit(parseInt(limit));
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar leaderboard' });
    }
  });
  
  // ========== API - PLAYER (para WebSocket) ==========
  
  // Estado atual do player de um servidor
  app.get('/api/player/:guildId', (req, res) => {
    const { guildId } = req.params;
    const player = client?.lavalink?.getPlayer(guildId);
    
    if (!player || !player.queue.current) {
      return res.json(null);
    }
    
    res.json(playerSocket.getPlayerState(player));
  });
  
  // ========== API - COMANDOS ==========
  
  // Lista de comandos (JSON)
  app.get('/api/commands', (req, res) => {
    const { commands } = require('./pages/commands');
    res.json(commands);
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>404 - Página não encontrada</title>
        <style>
          body { 
            font-family: 'Inter', sans-serif; 
            background: #0f0f23; 
            color: white; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0;
            text-align: center;
          }
          h1 { font-size: 6rem; margin: 0; color: #5865F2; }
          p { color: #b9bbbe; margin: 1rem 0; }
          a { 
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background: #5865F2;
            color: white;
            text-decoration: none;
            border-radius: 8px;
          }
          a:hover { background: #4752C4; }
        </style>
      </head>
      <body>
        <div>
          <h1>404</h1>
          <p>Oops! Esta página não foi encontrada.</p>
          <a href="/">Voltar para o início</a>
        </div>
      </body>
      </html>
    `);
  });
  
  // Inicia o servidor
  server.listen(PORT, () => {
    console.log(`🌐 Landing Page rodando em http://localhost:${PORT}`);
    console.log(`🔌 WebSocket ativo em ws://localhost:${PORT}/player`);
    
    // Inicia sistema keep-alive para evitar idle do Heroku
    const appUrl = process.env.APP_URL || `https://dj-yazan-841149114742.herokuapp.com`;
    startKeepAlive(appUrl);
  });
  
  return { app, server, botStats, formatUptime, playerSocket };
}

module.exports = { 
  createWebServer, 
  botStats,
  formatUptime,
  botStartTime,
  startKeepAlive
};
