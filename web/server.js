// ============================================
// 🌐 SERVIDOR WEB EXPRESS
// ============================================

const express = require('express');
const { getLandingPage } = require('./pages/landing');
const { getTermsPage } = require('./pages/terms');
const { getPrivacyPage } = require('./pages/privacy');

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
function createWebServer(client, Leaderboard) {
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  // Middleware para JSON
  app.use(express.json());
  
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
  
  // Redirect para invite do bot
  app.get('/invite', (req, res) => {
    const clientId = process.env.CLIENT_ID;
    const permissions = '3147776'; // Permissões necessárias
    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;
    res.redirect(inviteUrl);
  });
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
  app.listen(PORT, () => {
    console.log(`🌐 Landing Page rodando em http://localhost:${PORT}`);
  });
  
  return { app, botStats, formatUptime };
}

module.exports = { 
  createWebServer, 
  botStats,
  formatUptime,
  botStartTime
};
