// ============================================
// 🎵 WEBSOCKET PLAYER - Real-time Updates
// ============================================

const { Server } = require('socket.io');

function createPlayerSocket(server, client) {
  const io = new Server(server, {
    cors: {
      origin: process.env.APP_URL || '*',
      methods: ['GET', 'POST']
    },
    path: '/socket.io'
  });

  // Namespace para player em tempo real
  const playerNamespace = io.of('/player');

  // Armazenar conexões por guild
  const guildConnections = new Map();

  playerNamespace.on('connection', (socket) => {
    console.log(`🔌 [Socket] Nova conexão: ${socket.id}`);

    // Cliente se inscreve em um guild específico
    socket.on('subscribe', (guildId) => {
      if (!guildId) return;
      
      socket.join(`guild:${guildId}`);
      
      // Adiciona à lista de conexões do guild
      if (!guildConnections.has(guildId)) {
        guildConnections.set(guildId, new Set());
      }
      guildConnections.get(guildId).add(socket.id);
      
      console.log(`🔔 [Socket] ${socket.id} inscrito em guild:${guildId}`);
      
      // Envia estado atual do player
      const player = client.lavalink?.getPlayer(guildId);
      if (player && player.queue.current) {
        socket.emit('playerState', getPlayerState(player));
      } else {
        socket.emit('playerState', null);
      }
    });

    // Cliente cancela inscrição
    socket.on('unsubscribe', (guildId) => {
      if (!guildId) return;
      
      socket.leave(`guild:${guildId}`);
      
      if (guildConnections.has(guildId)) {
        guildConnections.get(guildId).delete(socket.id);
      }
      
      console.log(`🔕 [Socket] ${socket.id} saiu de guild:${guildId}`);
    });

    socket.on('disconnect', () => {
      // Remove de todas as guilds
      guildConnections.forEach((connections, guildId) => {
        connections.delete(socket.id);
      });
      console.log(`❌ [Socket] Desconectado: ${socket.id}`);
    });
  });

  // Função para obter estado do player
  function getPlayerState(player) {
    const track = player.queue.current;
    if (!track) return null;

    return {
      playing: player.playing,
      paused: player.paused,
      position: player.position,
      volume: player.volume,
      track: {
        title: track.info.title,
        author: track.info.author,
        duration: track.info.length || track.info.duration,
        uri: track.info.uri,
        thumbnail: track.info.artworkUrl || `https://img.youtube.com/vi/${track.info.identifier}/mqdefault.jpg`,
        requester: track.requester ? {
          id: track.requester.id,
          username: track.requester.username,
          avatar: track.requester.avatar
        } : null
      },
      queue: {
        size: player.queue.tracks.length,
        next: player.queue.tracks[0] ? {
          title: player.queue.tracks[0].info.title,
          author: player.queue.tracks[0].info.author
        } : null
      },
      loop: client.loopModes?.get(player.guildId) || 'off'
    };
  }

  // Função para emitir atualização para um guild
  function emitToGuild(guildId, event, data) {
    playerNamespace.to(`guild:${guildId}`).emit(event, data);
  }

  // Funções exportadas para uso no index.js
  return {
    io,
    playerNamespace,
    
    // Emitir quando música começa
    onTrackStart: (player, track) => {
      emitToGuild(player.guildId, 'trackStart', getPlayerState(player));
    },
    
    // Emitir quando música termina
    onTrackEnd: (player, track) => {
      emitToGuild(player.guildId, 'trackEnd', { title: track.info.title });
    },
    
    // Emitir quando player é pausado/resumido
    onPlayerPause: (player, paused) => {
      emitToGuild(player.guildId, 'playerPause', { paused, state: getPlayerState(player) });
    },
    
    // Emitir atualização de posição (chamar periodicamente)
    onPositionUpdate: (player) => {
      if (!player || !player.queue.current) return;
      emitToGuild(player.guildId, 'positionUpdate', {
        position: player.position,
        duration: player.queue.current.info.length || player.queue.current.info.duration
      });
    },
    
    // Emitir quando fila é atualizada
    onQueueUpdate: (player) => {
      emitToGuild(player.guildId, 'queueUpdate', getPlayerState(player));
    },
    
    // Emitir quando fila acaba
    onQueueEnd: (guildId) => {
      emitToGuild(guildId, 'queueEnd', null);
    },
    
    // Emitir quando volume muda
    onVolumeChange: (player, volume) => {
      emitToGuild(player.guildId, 'volumeChange', { volume });
    },
    
    // Verificar se há conexões ativas para um guild
    hasConnections: (guildId) => {
      return guildConnections.has(guildId) && guildConnections.get(guildId).size > 0;
    },

    // Obter estado do player (para uso externo)
    getPlayerState
  };
}

module.exports = { createPlayerSocket };
