// ============================================
// 📋 COMMANDS PAGE
// ============================================

const { theme, getBaseStyles, getHead, getNavbar, getFooter, getAnimationsCSS, getAnimationsJS, getParticlesHTML, getThemeToggleHTML, getThemeToggleCSS } = require('../styles/theme');

// Definição de todos os comandos
const commands = [
  // Música
  { name: 'play', category: 'Música', description: 'Toca uma música ou adiciona à fila', usage: '/play <música ou link>', emoji: '▶️' },
  { name: 'pause', category: 'Música', description: 'Pausa a música atual', usage: '/pause', emoji: '⏸️' },
  { name: 'stop', category: 'Música', description: 'Para a música e limpa a fila', usage: '/stop', emoji: '⏹️' },
  { name: 'skip', category: 'Música', description: 'Pula para a próxima música', usage: '/skip', emoji: '⏭️' },
  { name: 'seek', category: 'Música', description: 'Avança para um tempo específico', usage: '/seek <tempo>', emoji: '⏩' },
  { name: 'volume', category: 'Música', description: 'Ajusta o volume do player', usage: '/volume <0-200>', emoji: '🔊' },
  { name: 'nowplayed', category: 'Música', description: 'Mostra a música tocando agora', usage: '/nowplayed', emoji: '🎵' },
  { name: 'search', category: 'Música', description: 'Busca músicas e escolhe uma', usage: '/search <busca>', emoji: '🔍' },
  { name: 'playlist', category: 'Música', description: 'Toca as top músicas de um artista', usage: '/playlist <artista>', emoji: '📜' },
  
  // Fila
  { name: 'queue', category: 'Fila', description: 'Mostra a fila de músicas', usage: '/queue', emoji: '📋' },
  { name: 'shuffle', category: 'Fila', description: 'Embaralha a fila', usage: '/shuffle', emoji: '🔀' },
  { name: 'loop', category: 'Fila', description: 'Ativa loop na música ou fila', usage: '/loop <off|track|queue>', emoji: '🔁' },
  { name: 'remove', category: 'Fila', description: 'Remove uma música da fila', usage: '/remove <posição>', emoji: '🗑️' },
  { name: 'clear', category: 'Fila', description: 'Limpa toda a fila', usage: '/clear', emoji: '🧹' },
  { name: 'move', category: 'Fila', description: 'Move uma música na fila', usage: '/move <de> <para>', emoji: '↕️' },
  { name: 'jump', category: 'Fila', description: 'Pula para uma música específica', usage: '/jump <posição>', emoji: '⏯️' },
  
  // Favoritos & Playlists
  { name: 'favorites', category: 'Favoritos', description: 'Gerencia suas músicas favoritas', usage: '/favorites <add|remove|list|play>', emoji: '❤️' },
  { name: 'myplaylists', category: 'Playlists', description: 'Gerencia suas playlists pessoais', usage: '/myplaylists <create|add|list|play|delete>', emoji: '📁' },
  { name: 'lyrics', category: 'Extras', description: 'Mostra a letra da música atual', usage: '/lyrics [busca]', emoji: '🎤' },
  { name: 'autoplay', category: 'Extras', description: 'Ativa reprodução automática', usage: '/autoplay', emoji: '🔄' },
  
  // Games
  { name: 'quiz', category: 'Games', description: 'Inicia um quiz musical', usage: '/quiz [rodadas] [playlist]', emoji: '🎮' },
  { name: 'trivia', category: 'Games', description: 'Quiz de conhecimentos gerais', usage: '/trivia [categoria]', emoji: '🧠' },
  { name: '8ball', category: 'Games', description: 'Faça uma pergunta à bola mágica', usage: '/8ball <pergunta>', emoji: '🎱' },
  { name: 'coinflip', category: 'Games', description: 'Cara ou coroa!', usage: '/coinflip [escolha]', emoji: '🪙' },
  { name: 'rps', category: 'Games', description: 'Pedra, papel e tesoura', usage: '/rps [oponente]', emoji: '✂️' },
  { name: 'slots', category: 'Games', description: 'Jogue na máquina caça-níqueis', usage: '/slots', emoji: '🎰' },
  { name: 'blackjack', category: 'Games', description: 'Jogue 21 contra o dealer', usage: '/blackjack', emoji: '🃏' },
  { name: 'wordle', category: 'Games', description: 'Adivinhe a palavra de 5 letras', usage: '/wordle', emoji: '🔤' },
  { name: 'hangman', category: 'Games', description: 'Jogo da forca', usage: '/hangman [dificuldade]', emoji: '🎯' },
  { name: 'tictactoe', category: 'Games', description: 'Jogo da velha', usage: '/tictactoe [oponente]', emoji: '⭕' },
  { name: 'connect4', category: 'Games', description: 'Conecte 4 peças', usage: '/connect4 <oponente>', emoji: '🔴' },
  { name: 'reaction', category: 'Games', description: 'Teste de velocidade de reação', usage: '/reaction', emoji: '⚡' },
  
  // Estatísticas
  { name: 'leaderboard', category: 'Stats', description: 'Mostra o ranking do servidor', usage: '/leaderboard [tipo]', emoji: '🏆' },
  { name: 'mystats', category: 'Stats', description: 'Mostra suas estatísticas pessoais', usage: '/mystats', emoji: '📈' },
  { name: 'stats', category: 'Stats', description: 'Mostra estatísticas do bot', usage: '/stats', emoji: '📊' },
  
  // Utilidades
  { name: 'controller', category: 'Utilidades', description: 'Mostra painel de controle', usage: '/controller', emoji: '🎛️' },
  { name: '247', category: 'Utilidades', description: 'Ativa modo 24/7 no canal', usage: '/247', emoji: '⏱️' },
  { name: 'help', category: 'Utilidades', description: 'Mostra lista de comandos', usage: '/help', emoji: '❓' },
  { name: 'about', category: 'Utilidades', description: 'Informações sobre o bot', usage: '/about', emoji: '🤖' },
  { name: 'ping', category: 'Utilidades', description: 'Verifica latência do bot', usage: '/ping', emoji: '🏓' }
];

