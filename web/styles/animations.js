/**
 * 🎨 Animações Avançadas para DJ Yazan
 * Partículas, Glassmorphism, 3D Effects, Contadores
 */

// CSS das animações
function getAnimationsCSS() {
  return `
    /* ============================================
       🎵 PARTÍCULAS MUSICAIS FLUTUANTES
       ============================================ */
    .particles-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
    }

    .particle {
      position: absolute;
      font-size: 20px;
      opacity: 0;
      animation: floatUp 15s linear infinite;
      user-select: none;
    }

    @keyframes floatUp {
      0% {
        opacity: 0;
        transform: translateY(100vh) rotate(0deg) scale(0.5);
      }
      10% {
        opacity: 0.6;
      }
      90% {
        opacity: 0.6;
      }
      100% {
        opacity: 0;
        transform: translateY(-100vh) rotate(720deg) scale(1.2);
      }
    }

    /* ============================================
       💎 GLASSMORPHISM CARDS
       ============================================ */
    .glass-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .glass-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 
        0 20px 60px rgba(88, 101, 242, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
      border-color: rgba(88, 101, 242, 0.5);
    }

    /* ============================================
       🎯 3D TILT EFFECT
       ============================================ */
    .tilt-card {
      transform-style: preserve-3d;
      perspective: 1000px;
      transition: transform 0.1s ease;
    }

    .tilt-card .tilt-content {
      transform: translateZ(30px);
    }

    /* ============================================
       🔢 CONTADOR ANIMADO
       ============================================ */
    .animated-counter {
      display: inline-block;
      font-variant-numeric: tabular-nums;
      transition: all 0.3s ease;
    }

    .counter-highlight {
      animation: counterPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes counterPop {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); color: var(--primary); }
    }

    /* ============================================
       🌊 RIPPLE EFFECT BUTTONS
       ============================================ */
    .ripple-btn {
      position: relative;
      overflow: hidden;
    }

    .ripple-btn::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
      background-image: radial-gradient(circle, rgba(255,255,255,0.3) 10%, transparent 10.01%);
      background-repeat: no-repeat;
      background-position: 50%;
      transform: scale(10, 10);
      opacity: 0;
      transition: transform 0.5s, opacity 0.5s;
    }

    .ripple-btn:active::after {
      transform: scale(0, 0);
      opacity: 0.3;
      transition: 0s;
    }

    /* ============================================
       📜 SCROLL REVEAL ANIMATION
       ============================================ */
    .reveal {
      opacity: 0;
      transform: translateY(40px);
      transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .reveal.active {
      opacity: 1;
      transform: translateY(0);
    }

    .reveal-left {
      opacity: 0;
      transform: translateX(-60px);
      transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .reveal-left.active {
      opacity: 1;
      transform: translateX(0);
    }

    .reveal-right {
      opacity: 0;
      transform: translateX(60px);
      transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .reveal-right.active {
      opacity: 1;
      transform: translateX(0);
    }

    /* ============================================
       ✨ GRADIENT BORDER ANIMATION
       ============================================ */
    .gradient-border {
      position: relative;
      background: var(--surface);
      border-radius: 16px;
    }

    .gradient-border::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(45deg, 
        var(--primary), 
        var(--secondary), 
        #00d4ff,
        var(--primary)
      );
      background-size: 400% 400%;
      border-radius: 18px;
      z-index: -1;
      animation: gradientRotate 8s ease infinite;
    }

    @keyframes gradientRotate {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    /* ============================================
       💫 GLOW EFFECT
       ============================================ */
    .glow {
      animation: glow 2s ease-in-out infinite alternate;
    }

    @keyframes glow {
      from {
        box-shadow: 0 0 20px rgba(88, 101, 242, 0.3);
      }
      to {
        box-shadow: 0 0 40px rgba(88, 101, 242, 0.6), 0 0 60px rgba(235, 69, 158, 0.3);
      }
    }

    /* ============================================
       ⌨️ TYPING EFFECT
       ============================================ */
    .typing-text {
      overflow: hidden;
      border-right: 3px solid var(--primary);
      white-space: nowrap;
      animation: 
        typing 3.5s steps(40, end),
        blink-caret 0.75s step-end infinite;
    }

    @keyframes typing {
      from { width: 0; }
      to { width: 100%; }
    }

    @keyframes blink-caret {
      from, to { border-color: transparent; }
      50% { border-color: var(--primary); }
    }

    /* ============================================
       🎪 HOVER LIFT EFFECT
       ============================================ */
    .hover-lift {
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .hover-lift:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    /* ============================================
       🌈 SHIMMER LOADING EFFECT
       ============================================ */
    .shimmer {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0.1) 50%,
        rgba(255,255,255,0) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* ============================================
       🎭 ACCESSIBILITY - REDUCED MOTION
       ============================================ */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .particles-container {
        display: none;
      }
    }
  `;
}

