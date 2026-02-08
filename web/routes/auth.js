// ============================================
// 🔑 ROTAS DE AUTENTICAÇÃO OAUTH2
// ============================================

const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const UserSession = require('../../models/UserSession');

function createAuthRouter(client) {
  const router = express.Router();
  
  // Configurar estratégia Discord OAuth2
  passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['identify', 'email', 'guilds']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Processa os servidores do usuário
      const guilds = profile.guilds?.map(guild => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        isAdmin: (guild.permissions & 0x8) === 0x8 || (guild.permissions & 0x20) === 0x20,
        hasBot: client.guilds.cache.has(guild.id)
      })) || [];
      
      // Atualiza ou cria sessão no banco
      const session = await UserSession.findOneAndUpdate(
        { discordId: profile.id },
        {
          discordId: profile.id,
          username: profile.username,
          globalName: profile.global_name,
          avatar: profile.avatar,
          email: profile.email,
          accessToken: accessToken,
          refreshToken: refreshToken,
          tokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
          guilds: guilds,
          lastLogin: new Date()
        },
        { upsert: true, new: true }
      );
      
      return done(null, session);
    } catch (error) {
      console.error('Erro no OAuth2:', error);
      return done(error, null);
    }
  }));
  
  // Serialização do usuário para sessão
  passport.serializeUser((user, done) => {
    done(null, user.discordId);
  });
  
  passport.deserializeUser(async (discordId, done) => {
    try {
      const user = await UserSession.findOne({ discordId });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  // ============================================
  // ROTAS
  // ============================================
  
  // Iniciar login com Discord
  router.get('/discord', passport.authenticate('discord'));
  
  // Callback do Discord OAuth2
  router.get('/discord/callback', 
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
      // Redireciona para URL salva ou dashboard
      const returnTo = req.session.returnTo || '/dashboard';
      delete req.session.returnTo;
      res.redirect(returnTo);
    }
  );
  
  // Logout
  router.get('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Erro no logout:', err);
      }
      res.redirect('/');
    });
  });
  
  // API: Dados do usuário logado
  router.get('/me', (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    
    res.json({
      id: req.user.discordId,
      username: req.user.username,
      globalName: req.user.globalName,
      avatar: req.user.getAvatarUrl(),
      email: req.user.email,
      guilds: req.user.guilds?.filter(g => g.hasBot) || []
    });
  });
  
  return router;
}

module.exports = { createAuthRouter };