// Agrupar por categoria
const categories = [...new Set(commands.map(c => c.category))];

function getCommandsPage() {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${getHead('Comandos', 'Lista completa de comandos do DJ Yazan')}
  <style>
    ${getBaseStyles()}
    ${getAnimationsCSS()}
    ${getThemeToggleCSS()}
    
    .commands-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 100px 2rem 4rem;
    }
    
    .commands-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .commands-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    .commands-header p {
      color: var(--text-muted);
      font-size: 1.1rem;
    }
    
    /* Search Box */
    .search-box {
      max-width: 500px;
      margin: 0 auto 2rem;
      position: relative;
    }
    
    .search-box input {
      width: 100%;
      padding: 1rem 1rem 1rem 3rem;
      background: var(--surface);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      color: var(--text);
      font-size: 1rem;
      transition: all 0.3s ease;
    }
    
    .search-box input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 20px rgba(88, 101, 242, 0.2);
    }
    
    .search-box i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    
    /* Category Filter */
    .category-filter {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .filter-btn {
      padding: 0.6rem 1.2rem;
      background: var(--surface);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--text-muted);
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .filter-btn:hover {
      background: var(--surface-light);
      color: var(--text);
    }
    
    .filter-btn.active {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }
    
    /* Commands Grid */
    .commands-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }
    
    .command-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    
    .command-card:hover {
      transform: translateY(-5px) scale(1.02);
      border-color: var(--primary);
      box-shadow: 0 20px 40px rgba(88, 101, 242, 0.2);
    }
    
    .command-card.hidden {
      display: none;
    }
    
    .command-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    
    .command-emoji {
      font-size: 1.5rem;
    }
    
    .command-name {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      background: var(--primary);
      padding: 0.3rem 0.75rem;
      border-radius: 6px;
      font-weight: 600;
      font-size: 1rem;
    }
    
    .command-category {
      margin-left: auto;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      background: var(--surface-light);
      border-radius: 4px;
      color: var(--text-muted);
    }
    
    .command-desc {
      color: var(--text-muted);
      margin-bottom: 1rem;
      line-height: 1.5;
    }
    
    .command-usage {
      background: var(--surface);
      padding: 0.75rem;
      border-radius: 8px;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 0.9rem;
      color: var(--success);
    }
    
    .command-usage::before {
      content: '$ ';
      color: var(--text-muted);
    }
    
    /* Stats */
    .commands-stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .stat-item {
      text-align: center;
    }
    
    .stat-item span {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
    }
    
    .stat-item p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      .commands-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
  <div class="bg-animation"></div>
  ${getParticlesHTML()}
  
  ${getNavbar('commands')}
  ${getThemeToggleHTML()}
  
  <main class="commands-container">
    <header class="commands-header reveal">
      <h1>📋 Comandos</h1>
      <p>Todos os comandos disponíveis no DJ Yazan</p>
    </header>
    
    <div class="commands-stats reveal">
      <div class="stat-item">
        <span>${commands.length}</span>
        <p>Comandos</p>
      </div>
      <div class="stat-item">
        <span>${categories.length}</span>
        <p>Categorias</p>
      </div>
    </div>
    
    <div class="search-box reveal">
      <i class="fas fa-search"></i>
      <input type="text" id="searchInput" placeholder="Buscar comando..." autocomplete="off">
    </div>
    
    <div class="category-filter reveal">
      <button class="filter-btn active" data-category="all">Todos</button>
      ${categories.map(cat => `
        <button class="filter-btn" data-category="${cat}">${cat}</button>
      `).join('')}
    </div>
    
    <div class="commands-grid">
      ${commands.map((cmd, i) => `
        <div class="command-card tilt-card reveal" data-category="${cmd.category}" data-name="${cmd.name}" style="animation-delay: ${i * 0.05}s">
          <div class="command-header">
            <span class="command-emoji">${cmd.emoji}</span>
            <span class="command-name">/${cmd.name}</span>
            <span class="command-category">${cmd.category}</span>
          </div>
          <p class="command-desc">${cmd.description}</p>
          <div class="command-usage">${cmd.usage}</div>
        </div>
      `).join('')}
    </div>
  </main>
  
  ${getFooter()}
  
  <script>
    ${getAnimationsJS()}
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const cards = document.querySelectorAll('.command-card');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    let currentCategory = 'all';
    
    function filterCommands() {
      const searchTerm = searchInput.value.toLowerCase();
      
      cards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        const category = card.dataset.category;
        const desc = card.querySelector('.command-desc').textContent.toLowerCase();
        
        const matchesSearch = name.includes(searchTerm) || desc.includes(searchTerm);
        const matchesCategory = currentCategory === 'all' || category === currentCategory;
        
        if (matchesSearch && matchesCategory) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    }
    
    searchInput.addEventListener('input', filterCommands);
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        filterCommands();
      });
    });
  </script>
</body>
</html>
  `;
}

module.exports = { getCommandsPage, commands };
