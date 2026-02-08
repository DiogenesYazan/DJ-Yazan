// ============================================
// 🏆 LEADERBOARD PAGE
// ============================================

const { theme, getBaseStyles, getHead, getNavbar, getFooter, getAnimationsCSS, getAnimationsJS, getParticlesHTML, getThemeToggleHTML, getThemeToggleCSS } = require('../styles/theme');

function getLeaderboardPage(data) {
  const { guild, leaderboard = [], type = 'songs', user } = data;
  
  const typeLabels = {
    songs: '🎵 Músicas Tocadas',
    time: '⏱️ Tempo Ouvido',
    quizPoints: '🧠 Quiz Points',
    overall: '📊 Ranking Geral'
  };
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${getHead('Leaderboard', 'Veja quem mais ouve música no servidor')}
  <style>
    ${getBaseStyles()}
    ${getAnimationsCSS()}
    ${getThemeToggleCSS()}
    
    .leaderboard-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 100px 2rem 4rem;
    }
    
    .leaderboard-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .leaderboard-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .leaderboard-header p {
      color: var(--text-muted);
    }
    
    /* Guild Selector */
    .guild-selector {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .guild-select {
      padding: 0.75rem 1.5rem;
      background: var(--surface);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--text);
      font-size: 1rem;
      cursor: pointer;
      min-width: 200px;
    }
    
    .guild-select:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    /* Type Tabs */
    .type-tabs {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .type-tab {
      padding: 0.75rem 1.25rem;
      background: var(--surface);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .type-tab:hover {
      background: var(--surface-light);
      color: var(--text);
    }
    
    .type-tab.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }
    
    /* Leaderboard Table */
    .leaderboard-table {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .leaderboard-row {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
    }
    
    .leaderboard-row:last-child {
      border-bottom: none;
    }
    
    .leaderboard-row:hover {
      background: rgba(88, 101, 242, 0.1);
    }
    
    .leaderboard-row.top-1 {
      background: linear-gradient(90deg, rgba(255, 215, 0, 0.2), transparent);
    }
    
    .leaderboard-row.top-2 {
      background: linear-gradient(90deg, rgba(192, 192, 192, 0.15), transparent);
    }
    
    .leaderboard-row.top-3 {
      background: linear-gradient(90deg, rgba(205, 127, 50, 0.15), transparent);
    }
    
    .rank {
      width: 50px;
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
    }
    
    .rank-1 { color: #FFD700; }
    .rank-2 { color: #C0C0C0; }
    .rank-3 { color: #CD7F32; }
    
    .rank-medal {
      font-size: 1.75rem;
    }
    
    .user-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 1rem;
    }
    
    .user-info {
      flex: 1;
    }
    
    .user-name {
      font-weight: 600;
      font-size: 1.1rem;
    }
    
    .user-tag {
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    
    .user-stats {
      text-align: right;
    }
    
    .user-stats-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
    }
    
    .user-stats-label {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
    }
    
    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    
    .empty-state h3 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: var(--text);
    }
    
    /* No Guild Selected */
    .select-guild {
      text-align: center;
      padding: 4rem 2rem;
    }
    
    .select-guild i {
      font-size: 4rem;
      color: var(--primary);
      margin-bottom: 1rem;
    }
    
    @media (max-width: 768px) {
      .leaderboard-row {
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      
      .user-stats {
        width: 100%;
        text-align: left;
        margin-top: 0.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="bg-animation"></div>
  ${getParticlesHTML()}
  
  ${getNavbar('leaderboard')}
  ${getThemeToggleHTML()}
  
  <main class="leaderboard-container">
    <header class="leaderboard-header reveal">
      <h1>🏆 Leaderboard</h1>
      <p>${guild ? `Ranking de ${guild.name}` : 'Selecione um servidor para ver o ranking'}</p>
    </header>
    
    ${guild ? `
      <div class="type-tabs reveal">
        <a href="/leaderboard?guild=${guild.id}&type=songs" class="type-tab ${type === 'songs' ? 'active' : ''}">🎵 Músicas</a>
        <a href="/leaderboard?guild=${guild.id}&type=time" class="type-tab ${type === 'time' ? 'active' : ''}">⏱️ Tempo</a>
        <a href="/leaderboard?guild=${guild.id}&type=quizPoints" class="type-tab ${type === 'quizPoints' ? 'active' : ''}">🧠 Quiz</a>
      </div>
      
      <div class="leaderboard-table reveal">
        ${leaderboard.length > 0 ? leaderboard.map((entry, index) => `
          <div class="leaderboard-row ${index < 3 ? `top-${index + 1}` : ''} ${entry.isCurrentUser ? 'current-user' : ''}">
            <div class="rank ${index < 3 ? `rank-${index + 1}` : ''}">
              ${index === 0 ? '<span class="rank-medal">🥇</span>' : 
                index === 1 ? '<span class="rank-medal">🥈</span>' : 
                index === 2 ? '<span class="rank-medal">🥉</span>' : 
                `#${index + 1}`}
            </div>
            <img src="${entry.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="" class="user-avatar">
            <div class="user-info">
              <div class="user-name">${entry.displayName || entry.username}</div>
              <div class="user-tag">@${entry.username}</div>
            </div>
            <div class="user-stats">
              <div class="user-stats-value">${formatValue(entry.value, type)}</div>
              <div class="user-stats-label">${typeLabels[type]}</div>
            </div>
          </div>
        `).join('') : `
          <div class="empty-state">
            <i class="fas fa-trophy"></i>
            <h3>Nenhum dado ainda</h3>
            <p>Comece a tocar músicas para aparecer no ranking!</p>
          </div>
        `}
      </div>
    ` : `
      <div class="select-guild reveal">
        <i class="fas fa-arrow-up"></i>
        <h3>Selecione um Servidor</h3>
        <p>Faça login para ver o ranking dos seus servidores</p>
        ${!user ? `
          <a href="/auth/discord" class="btn btn-discord" style="margin-top: 1.5rem;">
            <i class="fab fa-discord"></i>
            Fazer Login
          </a>
        ` : ''}
      </div>
    `}
  </main>
  
  ${getFooter()}
  
  <script>
    ${getAnimationsJS()}
  </script>
</body>
</html>
  `;
}

// Formatar valores baseado no tipo
function formatValue(value, type) {
  if (type === 'time') {
    const hours = Math.floor(value / 3600000);
    const minutes = Math.floor((value % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
  return value.toLocaleString('pt-BR');
}

module.exports = { getLeaderboardPage };
