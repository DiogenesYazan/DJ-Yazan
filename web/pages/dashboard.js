// ============================================
// 🎛️ DASHBOARD PAGE
// ============================================

const { theme, getBaseStyles, getHead, getNavbar, getFooter, getAnimationsCSS, getAnimationsJS, getParticlesHTML, getThemeToggleHTML, getThemeToggleCSS } = require('../styles/theme');

function getDashboardPage(user, stats, favorites = [], playlists = []) {
  const isLoggedIn = !!user;
  
  if (!isLoggedIn) {
    return getLoginPage();
  }
  
  const { guilds = [] } = user;
  const botGuilds = guilds.filter(g => g.hasBot);
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${getHead('Dashboard', 'Gerencie suas configurações, favoritos e playlists')}
  <style>
    ${getBaseStyles()}
    ${getAnimationsCSS()}
    ${getThemeToggleCSS()}
    
    /* Dashboard Layout */
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
      padding: 100px 2rem 4rem;
    }
    
    .dashboard-header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 3rem;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .user-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 4px solid var(--primary);
      box-shadow: 0 0 30px rgba(88, 101, 242, 0.4);
    }
    
    .user-info h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .user-info p {
      color: var(--text-muted);
    }
    
    .logout-btn {
      margin-left: auto;
      padding: 0.8rem 1.5rem;
      background: var(--danger);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    
    .logout-btn:hover {
      background: #c93b3b;
      transform: translateY(-2px);
    }
    
    /* Dashboard Grid */
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
    }
    
    .dashboard-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .dashboard-card h2 {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      font-size: 1.25rem;
    }
    
    .dashboard-card h2 i {
      color: var(--primary);
    }
    
    /* Servers List */
    .servers-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .server-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--surface-light);
      border-radius: 12px;
      transition: all 0.3s ease;
    }
    
    .server-item:hover {
      background: rgba(88, 101, 242, 0.2);
      transform: translateX(5px);
    }
    
    .server-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      object-fit: cover;
    }
    
    .server-icon.placeholder {
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
    }
    
    .server-name {
      font-weight: 600;
    }
    
    .server-badge {
      margin-left: auto;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .server-badge.admin {
      background: rgba(87, 242, 135, 0.2);
      color: var(--success);
    }
    
    .server-badge.member {
      background: rgba(254, 231, 92, 0.2);
      color: var(--warning);
    }
    
    /* Favorites List */
    .favorites-list, .playlists-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-height: 250px;
      overflow-y: auto;
    }
    
    .favorite-item, .playlist-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: var(--surface-light);
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .favorite-item:hover, .playlist-item:hover {
      background: rgba(88, 101, 242, 0.2);
    }
    
    .favorite-thumb {
      width: 45px;
      height: 45px;
      border-radius: 6px;
      object-fit: cover;
    }
    
    .favorite-info {
      flex: 1;
      min-width: 0;
    }
    
    .favorite-title {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .favorite-author {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    
    .playlist-count {
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    
    /* Stats Cards */
    .stats-mini {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }
    
    .stat-mini {
      text-align: center;
      padding: 1rem;
      background: var(--surface-light);
      border-radius: 12px;
    }
    
    .stat-mini-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary);
    }
    
    .stat-mini-label {
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    
    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
    }
    
    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    
    /* Player Widget */
    .player-widget {
      background: linear-gradient(135deg, rgba(88, 101, 242, 0.2), rgba(235, 69, 158, 0.2));
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .player-now-playing {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .player-thumb {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: cover;
    }
    
    .player-info h3 {
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
    }
    
    .player-info p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    
    .player-progress {
      margin-top: 1rem;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    
    .player-progress-bar {
      height: 100%;
      background: var(--primary);
      width: 0%;
      transition: width 1s linear;
    }
    
    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        text-align: center;
      }
      
      .logout-btn {
        margin: 1rem auto 0;
      }
      
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="bg-animation"></div>
  ${getParticlesHTML()}
  
  ${getNavbar('dashboard')}
  ${getThemeToggleHTML()}
  
  <main class="dashboard">
    <header class="dashboard-header reveal">
      <img src="${user.getAvatarUrl(128)}" alt="${user.username}" class="user-avatar glow">
      <div class="user-info">
        <h1>${user.globalName || user.username}</h1>
        <p>@${user.username} • ${botGuilds.length} servidor(es) com DJ Yazan</p>
      </div>
      <a href="/auth/logout" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i> Sair
      </a>
    </header>
    
    <div class="dashboard-grid">
      <!-- Servidores -->
      <div class="dashboard-card reveal">
        <h2><i class="fas fa-server"></i> Seus Servidores</h2>
        ${botGuilds.length > 0 ? `
          <div class="servers-list">
            ${botGuilds.map(guild => `
              <a href="/leaderboard?guild=${guild.id}" class="server-item">
                ${guild.icon 
                  ? `<img src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=96" class="server-icon" alt="${guild.name}">`
                  : `<div class="server-icon placeholder">${guild.name.charAt(0)}</div>`
                }
                <span class="server-name">${guild.name}</span>
                <span class="server-badge ${guild.isAdmin ? 'admin' : 'member'}">
                  ${guild.isAdmin ? 'Admin' : 'Membro'}
                </span>
              </a>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <i class="fas fa-server"></i>
            <p>Nenhum servidor com DJ Yazan</p>
          </div>
        `}
      </div>
      
      <!-- Estatísticas -->
      <div class="dashboard-card reveal">
        <h2><i class="fas fa-chart-bar"></i> Suas Estatísticas</h2>
        <div class="stats-mini">
          <div class="stat-mini">
            <div class="stat-mini-value" data-counter="${stats.songs || 0}">${stats.songs || 0}</div>
            <div class="stat-mini-label">Músicas</div>
          </div>
          <div class="stat-mini">
            <div class="stat-mini-value">${formatTime(stats.time || 0)}</div>
            <div class="stat-mini-label">Tempo Ouvido</div>
          </div>
          <div class="stat-mini">
            <div class="stat-mini-value" data-counter="${stats.quizPoints || 0}">${stats.quizPoints || 0}</div>
            <div class="stat-mini-label">Quiz Points</div>
          </div>
          <div class="stat-mini">
            <div class="stat-mini-value" data-counter="${favorites.length || 0}">${favorites.length || 0}</div>
            <div class="stat-mini-label">Favoritos</div>
          </div>
        </div>
      </div>
      
      <!-- Favoritos -->
      <div class="dashboard-card reveal">
        <h2><i class="fas fa-heart"></i> Músicas Favoritas</h2>
        ${favorites.length > 0 ? `
          <div class="favorites-list">
            ${favorites.slice(0, 5).map(fav => `
              <div class="favorite-item">
                <img src="${fav.thumbnail || 'https://via.placeholder.com/45'}" class="favorite-thumb" alt="">
                <div class="favorite-info">
                  <div class="favorite-title">${fav.title}</div>
                  <div class="favorite-author">${fav.author}</div>
                </div>
              </div>
            `).join('')}
          </div>
          ${favorites.length > 5 ? `<p style="text-align: center; margin-top: 1rem; color: var(--text-muted);">...e mais ${favorites.length - 5} favoritos</p>` : ''}
        ` : `
          <div class="empty-state">
            <i class="fas fa-heart"></i>
            <p>Nenhum favorito ainda</p>
            <p style="font-size: 0.85rem;">Use <code>/favorites add</code> no Discord</p>
          </div>
        `}
      </div>
      
      <!-- Playlists -->
      <div class="dashboard-card reveal">
        <h2><i class="fas fa-folder-open"></i> Suas Playlists</h2>
        ${playlists.length > 0 ? `
          <div class="playlists-list">
            ${playlists.map(pl => `
              <div class="playlist-item">
                <i class="fas fa-music" style="color: var(--primary);"></i>
                <div class="favorite-info">
                  <div class="favorite-title">${pl.name}</div>
                  <div class="playlist-count">${pl.tracks?.length || 0} músicas</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <i class="fas fa-folder-open"></i>
            <p>Nenhuma playlist ainda</p>
            <p style="font-size: 0.85rem;">Use <code>/myplaylists create</code> no Discord</p>
          </div>
        `}
      </div>
    </div>
  </main>
  
  ${getFooter()}
  
  <script>
    ${getAnimationsJS()}
    
    // Formatar tempo
    function formatTime(ms) {
      const hours = Math.floor(ms / 3600000);
      const minutes = Math.floor((ms % 3600000) / 60000);
      if (hours > 0) return hours + 'h ' + minutes + 'm';
      return minutes + 'm';
    }
  </script>
</body>
</html>
  `;
}

// Página de login
function getLoginPage() {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${getHead('Login', 'Faça login para acessar o dashboard')}
  <style>
    ${getBaseStyles()}
    ${getAnimationsCSS()}
    ${getThemeToggleCSS()}
    
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .login-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 24px;
      padding: 3rem;
      text-align: center;
      max-width: 400px;
      width: 100%;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .login-card img {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      margin-bottom: 1.5rem;
      border: 4px solid var(--primary);
    }
    
    .login-card h1 {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
    }
    
    .login-card p {
      color: var(--text-muted);
      margin-bottom: 2rem;
    }
    
    .discord-login-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .discord-login-btn:hover {
      background: var(--primary-dark);
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(88, 101, 242, 0.4);
    }
    
    .discord-login-btn i {
      font-size: 1.25rem;
    }
  </style>
</head>
<body>
  <div class="bg-animation"></div>
  ${getParticlesHTML()}
  
  ${getNavbar()}
  ${getThemeToggleHTML()}
  
  <main class="login-container">
    <div class="login-card reveal">
      <img src="${theme.botIcon}" alt="${theme.botName}" class="glow">
      <h1>Dashboard</h1>
      <p>Faça login com Discord para acessar suas estatísticas, favoritos e configurações.</p>
      <a href="/auth/discord" class="discord-login-btn ripple-btn">
        <i class="fab fa-discord"></i>
        Entrar com Discord
      </a>
    </div>
  </main>
  
  ${getFooter()}
  
  <script>
    ${getAnimationsJS()}
  </script>
</body>
</html>
  `;
}

// Função auxiliar para formatar tempo
function formatTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

module.exports = { getDashboardPage, getLoginPage };