// JavaScript das animações
function getAnimationsJS() {
  return `
    // ============================================
    // 🎵 PARTÍCULAS MUSICAIS
    // ============================================
    function createMusicParticles() {
      const container = document.querySelector('.particles-container');
      if (!container) return;
      
      const musicEmojis = ['🎵', '🎶', '🎼', '🎧', '🎤', '🎸', '🎹', '🎺', '🎷', '♪', '♫', '♬'];
      const particleCount = 15;
      
      for (let i = 0; i < particleCount; i++) {
        createParticle(container, musicEmojis);
      }
      
      // Criar novas partículas periodicamente
      setInterval(() => {
        if (container.children.length < 20) {
          createParticle(container, musicEmojis);
        }
      }, 2000);
    }
    
    function createParticle(container, emojis) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDuration = (10 + Math.random() * 10) + 's';
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.fontSize = (16 + Math.random() * 20) + 'px';
      
      container.appendChild(particle);
      
      // Remover após animação
      setTimeout(() => {
        particle.remove();
      }, 25000);
    }

    // ============================================
    // 🎯 3D TILT EFFECT
    // ============================================
    function initTiltEffect() {
      document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          const rotateX = (y - centerY) / 10;
          const rotateY = (centerX - x) / 10;
          
          card.style.transform = \`perspective(1000px) rotateX(\${rotateX}deg) rotateY(\${rotateY}deg) scale(1.02)\`;
        });
        
        card.addEventListener('mouseleave', () => {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
      });
    }

    // ============================================
    // 🔢 CONTADORES ANIMADOS
    // ============================================
    function animateCounter(element, target, duration = 2000) {
      const start = 0;
      const startTime = performance.now();
      
      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out-cubic)
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * eased);
        
        element.textContent = current.toLocaleString('pt-BR');
        
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          element.classList.add('counter-highlight');
          setTimeout(() => element.classList.remove('counter-highlight'), 500);
        }
      }
      
      requestAnimationFrame(update);
    }

    function initCounters() {
      const counters = document.querySelectorAll('[data-counter]');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.counter);
            animateCounter(entry.target, target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      
      counters.forEach(counter => observer.observe(counter));
    }

    // ============================================
    // 📜 SCROLL REVEAL
    // ============================================
    function initScrollReveal() {
      const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });
      
      reveals.forEach(reveal => observer.observe(reveal));
    }

    // ============================================
    // 🌙 DARK/LIGHT MODE TOGGLE
    // ============================================
    function initThemeToggle() {
      const toggle = document.getElementById('theme-toggle');
      if (!toggle) return;
      
      // Verificar preferência salva ou do sistema
      const savedTheme = localStorage.getItem('dj-yazan-theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'dark'); // Default dark
      
      document.documentElement.setAttribute('data-theme', currentTheme);
      updateToggleIcon(toggle, currentTheme);
      
      toggle.addEventListener('click', () => {
        const theme = document.documentElement.getAttribute('data-theme');
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('dj-yazan-theme', newTheme);
        updateToggleIcon(toggle, newTheme);
        
        // Animação suave
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
      });
    }

    function updateToggleIcon(toggle, theme) {
      toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
      toggle.title = theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro';
    }

    // ============================================
    // 🚀 INICIALIZAÇÃO
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
      createMusicParticles();
      initTiltEffect();
      initCounters();
      initScrollReveal();
      initThemeToggle();
    });
  `;
}

// HTML do container de partículas
function getParticlesHTML() {
  return `<div class="particles-container" aria-hidden="true"></div>`;
}

// HTML do toggle de tema
function getThemeToggleHTML() {
  return `
    <button id="theme-toggle" class="theme-toggle ripple-btn" aria-label="Alternar tema">
      🌙
    </button>
  `;
}

// CSS do toggle de tema
function getThemeToggleCSS() {
  return `
    .theme-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      background: var(--surface);
      color: var(--text);
      font-size: 24px;
      cursor: pointer;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
    }

    .theme-toggle:hover {
      transform: scale(1.1) rotate(20deg);
      box-shadow: 0 6px 30px rgba(88, 101, 242, 0.4);
    }

    /* Light theme variables */
    [data-theme="light"] {
      --background: #f5f5f7;
      --surface: #ffffff;
      --surface-light: #e8e8ed;
      --text: #1d1d1f;
      --text-muted: #6e6e73;
    }

    [data-theme="light"] .glass-card {
      background: rgba(255, 255, 255, 0.7);
      border-color: rgba(0, 0, 0, 0.1);
    }

    [data-theme="light"] nav {
      background: rgba(255, 255, 255, 0.8);
    }
  `;
}

module.exports = {
  getAnimationsCSS,
  getAnimationsJS,
  getParticlesHTML,
  getThemeToggleHTML,
  getThemeToggleCSS
};
