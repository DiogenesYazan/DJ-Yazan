// ============================================
// 🏠 LANDING PAGE
// ============================================

const { theme, getBaseStyles, getHead, getNavbar, getFooter, getAnimationsCSS, getAnimationsJS, getParticlesHTML, getThemeToggleHTML, getThemeToggleCSS } = require('../styles/theme');

function getLandingPage(stats) {
  const { uptime, servers, users, activePlayers, isOnline } = stats;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${getHead('Início', 'O melhor bot de música para Discord. Ouça suas músicas favoritas com qualidade premium!')}
  <style>
    ${getBaseStyles()}
    ${getAnimationsCSS()}
    ${getThemeToggleCSS()}
    
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
    
    .btn-large {
      padding: 1.2rem 2.5rem;
      font-size: 1.1rem;
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
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .stat-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(88, 101, 242, 0.2);
      border-color: var(--primary);
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
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      padding: 2rem;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    }
    
    .feature-card:hover {
      border-color: var(--primary);
      transform: translateY(-10px) scale(1.02);
      box-shadow: 0 20px 60px rgba(88, 101, 242, 0.3);
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
    
    @media (max-width: 768px) {
      h1 { font-size: 2.5rem; }
      .hero p { font-size: 1rem; }
      .stat-value { font-size: 2rem; }
    }
  </style>
</head>
<body>
  <div class="bg-animation"></div>
  ${getParticlesHTML()}
  
  ${getNavbar('home')}
  ${getThemeToggleHTML()}
  
  <section class="hero">
    <div class="hero-content reveal">
      <img src="${theme.botIcon}" alt="${theme.botName}" class="hero-avatar glow">
      
      <div class="status-badge">
        <div class="status-dot"></div>
        <span>${isOnline ? 'Online' : 'Offline'} • Uptime: ${uptime}</span>
      </div>
      
      <h1>${theme.botName}</h1>
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
      <div class="stat-card tilt-card reveal">
        <div class="stat-icon purple">
          <i class="fas fa-server"></i>
        </div>
        <div class="stat-value animated-counter" data-counter="${servers}">${servers.toLocaleString()}</div>
        <div class="stat-label">Servidores</div>
      </div>
      
      <div class="stat-card tilt-card reveal">
        <div class="stat-icon pink">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-value animated-counter" data-counter="${users}">${users.toLocaleString()}</div>
        <div class="stat-label">Usuários</div>
      </div>
      
      <div class="stat-card tilt-card reveal">
        <div class="stat-icon green">
          <i class="fas fa-music"></i>
        </div>
        <div class="stat-value animated-counter" data-counter="${activePlayers}">${activePlayers}</div>
        <div class="stat-label">Tocando Agora</div>
      </div>
      
      <div class="stat-card tilt-card reveal">
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
      <div class="feature-card tilt-card reveal">
        <i class="fas fa-headphones"></i>
        <h3>Qualidade Premium</h3>
        <p>Áudio de alta qualidade usando Lavalink v4, sem travamentos ou quedas.</p>
      </div>
      
      <div class="feature-card tilt-card reveal">
        <i class="fas fa-search"></i>
        <h3>Busca Inteligente</h3>
        <p>Pesquise por nome ou cole links do YouTube, Spotify e mais.</p>
      </div>
      
      <div class="feature-card tilt-card reveal">
        <i class="fas fa-list"></i>
        <h3>Sistema de Filas</h3>
        <p>Gerencie sua playlist com comandos de fila, shuffle e loop.</p>
      </div>
      
      <div class="feature-card tilt-card reveal">
        <i class="fas fa-gamepad"></i>
        <h3>Quiz Musical</h3>
        <p>Jogue com amigos e descubra quem conhece mais músicas!</p>
      </div>
      
      <div class="feature-card tilt-card reveal">
        <i class="fas fa-trophy"></i>
        <h3>Leaderboard</h3>
        <p>Ranking mensal dos usuários que mais ouvem música.</p>
      </div>
      
      <div class="feature-card tilt-card reveal">
        <i class="fas fa-infinity"></i>
        <h3>Modo 24/7</h3>
        <p>Mantenha o bot no canal de voz 24 horas por dia.</p>
      </div>

      <div class="feature-card tilt-card reveal">
        <i class="fas fa-heart"></i>
        <h3>Favoritos</h3>
        <p>Salve suas músicas favoritas e toque com um comando.</p>
      </div>
      
      <div class="feature-card tilt-card reveal">
        <i class="fas fa-folder-open"></i>
        <h3>Playlists Pessoais</h3>
        <p>Crie e gerencie suas próprias playlists personalizadas.</p>
      </div>

      <div class="feature-card tilt-card reveal">
        <i class="fas fa-microphone-alt"></i>
        <h3>Letras de Música</h3>
        <p>Veja a letra da música que está tocando em tempo real.</p>
      </div>
    </div>
  </section>
  
  <section class="commands" id="commands">
    <div class="section-title">
      <h2>🎮 Comandos Principais</h2>
      <p>Simples, rápidos e intuitivos</p>
    </div>
    
    <div class="commands-list">
      <div class="command-item reveal-left">
        <span class="command-name">/play</span>
        <span class="command-desc">Toca uma música ou adiciona à fila</span>
      </div>
      <div class="command-item reveal-right">
        <span class="command-name">/queue</span>
        <span class="command-desc">Mostra a fila de músicas</span>
      </div>
      <div class="command-item reveal-left">
        <span class="command-name">/skip</span>
        <span class="command-desc">Pula para a próxima música</span>
      </div>
      <div class="command-item reveal-right">
        <span class="command-name">/loop</span>
        <span class="command-desc">Ativa loop na música ou fila</span>
      </div>
      <div class="command-item reveal-left">
        <span class="command-name">/favorites</span>
        <span class="command-desc">Gerencie suas músicas favoritas</span>
      </div>
      <div class="command-item reveal-right">
        <span class="command-name">/lyrics</span>
        <span class="command-desc">Mostra a letra da música atual</span>
      </div>
      <div class="command-item reveal-left">
        <span class="command-name">/quiz</span>
        <span class="command-desc">Inicia um quiz musical</span>
      </div>
      <div class="command-item reveal-right">
        <span class="command-name">/leaderboard</span>
        <span class="command-desc">Mostra o ranking do servidor</span>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 2rem;">
      <a href="/commands" class="btn btn-outline ripple-btn">
        <i class="fas fa-list"></i>
        Ver Todos os Comandos
      </a>
    </div>
  </section>
  
  ${getFooter()}
  
  <script>
    ${getAnimationsJS()}
  </script>
</body>
</html>
  `;
}

module.exports = { getLandingPage };
