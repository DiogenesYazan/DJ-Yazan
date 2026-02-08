// ============================================
// 🔐 MIDDLEWARE DE AUTENTICAÇÃO
// ============================================

// Verifica se usuário está autenticado
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  // Salva URL de destino para redirecionar após login
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/discord');
}

// Verifica se usuário está autenticado (retorna JSON para APIs)
function isAuthenticatedAPI(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  
  res.status(401).json({ 
    error: 'Não autorizado',
    message: 'Faça login para acessar este recurso'
  });
}

// Middleware para adicionar user ao locals (disponível em templates)
function addUserToLocals(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated ? req.isAuthenticated() : false;
  next();
}

// Middleware para verificar se usuário é admin de um servidor
function isGuildAdmin(client) {
  return async (req, res, next) => {
    const guildId = req.params.guildId || req.body.guildId;
    
    if (!guildId) {
      return res.status(400).json({ error: 'ID do servidor não fornecido' });
    }
    
    if (!req.user) {
      return res.status(401).json({ error: 'Não autorizado' });
    }
    
    // Verifica se o usuário tem permissão no servidor
    const userGuild = req.user.guilds?.find(g => g.id === guildId);
    
    if (!userGuild) {
      return res.status(403).json({ error: 'Você não está neste servidor' });
    }
    
    if (!userGuild.isAdmin) {
      return res.status(403).json({ error: 'Você não tem permissão de administrador neste servidor' });
    }
    
    // Verifica se o bot está no servidor
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return res.status(404).json({ error: 'O bot não está neste servidor' });
    }
    
    req.guild = guild;
    next();
  };
}

module.exports = {
  isAuthenticated,
  isAuthenticatedAPI,
  addUserToLocals,
  isGuildAdmin
};
