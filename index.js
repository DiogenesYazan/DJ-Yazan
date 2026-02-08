require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder,
  ActivityType
} = require('discord.js');
const { LavalinkManager } = require('lavalink-client');
const fs = require('fs');
const express = require('express');
const lavalinkServers = require('./lavalink-servers.json');

// ============================================
// 🌐 SERVIDOR WEB (Landing Page + API)
// ============================================
const app = express();
const PORT = process.env.PORT || 3000;
const botStartTime = Date.now();

// Estatísticas globais
const botStats = {
  songsPlayed: 0,
  commandsUsed: 0
};

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

// Landing Page HTML
function getLandingPage(client) {
  const uptime = formatUptime(Date.now() - botStartTime);
  const servers = client?.guilds?.cache?.size || 0;
  const users = client?.guilds?.cache?.reduce((acc, g) => acc + g.memberCount, 0) || 0;
  const activePlayers = client?.lavalink?.players?.size || 0;
  const isOnline = client?.isReady() || false;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DJ Yazan - Bot de Música para Discord</title>
  <meta name="description" content="O melhor bot de música para Discord. Ouça suas músicas favoritas com qualidade premium!">
  <meta name="theme-color" content="#5865F2">
  <link rel="icon" href="https://i.imgur.com/4t8XUT5.jpeg">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --primary: #5865F2;
      --primary-dark: #4752C4;
      --secondary: #EB459E;
      --background: #0f0f23;
      --surface: #1a1a2e;
      --surface-light: #252542;
      --text: #ffffff;
      --text-muted: #b9bbbe;
      --success: #57F287;
      --warning: #FEE75C;
      --danger: #ED4245;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: var(--background);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
    }
    
    /* Animated Background */
    .bg-animation {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
    }
    
    .bg-animation::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: 
        radial-gradient(circle at 20% 80%, rgba(88, 101, 242, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(235, 69, 158, 0.1) 0%, transparent 50%);
    }
    
    /* Navigation */
    nav {
      position: fixed;
      top: 0;
      width: 100%;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(10px);
      background: rgba(15, 15, 35, 0.8);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: var(--text);
    }
    
    .logo img {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      border: 2px solid var(--primary);
    }
    
    .logo span {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .nav-links {
      display: flex;
      gap: 1rem;
    }
    
    .nav-links a {
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      text-decoration: none;
      color: var(--text);
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .nav-links a:hover {
      background: var(--surface-light);
    }
    
    .nav-links .btn-primary {
      background: var(--primary);
    }
    
    .nav-links .btn-primary:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
    }
    
    /* Hero Section */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 6rem 2rem 4rem;
    }
    
    .hero-content {
      max-width: 800px;
    }
    
    .hero-avatar {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 4px solid var(--primary);
      margin-bottom: 2rem;
      box-shadow: 0 0 50px rgba(88, 101, 242, 0.4);
      animation: pulse 2s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 50px rgba(88, 101, 242, 0.4); }
      50% { box-shadow: 0 0 80px rgba(88, 101, 242, 0.6); }
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: ${isOnline ? 'rgba(87, 242, 135, 0.2)' : 'rgba(237, 66, 69, 0.2)'};
      border: 1px solid ${isOnline ? 'var(--success)' : 'var(--danger)'};
      border-radius: 50px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: ${isOnline ? 'var(--success)' : 'var(--danger)'};
      animation: ${isOnline ? 'blink 1.5s ease-in-out infinite' : 'none'};
    }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #fff 0%, #b9bbbe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .hero p {
      font-size: 1.25rem;
      color: var(--text-muted);
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    
    .hero-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 1rem 2rem;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    
    .btn-large {
      padding: 1.2rem 2.5rem;
      font-size: 1.1rem;
    }
    
    .btn-discord {
      background: var(--primary);
      color: white;
    }
    
    .btn-discord:hover {
      background: var(--primary-dark);
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(88, 101, 242, 0.4);
    }
    
    .btn-outline {
      background: transparent;
      color: var(--text);
      border: 2px solid var(--surface-light);
    }
    
    .btn-outline:hover {
      border-color: var(--primary);
      background: rgba(88, 101, 242, 0.1);
    }
    
    /* Stats Section */
    .stats {
      padding: 4rem 2rem;
      background: var(--surface);
    }
    
    .stats-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }
    
    .stat-card {
      background: var(--surface-light);
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: transform 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
    }
    
    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      font-size: 1.5rem;
    }
    
    .stat-icon.purple { background: rgba(88, 101, 242, 0.2); color: var(--primary); }
    .stat-icon.pink { background: rgba(235, 69, 158, 0.2); color: var(--secondary); }
    .stat-icon.green { background: rgba(87, 242, 135, 0.2); color: var(--success); }
    .stat-icon.yellow { background: rgba(254, 231, 92, 0.2); color: var(--warning); }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    .stat-label {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    
    /* Features Section */
    .features {
      padding: 6rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .section-title {
      text-align: center;
      margin-bottom: 4rem;
    }
    
    .section-title h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    
    .section-title p {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    
    .feature-card {
      background: var(--surface);
      padding: 2rem;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
    }
    
    .feature-card:hover {
      border-color: var(--primary);
      transform: translateY(-5px);
    }
    
    .feature-card i {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .feature-card h3 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
    }
    
    .feature-card p {
      color: var(--text-muted);
      line-height: 1.6;
    }
    
    /* Commands Preview */
    .commands {
      padding: 6rem 2rem;
      background: var(--surface);
    }
    
    .commands-list {
      max-width: 800px;
      margin: 0 auto;
      display: grid;
      gap: 1rem;
    }
    
    .command-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      background: var(--surface-light);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .command-name {
      background: var(--primary);
      padding: 0.3rem 0.8rem;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    .command-desc {
      color: var(--text-muted);
    }
    
    /* Footer */
    footer {
      padding: 3rem 2rem;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    footer p {
      color: var(--text-muted);
      margin-bottom: 1rem;
    }
    
    footer a {
      color: var(--primary);
      text-decoration: none;
    }
    
    footer a:hover {
      text-decoration: underline;
    }
    
    .social-links {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .social-links a {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      background: var(--surface);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
      font-size: 1.2rem;
      transition: all 0.3s ease;
    }
    
    .social-links a:hover {
      background: var(--primary);
      transform: translateY(-3px);
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      h1 { font-size: 2.5rem; }
      .hero p { font-size: 1rem; }
      .nav-links { display: none; }
      .stat-value { font-size: 2rem; }
    }
  </style>
</head>
<body>
  <div class="bg-animation"></div>
  
  <nav>
    <a href="/" class="logo">
      <img src="https://i.imgur.com/4t8XUT5.jpeg" alt="DJ Yazan">
      <span>DJ Yazan</span>
    </a>
    <div class="nav-links">
      <a href="#features">Recursos</a>
      <a href="#commands">Comandos</a>
      <a href="/api/status">API</a>
      <a href="/invite" class="btn-primary">Adicionar Bot</a>
    </div>
  </nav>
  
  <section class="hero">
    <div class="hero-content">
      <img src="https://i.imgur.com/4t8XUT5.jpeg" alt="DJ Yazan" class="hero-avatar">
      
      <div class="status-badge">
        <div class="status-dot"></div>
        <span>${isOnline ? 'Online' : 'Offline'} • Uptime: ${uptime}</span>
      </div>
      
      <h1>DJ Yazan</h1>
      <p>O bot de música definitivo para seu servidor Discord. 
         Qualidade premium, comandos intuitivos e uma experiência musical incomparável.</p>
      
      <div class="hero-buttons">
        <a href="/invite" class="btn btn-discord btn-large">
          <i class="fab fa-discord"></i>
          Adicionar ao Discord
        </a>
        <a href="#features" class="btn btn-outline btn-large">
          <i class="fas fa-info-circle"></i>
          Saiba Mais
        </a>
      </div>
    </div>
  </section>
  
  <section class="stats">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon purple">
          <i class="fas fa-server"></i>
        </div>
        <div class="stat-value">${servers.toLocaleString()}</div>
        <div class="stat-label">Servidores</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pink">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-value">${users.toLocaleString()}</div>
        <div class="stat-label">Usuários</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon green">
          <i class="fas fa-music"></i>
        </div>
        <div class="stat-value">${activePlayers}</div>
        <div class="stat-label">Tocando Agora</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon yellow">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-value">${uptime}</div>
        <div class="stat-label">Uptime</div>
      </div>
    </div>
  </section>
  
  <section class="features" id="features">
    <div class="section-title">
      <h2>✨ Recursos Incríveis</h2>
      <p>Tudo que você precisa para a melhor experiência musical</p>
    </div>
    
    <div class="features-grid">
      <div class="feature-card">
        <i class="fas fa-headphones"></i>
        <h3>Qualidade Premium</h3>
        <p>Áudio de alta qualidade usando Lavalink v4, sem travamentos ou quedas.</p>
      </div>
      
      <div class="feature-card">
        <i class="fas fa-search"></i>
        <h3>Busca Inteligente</h3>
        <p>Pesquise por nome ou cole links do YouTube, Spotify e mais.</p>
      </div>
      
      <div class="feature-card">
        <i class="fas fa-list"></i>
        <h3>Sistema de Filas</h3>
        <p>Gerencie sua playlist com comandos de fila, shuffle e loop.</p>
      </div>
      
      <div class="feature-card">
        <i class="fas fa-gamepad"></i>
        <h3>Quiz Musical</h3>
        <p>Jogue com amigos e descubra quem conhece mais músicas!</p>
      </div>
      
      <div class="feature-card">
        <i class="fas fa-trophy"></i>
        <h3>Leaderboard</h3>
        <p>Ranking mensal dos usuários que mais ouvem música.</p>
      </div>
      
      <div class="feature-card">
        <i class="fas fa-infinity"></i>
        <h3>Modo 24/7</h3>
        <p>Mantenha o bot no canal de voz 24 horas por dia.</p>
      </div>
    </div>
  </section>
  
  <section class="commands" id="commands">
    <div class="section-title">
      <h2>🎮 Comandos Principais</h2>
      <p>Simples, rápidos e intuitivos</p>
    </div>
    
    <div class="commands-list">
      <div class="command-item">
        <span class="command-name">/play</span>
        <span class="command-desc">Toca uma música ou adiciona à fila</span>
      </div>
      <div class="command-item">
        <span class="command-name">/queue</span>
        <span class="command-desc">Mostra a fila de músicas</span>
      </div>
      <div class="command-item">
        <span class="command-name">/skip</span>
        <span class="command-desc">Pula para a próxima música</span>
      </div>
      <div class="command-item">
        <span class="command-name">/loop</span>
        <span class="command-desc">Ativa loop na música ou fila</span>
      </div>
      <div class="command-item">
        <span class="command-name">/shuffle</span>
        <span class="command-desc">Embaralha a fila</span>
      </div>
      <div class="command-item">
        <span class="command-name">/quiz</span>
        <span class="command-desc">Inicia um quiz musical</span>
      </div>
      <div class="command-item">
        <span class="command-name">/leaderboard</span>
        <span class="command-desc">Mostra o ranking do servidor</span>
      </div>
      <div class="command-item">
        <span class="command-name">/controller</span>
        <span class="command-desc">Painel de controle com botões</span>
      </div>
    </div>
  </section>
  
  <footer>
    <p>Desenvolvido com 💜 por <a href="https://diogenesyuri.works/" target="_blank">Diógenes Yuri</a></p>
    <p>© ${new Date().getFullYear()} DJ Yazan. Todos os direitos reservados.</p>
    
    <div class="social-links">
      <a href="https://diogenesyuri.works/" target="_blank" title="Portfolio">
        <i class="fas fa-globe"></i>
      </a>
      <a href="https://github.com/DiogenesYazan" target="_blank" title="GitHub">
        <i class="fab fa-github"></i>
      </a>
      <a href="/invite" title="Discord">
        <i class="fab fa-discord"></i>
      </a>
    </div>
  </footer>
  
  <script>
    // Auto-refresh stats every 30 seconds
    setTimeout(() => location.reload(), 60000);
  </script>
</body>
</html>
  `;
}

// Rotas da API
app.get('/', (req, res) => {
  res.send(getLandingPage(client));
});

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

app.get('/invite', (req, res) => {
  const clientId = process.env.CLIENT_ID;
  const permissions = '3147776'; // Permissões necessárias
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;
  res.redirect(inviteUrl);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicia servidor web
app.listen(PORT, () => {
  console.log(`🌐 Landing Page rodando em http://localhost:${PORT}`);
});

// ============================================
// 🤖 BOT DISCORD
// ============================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  presence: {
    status: 'online',
    activities: [{ name: 'iniciando...', type: ActivityType.Playing }]
  }
});

// Inicializa Mongoose para conexão com MongoDB
const mongoose = require('mongoose');
const Leaderboard = require('./models/Leaderboard');
const GuildConfig = require('./models/GuildConfig');
const QuizSession = require('./models/QuizSession');

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// Carrega comandos
client.commands = new Collection();
for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

// Map para armazenar modo de loop por guilda
client.loopModes = new Map();
// Map para armazenar estado do Quiz por guilda
client.quizStates = new Map();

// Map para tracking de tempo de música (para leaderboard)
const trackStartTimes = new Map();
// Exporta globalmente para os comandos acessarem
global.trackStartTimes = trackStartTimes;

// Funções de barra de progresso MODERNA
const BAR_SIZE = 12; // Tamanho da barra de progresso
const BLOCK_INTERVAL = 5_000;

// Emojis para barra de progresso estilo Hydra
const BAR_START_EMPTY = '<:ble:1337688291081334784>';
const BAR_START_FULL = '<:blf:1337688303257280522>';
const BAR_MIDDLE_EMPTY = '<:bme:1337688315433345044>';
const BAR_MIDDLE_FULL = '<:bmf:1337688327030550548>';
const BAR_END_EMPTY = '<:bee:1337688337940000778>';
const BAR_END_FULL = '<:bef:1337688348761333770>';

// Fallback com caracteres Unicode caso não tenha emojis customizados
const USE_CUSTOM_EMOJIS = false; // Mude para true se adicionar os emojis no servidor

// Função para formatar tempo em mm:ss ou hh:mm:ss
function formatTime(ms) {
  if (!ms || ms <= 0 || isNaN(ms)) return '0:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// Barra de progresso moderna estilo Hydra/Jockie
function makeProgressBar(current, total) {
  if (!total || total <= 0 || isNaN(total)) {
    // Stream ao vivo - barra animada
    return '▬▬▬🔴▬▬▬▬▬▬▬▬ LIVE';
  }
  
  const progress = Math.min(current / total, 1);
  const filledBars = Math.round(progress * BAR_SIZE);
  
  if (USE_CUSTOM_EMOJIS) {
    // Versão com emojis customizados (mais bonita)
    let bar = '';
    for (let i = 0; i < BAR_SIZE; i++) {
      if (i === 0) {
        bar += i < filledBars ? BAR_START_FULL : BAR_START_EMPTY;
      } else if (i === BAR_SIZE - 1) {
        bar += i < filledBars ? BAR_END_FULL : BAR_END_EMPTY;
      } else {
        bar += i < filledBars ? BAR_MIDDLE_FULL : BAR_MIDDLE_EMPTY;
      }
    }
    return bar;
  } else {
    // Versão Unicode moderna
    let bar = '';
    for (let i = 0; i < BAR_SIZE; i++) {
      if (i === filledBars) {
        bar += '🔘'; // Indicador de posição
      } else if (i < filledBars) {
        bar += '▬';
      } else {
        bar += '▬';
      }
    }
    // Adiciona cor visual com ▰▱ alternativo
    const filled = '▰'.repeat(filledBars);
    const empty = '▱'.repeat(BAR_SIZE - filledBars);
    return filled + '⚪' + empty;
  }
}

// Status icons
const STATUS_ICONS = {
  playing: '▶️',
  paused: '⏸️',
  stopped: '⏹️'
};

// Embed moderno estilo Hydra
function mkEmbedBlocks(track, player) {
  const currentTime = player ? player.position : 0;
  const totalTime = track.info.length || track.info.duration || 0;
  const duration = totalTime || player?.queue?.current?.info?.length || 0;
  
  // Status atual
  const status = player.paused ? 'paused' : 'playing';
  const statusIcon = STATUS_ICONS[status];
  const statusText = player.paused ? 'Pausado' : 'Tocando';
  
  // Barra de progresso
  const progressBar = makeProgressBar(currentTime, duration);
  
  // Tempo formatado
  const timeDisplay = duration > 0 
    ? `\`${formatTime(currentTime)}\` ${progressBar} \`${formatTime(duration)}\``
    : `\`${formatTime(currentTime)}\` ${progressBar}`;
  
  // Informações do requester
  const requester = track.requester;
  const requesterText = requester ? `<@${requester.id}>` : 'Autoplay';
  
  // Próxima música na fila
  const nextTrack = player.queue.tracks[0];
  const nextText = nextTrack 
    ? `[${nextTrack.info.title.slice(0, 40)}${nextTrack.info.title.length > 40 ? '...' : ''}](${nextTrack.info.uri})`
    : 'Nenhuma';
  
  // Loop mode
  const loopMode = player.guildId ? (client.loopModes?.get(player.guildId) || 'off') : 'off';
  const loopIcons = { off: '➡️', track: '🔂', queue: '🔁' };
  const loopText = { off: 'Desativado', track: 'Música', queue: 'Fila' };
  
  // Volume icon dinâmico
  const vol = player.volume;
  const volIcon = vol === 0 ? '🔇' : vol < 30 ? '🔈' : vol < 70 ? '🔉' : '🔊';
  
  // Cor do embed baseada no status
  const embedColor = player.paused ? 0xFFA500 : 0x5865F2; // Laranja se pausado, Discord Blurple se tocando
  
  const embed = new EmbedBuilder()
    .setAuthor({ 
      name: `${statusIcon} ${statusText}`, 
      iconURL: 'https://cdn.discordapp.com/emojis/1055188868453359616.gif' // Ícone animado opcional
    })
    .setTitle(track.info.title)
    .setURL(track.info.uri)
    .setDescription(timeDisplay)
    .addFields(
      { name: '👤 Artista', value: track.info.author || 'Desconhecido', inline: true },
      { name: '🎧 Pedido por', value: requesterText, inline: true },
      { name: `${volIcon} Volume`, value: `${vol}%`, inline: true },
      { name: `${loopIcons[loopMode]} Loop`, value: loopText[loopMode], inline: true },
      { name: '📋 Na Fila', value: `${player.queue.tracks.length} música(s)`, inline: true },
      { name: '⏭️ Próxima', value: nextText, inline: true }
    )
    .setThumbnail(track.info.artworkUrl || null)
    .setColor(embedColor)
    .setFooter({ 
      text: `🎵 DJ Yazan • Qualidade: Alta`, 
      iconURL: player.node?.options?.host ? undefined : undefined 
    })
    .setTimestamp();
  
  // Adiciona imagem grande se for do YouTube
  if (track.info.artworkUrl && track.info.sourceName === 'youtube') {
    // Usa thumbnail maior do YouTube
    const videoId = track.info.identifier;
    const highResThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    embed.setImage(highResThumbnail);
  }
  
  return embed;
}

// Configuração do Lavalink v4 com múltiplos servidores e fallback automático
// Carrega servidores do arquivo lavalink-servers.json
const lavalinkNodes = lavalinkServers.nodes
  .sort((a, b) => a.priority - b.priority) // Ordena por prioridade
  .map(server => ({
    id: server.id,
    host: server.host,
    port: server.port,
    authorization: server.password,
    secure: server.secure,
    // Configurações de conexão otimizadas
    requestSignalTimeoutMS: 10000,
    closeOnError: false,
    heartBeatInterval: 30_000,
    enablePingOnStatsCheck: true,
    retryDelay: 10_000,
    retryAmount: 5
  }));

console.log(`📋 Carregados ${lavalinkNodes.length} servidores Lavalink do arquivo de configuração`);

client.lavalink = new LavalinkManager({
  nodes: lavalinkNodes,
  sendToShard: (guildId, payload) => 
    client.guilds.cache.get(guildId)?.shard?.send(payload),
  client: {
    id: process.env.CLIENT_ID,
    username: 'DJ Yazan'
  },
  autoSkip: true,
  autoSkipOnResolveError: true,
  emitNewSongsOnly: false, // Emite eventos para músicas em loop
  playerOptions: {
    applyVolumeAsFilter: false,
    clientBasedPositionUpdateInterval: 100,
    defaultSearchPlatform: 'ytsearch',
    volumeDecrementer: 1, // 100% no cliente = 100% no lavalink
    onDisconnect: {
      autoReconnect: true,
      destroyPlayer: false
    },
    onEmptyQueue: {
      destroyAfterMs: 30_000
    },
    useUnresolvedData: true,
    maxErrorsPerTime: {
      threshold: 10_000,
      maxAmount: 3
    }
  },
  queueOptions: {
    maxPreviousTracks: 25
  },
  linksAllowed: true,
  linksBlacklist: [],
  linksWhitelist: [],
  // Seleciona o melhor nó disponível (primeiro conectado por prioridade)
  advancedOptions: {
    nodeResolver: (nodes, connection) => {
      // Filtra apenas nós conectados
      const connectedNodes = nodes.filter(node => node.connected);
      
      if (connectedNodes.length === 0) {
        console.log('⚠️ Nenhum nó Lavalink conectado para resolver!');
        return null;
      }
      
      // Retorna o primeiro nó conectado (já ordenado por prioridade)
      const selectedNode = connectedNodes[0];
      const serverInfo = lavalinkServers.nodes.find(s => s.id === selectedNode.id);
      console.log(`🎯 Usando servidor: ${serverInfo?.name || selectedNode.id}`);
      return selectedNode;
    }
  }
});

client.once('clientReady', () => {
  console.log(`✅ Online: ${client.user.tag}`);
  
  // Verificar se há servidores configurados no JSON
  if (!lavalinkServers.nodes || lavalinkServers.nodes.length === 0) {
    console.error('❌ ERRO: Nenhum servidor Lavalink configurado!');
    console.error('📝 Verifique o arquivo lavalink-servers.json');
    return;
  }
  
  console.log(`🎵 Inicializando Lavalink Manager...`);
  console.log(`📡 Servidores configurados:`);
  lavalinkServers.nodes.forEach((server, index) => {
    console.log(`   ${index + 1}. ${server.name} (${server.host}:${server.port}) - ${server.secure ? 'SSL' : 'HTTP'}`);
  });
  
  // Inicializar Lavalink com o usuário do bot
  client.lavalink.init({
    id: client.user.id,
    username: client.user.username
  });

  // Rotação de status
  const statuses = [
    '♬ tocando música',
    '🎵 use /play para ouvir',
    `${client.guilds.cache.size} servidores`,
    '🎶 música é vida',
    '🔁 use /loop para loop',
    '🎧 Ariel deixe de brincadeira gostosa',
    '📻 música 24/7',
    '🎤 solicite uma música',
    '🎼 OS CARA TÁ NA MALDADE',
    '🎹 ESCONDAM A MAKITA',
    '🎷 relaxe com música',
    '🎺 NÃO CHORAXX' 
  ];
  let idx = 0;
  setInterval(() => {
    client.user.setActivity(statuses[idx]);
    idx = (idx + 1) % statuses.length;
  }, 30_000);
});

// Variável para controlar se o Lavalink está pronto
let lavalinkReady = false;

// Evento RAW do Discord - IMPORTANTE: enviar dados para o Lavalink
client.on('raw', (data) => {
  client.lavalink.sendRawData(data);
});

// === Eventos do Node Manager (conexão com Lavalink) ===
client.lavalink.nodeManager.on('create', (node) => {
  console.log(`🔧 Criando nó Lavalink: ${node.id} (${node.options.host}:${node.options.port})`);
});

client.lavalink.nodeManager.on('connect', (node) => {
  const serverInfo = lavalinkServers.nodes.find(s => s.id === node.id);
  console.log(`✅ Conectado ao Lavalink: ${serverInfo?.name || node.id}`);
  console.log(`   Host: ${node.options.host}:${node.options.port}`);
  console.log(`   Versão: Lavalink v4`);
  console.log(`   Secure: ${node.options.secure ? 'SSL/TLS' : 'HTTP'}`);
  lavalinkReady = true;
  
  // Log de status geral dos nós
  const allNodes = Array.from(client.lavalink.nodeManager.nodes.values());
  const connected = allNodes.filter(n => n.connected).length;
  console.log(`📊 Status: ${connected}/${allNodes.length} servidores conectados`);
});

client.lavalink.nodeManager.on('reconnecting', (node) => {
  const serverInfo = lavalinkServers.nodes.find(s => s.id === node.id);
  console.log(`🔄 Reconectando ao Lavalink: ${serverInfo?.name || node.id}...`);
});

client.lavalink.nodeManager.on('disconnect', (node, reason) => {
  const serverInfo = lavalinkServers.nodes.find(s => s.id === node.id);
  console.log(`❌ Desconectado do Lavalink: ${serverInfo?.name || node.id}`);
  console.log(`   Motivo: ${reason?.code || 'Desconhecido'} - ${reason?.reason || 'N/A'}`);
  
  // Verifica nós conectados
  const connectedNodes = Array.from(client.lavalink.nodeManager.nodes.values())
    .filter(n => n.connected);
  
  if (connectedNodes.length === 0) {
    lavalinkReady = false;
    console.log('⚠️ Nenhum servidor Lavalink disponível! Tentando reconectar...');
  } else {
    // Ainda há nós disponíveis - informa qual será usado
    const nextNode = connectedNodes[0];
    const nextServerInfo = lavalinkServers.nodes.find(s => s.id === nextNode.id);
    console.log(`🔀 Fallback ativo! Usando servidor: ${nextServerInfo?.name || nextNode.id}`);
    console.log(`📊 Status: ${connectedNodes.length}/${lavalinkServers.nodes.length} servidores conectados`);
    
    // Migra players ativos para o próximo nó disponível
    const players = Array.from(client.lavalink.players.values())
      .filter(p => p.node?.id === node.id);
    
    if (players.length > 0) {
      console.log(`🔄 Migrando ${players.length} player(s) para ${nextServerInfo?.name || nextNode.id}...`);
      players.forEach(async (player) => {
        try {
          await player.changeNode(nextNode);
          console.log(`   ✅ Player ${player.guildId} migrado com sucesso`);
        } catch (err) {
          console.error(`   ❌ Erro ao migrar player ${player.guildId}:`, err.message);
        }
      });
    }
  }
});

client.lavalink.nodeManager.on('error', (node, error, payload) => {
  const serverInfo = lavalinkServers.nodes.find(s => s.id === node.id);
  console.error(`❌ Erro no Lavalink ${serverInfo?.name || node.id}:`);
  console.error(`   Mensagem: ${error.message || error}`);
  if (payload) {
    console.error(`   Payload:`, payload);
  }
  
  // Verifica se há outros nós disponíveis
  const connectedNodes = Array.from(client.lavalink.nodeManager.nodes.values())
    .filter(n => n.connected && n.id !== node.id);
  
  if (connectedNodes.length > 0) {
    const nextNode = connectedNodes[0];
    const nextServerInfo = lavalinkServers.nodes.find(s => s.id === nextNode.id);
    console.log(`🔀 Servidor alternativo disponível: ${nextServerInfo?.name || nextNode.id}`);
  }
});

client.lavalink.nodeManager.on('destroy', (node) => {
  const serverInfo = lavalinkServers.nodes.find(s => s.id === node.id);
  console.log(`🗑️ Nó Lavalink destruído: ${serverInfo?.name || node.id}`);
});

// === Eventos do Player (música) ===

// Barra de progresso ao iniciar faixa
const ivMap = new Map();
client.lavalink.on('trackStart', async (player, track) => {
  const ch = client.channels.cache.get(player.textChannelId);
  if (!ch) return;
  // --- ANTI-SPOILER QUIZ ---
  // Se houver um quiz ativo neste servidor, não mostre "Tocando Agora"
  if (client.quizStates && client.quizStates.has(player.guildId)) return;

  const msg = await ch.send({ embeds: [mkEmbedBlocks(track, player)] });
  
  // === LEADERBOARD TRACKING ===
  // Registra início da música para tracking de tempo
  if (track.requester && track.requester.id) {
    const trackKey = `${player.guildId}_${track.requester.id}`;
    trackStartTimes.set(trackKey, Date.now());
    console.log(`📊 [Leaderboard] Iniciando tracking: ${track.requester.id} - ${track.info.title.slice(0, 30)}`);
    
    // Incrementa contador de músicas
    await updateLeaderboard(player.guildId, track.requester.id, 'song');
  }
  
  // Atualizar barra de progresso a cada 5 segundos
  const iv = setInterval(async () => {
    if (!player.queue.current) {
      clearInterval(iv);
      return;
    }
    
    try { 
      await msg.edit({ embeds: [mkEmbedBlocks(track, player)] }); 
    } catch (err) {
      // Mensagem foi deletada ou outro erro
      clearInterval(iv);
    }
  }, BLOCK_INTERVAL);

  ivMap.set(player.guildId, iv);
});

// Limpa barra quando necessário
function stopIv(guildId) {
  const iv = ivMap.get(guildId);
  if (iv) {
    clearInterval(iv);
    ivMap.delete(guildId);
  }
}

// Loop manual ao finalizar faixa
client.lavalink.on('trackEnd', (player, track, payload) => {
  // === LEADERBOARD TRACKING ===
  // Registra tempo ouvido quando música termina
  if (track.requester && track.requester.id) {
    const trackKey = `${player.guildId}_${track.requester.id}`;
    const startTime = trackStartTimes.get(trackKey);
    
    if (startTime) {
      const timeListened = Date.now() - startTime;
      console.log(`📊 [Leaderboard] Tempo registrado: ${track.requester.id} - ${Math.floor(timeListened/1000)}s`);
      updateLeaderboard(player.guildId, track.requester.id, 'time', timeListened);
      trackStartTimes.delete(trackKey);
    }
  }
  
  const mode = client.loopModes.get(player.guildId) || 'off';

  if (mode === 'track') {
    // Loop na música atual
    player.queue.unshift(track);
  } else if (mode === 'queue') {
    // Loop na fila - adiciona no final
    player.queue.add(track);
  } else {
    // Sem loop - limpa o intervalo
    stopIv(player.guildId);
  }
});

// Ações ao terminar a fila
client.lavalink.on('queueEnd', async (player) => {
  const mode = client.loopModes.get(player.guildId) || 'off';
  
  const ch = client.channels.cache.get(player.textChannelId);
  if (ch) {
    ch.send({
      content: `✅ Fim da fila${mode === 'off' ? '' : ` (loop: ${mode})`}`,
      ephemeral: false
    }).catch(() => {});
  }
  
  if (mode === 'off') {
    stopIv(player.guildId);
    
    // Verifica modo 24/7 no Banco de Dados
    const config = await GuildConfig.findOne({ guildId: player.guildId });
    const is247 = config ? config.alwaysOn : false;
    
    if (!is247) {
      // Verifica se há Quiz Ativo (Memória ou DB)
      // Se houver, NÃO agenda desconexão, pois o quiz limpa a fila entre rodadas
      const isQuizActive = client.quizStates.has(player.guildId) || await QuizSession.exists({ guildId: player.guildId });
      
      if (!isQuizActive) {
        // Se não está em modo 24/7 e não tem quiz, desconecta após 30 segundos
        setTimeout(() => {
          const currentPlayer = client.lavalink.getPlayer(player.guildId);
          // Verifica novamente quiz (pode ter começado nesses 30s)
          if (client.quizStates.has(player.guildId)) return;

          if (currentPlayer && !currentPlayer.playing && currentPlayer.queue.tracks.length === 0) {
            currentPlayer.destroy();
          }
        }, 30000);
      }
    }
  }
});

// Handler de interações (comandos e botões)
client.on('interactionCreate', async i => {
  // Handler de comandos
  if (i.isChatInputCommand()) {
    const cmd = client.commands.get(i.commandName);
    if (!cmd) return;

    // Incrementa contador de comandos usados
    botStats.commandsUsed++;

    try {
      await cmd.execute(i);
    } catch (e) {
      console.error('Erro:', e);
      const r = { content: '❌ Erro interno', flags: [64] };
      i.replied || i.deferred
        ? await i.followUp(r)
        : await i.reply(r);
    }
    return;
  }

  // Handler de botões do controller
  if (i.isButton()) {
    const player = client.lavalink.getPlayer(i.guild.id);
    
    if (!player || !player.queue.current) {
      return i.reply({
        content: '❌ Não há nenhuma música tocando!',
        ephemeral: true
      });
    }

    try {
      switch (i.customId) {
        case 'controller_pause':
          const currentTrackPause = player.queue.current;
          const guildIdPause = i.guild.id;
          
          if (player.paused) {
            // === RETOMAR - reinicia o contador de tempo ===
            if (currentTrackPause?.requester?.id) {
              const trackKey = `${guildIdPause}_${currentTrackPause.requester.id}`;
              trackStartTimes.set(trackKey, Date.now());
            }
            await player.resume();
            await i.reply({ content: '▶️ Reprodução retomada!', ephemeral: true });
          } else {
            // === PAUSAR - salva o tempo até agora ===
            if (currentTrackPause?.requester?.id) {
              const trackKey = `${guildIdPause}_${currentTrackPause.requester.id}`;
              const startTime = trackStartTimes.get(trackKey);
              
              if (startTime) {
                const timeListened = Date.now() - startTime;
                await updateLeaderboard(guildIdPause, currentTrackPause.requester.id, 'time', timeListened);
                trackStartTimes.delete(trackKey);
              }
            }
            await player.pause();
            await i.reply({ content: '⏸️ Música pausada!', ephemeral: true });
          }
          break;

        case 'controller_skip':
          const skippedTrack = player.queue.current;
          const guildIdSkip = i.guild.id;
          
          // === REGISTRAR TEMPO ANTES DE PULAR ===
          if (skippedTrack?.requester?.id) {
            const trackKey = `${guildIdSkip}_${skippedTrack.requester.id}`;
            const startTime = trackStartTimes.get(trackKey);
            
            if (startTime) {
              const timeListened = Date.now() - startTime;
              await updateLeaderboard(guildIdSkip, skippedTrack.requester.id, 'time', timeListened);
              trackStartTimes.delete(trackKey);
            }
          }
          
          await player.skip();
          await i.reply({ content: `⏭️ Pulada: **${skippedTrack.info.title}**`, ephemeral: true });
          break;

        case 'controller_stop':
          const stoppedTrack = player.queue.current;
          const guildIdStop = i.guild.id;
          
          // === REGISTRAR TEMPO ANTES DE PARAR ===
          if (stoppedTrack?.requester?.id) {
            const trackKey = `${guildIdStop}_${stoppedTrack.requester.id}`;
            const startTime = trackStartTimes.get(trackKey);
            
            if (startTime) {
              const timeListened = Date.now() - startTime;
              await updateLeaderboard(guildIdStop, stoppedTrack.requester.id, 'time', timeListened);
              trackStartTimes.delete(trackKey);
            }
          }
          
          await player.stopPlaying(true, false);
          await i.reply({ content: '⏹️ Reprodução parada e fila limpa!', ephemeral: true });
          break;

        case 'controller_shuffle':
          if (player.queue.tracks.length < 2) {
            return i.reply({ content: '❌ Mínimo 2 músicas na fila!', ephemeral: true });
          }
          const tracks = [...player.queue.tracks];
          for (let j = tracks.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [tracks[j], tracks[k]] = [tracks[k], tracks[j]];
          }
          player.queue.tracks = tracks;
          await i.reply({ content: '🔀 Fila embaralhada!', ephemeral: true });
          break;

        case 'controller_loop':
          const currentMode = client.loopModes.get(i.guild.id) || 'off';
          const modes = ['off', 'track', 'queue'];
          const nextMode = modes[(modes.indexOf(currentMode) + 1) % modes.length];
          client.loopModes.set(i.guild.id, nextMode);
          await i.reply({ content: `🔁 Loop: **${nextMode}**`, ephemeral: true });
          break;

        case 'controller_volume_down':
          const newVolDown = Math.max(0, player.volume - 10);
          await player.setVolume(newVolDown);
          await i.reply({ content: `🔉 Volume: ${newVolDown}%`, ephemeral: true });
          break;

        case 'controller_volume_up':
          const newVolUp = Math.min(200, player.volume + 10);
          await player.setVolume(newVolUp);
          await i.reply({ content: `🔊 Volume: ${newVolUp}%`, ephemeral: true });
          break;

        case 'controller_queue':
          const queue = player.queue.tracks;
          if (queue.length === 0) {
            return i.reply({ content: '📋 A fila está vazia!', ephemeral: true });
          }
          const queueList = queue.slice(0, 10).map((t, idx) => 
            `${idx + 1}. **${t.info.title}** - ${t.info.author}`
          ).join('\n');
          const more = queue.length > 10 ? `\n\n*...e mais ${queue.length - 10} música(s)*` : '';
          await i.reply({ content: `📋 **Fila (${queue.length} músicas)**\n\n${queueList}${more}`, ephemeral: true });
          break;

        default:
          await i.reply({ content: '❌ Botão desconhecido!', ephemeral: true });
      }
    } catch (error) {
      console.error('Erro no botão:', error);
      await i.reply({ content: '❌ Erro ao executar ação!', ephemeral: true });
    }
  }

  // Handler de menu de seleção (search)
  if (i.isStringSelectMenu() && i.customId === 'search_select') {
    // O handler já está no próprio comando search.js
    return;
  }
});

// === FUNÇÃO DE ATUALIZAÇÃO DO LEADERBOARD ===
// === FUNÇÃO DE ATUALIZAÇÃO DO LEADERBOARD ===
async function updateLeaderboard(guildId, userId, type, value = 1) {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    // Prepara o update
    const update = { 
      $set: { lastPlayed: new Date() } 
    };
    
    if (type === 'song') {
      update.$inc = { songs: 1 };
    } else if (type === 'time') {
      update.$inc = { time: value };
    }
    
    // Upsert no MongoDB
    await Leaderboard.findOneAndUpdate(
      { guildId, userId, month: monthKey },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
  } catch (error) {
    console.error('Erro ao atualizar leaderboard:', error);
  }
}

client.login(process.env.TOKEN);
