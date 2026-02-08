// ============================================
// 🎨 TEMA E ESTILOS COMPARTILHADOS
// ============================================

const { getAnimationsCSS, getAnimationsJS, getParticlesHTML, getThemeToggleHTML, getThemeToggleCSS } = require('./animations');

const theme = {
  colors: {
    primary: '#5865F2',
    primaryDark: '#4752C4',
    secondary: '#EB459E',
    background: '#0f0f23',
    surface: '#1a1a2e',
    surfaceLight: '#252542',
    text: '#ffffff',
    textMuted: '#b9bbbe',
    success: '#57F287',
    warning: '#FEE75C',
    danger: '#ED4245'
  },
  
  botIcon: 'https://i.imgur.com/4t8XUT5.jpeg',
  botName: 'DJ Yazan',
  authorName: 'Diógenes Yuri',
  authorUrl: 'https://diogenesyuri.works/',
  githubUrl: 'https://github.com/DiogenesYazan'
};

// CSS base compartilhado entre todas as páginas
function getBaseStyles() {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    :root {
      --primary: ${theme.colors.primary};
      --primary-dark: ${theme.colors.primaryDark};
      --secondary: ${theme.colors.secondary};
      --background: ${theme.colors.background};
      --surface: ${theme.colors.surface};
      --surface-light: ${theme.colors.surfaceLight};
      --text: ${theme.colors.text};
      --text-muted: ${theme.colors.textMuted};
      --success: ${theme.colors.success};
      --warning: ${theme.colors.warning};
      --danger: ${theme.colors.danger};
    }

    /* Light theme variables */
    [data-theme="light"] {
      --background: #f5f5f7;
      --surface: #ffffff;
      --surface-light: #e8e8ed;
      --text: #1d1d1f;
      --text-muted: #6e6e73;
      --primary: #5865F2;
      --primary-dark: #4752C4;
    }
    
    /* Light theme specific styles */
    [data-theme="light"] .bg-animation {
      background: linear-gradient(135deg, #f5f5f7 0%, #e8e8ed 50%, #dcdce2 100%);
    }
    
    [data-theme="light"] .bg-animation::before {
      background: 
        radial-gradient(circle at 20% 80%, rgba(88, 101, 242, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(235, 69, 158, 0.08) 0%, transparent 50%);
    }
    
    [data-theme="light"] nav {
      background: rgba(255, 255, 255, 0.9);
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    [data-theme="light"] .glass-card,
    [data-theme="light"] .feature-card,
    [data-theme="light"] .stat-card,
    [data-theme="light"] .command-item {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    }
    
    [data-theme="light"] .particles-container .particle {
      opacity: 0.3;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      background: var(--background);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
      line-height: 1.6;
      transition: background-color 0.3s ease, color 0.3s ease;
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
    
    /* Buttons */
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
      .nav-links { display: none; }
      h1 { font-size: 2rem; }
    }
  `;
}

// HTML Head compartilhado
function getHead(title, description = 'O melhor bot de música para Discord. Ouça suas músicas favoritas com qualidade premium!') {
  return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - DJ Yazan</title>
    <meta name="description" content="${description}">
    <meta name="theme-color" content="${theme.colors.primary}">
    <link rel="icon" href="${theme.botIcon}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  `;
}

// Navbar compartilhada
function getNavbar(activePage = '') {
  return `
    <nav>
      <a href="/" class="logo">
        <img src="${theme.botIcon}" alt="${theme.botName}">
        <span>${theme.botName}</span>
      </a>
      <div class="nav-links">
        <a href="/#features" ${activePage === 'home' ? 'class="active"' : ''}>Recursos</a>
        <a href="/commands" ${activePage === 'commands' ? 'class="active"' : ''}>Comandos</a>
        <a href="/leaderboard" ${activePage === 'leaderboard' ? 'class="active"' : ''}>Ranking</a>
        <a href="/dashboard" ${activePage === 'dashboard' ? 'class="active"' : ''}>Dashboard</a>
        <a href="/invite" class="btn-primary">Adicionar Bot</a>
      </div>
    </nav>
  `;
}

// Footer compartilhado
function getFooter() {
  const year = new Date().getFullYear();
  return `
    <footer>
      <p>Desenvolvido com 💜 por <a href="${theme.authorUrl}" target="_blank">${theme.authorName}</a></p>
      <p>© ${year} ${theme.botName}. Todos os direitos reservados.</p>
      <p style="margin-top: 0.5rem; font-size: 0.85rem;">
        <a href="/terms">Termos de Serviço</a> • <a href="/privacy">Política de Privacidade</a>
      </p>
      
      <div class="social-links">
        <a href="${theme.authorUrl}" target="_blank" title="Portfolio">
          <i class="fas fa-globe"></i>
        </a>
        <a href="${theme.githubUrl}" target="_blank" title="GitHub">
          <i class="fab fa-github"></i>
        </a>
        <a href="/invite" title="Discord">
          <i class="fab fa-discord"></i>
        </a>
      </div>
    </footer>
  `;
}

module.exports = {
  theme,
  getBaseStyles,
  getHead,
  getNavbar,
  getFooter,
  getAnimationsCSS,
  getAnimationsJS,
  getParticlesHTML,
  getThemeToggleHTML,
  getThemeToggleCSS
};
