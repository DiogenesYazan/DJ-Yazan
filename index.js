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
const axios = require('axios');
const lavalinkServers = require('./lavalink-servers.json');
const statusMessages = require('./status-messages.json');

// Importa o servidor web modular
const { createWebServer, botStats } = require('./web/server');

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
const UserFavorites = require('./models/UserFavorites');
const UserPlaylist = require('./models/UserPlaylist');
const BotStats = require('./models/BotStats');

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

// ============================================
// 🌐 INICIALIZA SERVIDOR WEB
// ============================================
const { playerSocket } = createWebServer(client, Leaderboard, UserFavorites, UserPlaylist);

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

  // ============================================
  // 📊 ATUALIZAÇÃO DE STATS PARA O SITE
  // ============================================
  async function updateBotStats() {
    try {
      const guildCount = client.guilds.cache.size;
      const userCount = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
      const activePlayers = client.lavalink?.players?.size || 0;
      
      // Lista de IDs dos servidores onde o bot está
      const guildIds = Array.from(client.guilds.cache.keys());
      
      await BotStats.updateStats({
        guildCount,
        userCount,
        activePlayers,
        guildIds,
        isOnline: true,
        botStartTime: client.readyAt
      });
    } catch (err) {
      console.error('Erro ao atualizar stats:', err.message);
    }
  }
  
  // Atualiza stats imediatamente e depois a cada 60 segundos
  updateBotStats();
  setInterval(updateBotStats, 60_000);

  // ============================================
  // 🔄 KEEP-ALIVE: Evita que Heroku coloque dynos em sleep
  // ============================================
  const APP_URL = process.env.APP_URL || process.env.HEROKU_APP_URL;
  
  if (APP_URL) {
    console.log(`🔄 Keep-alive ativado para: ${APP_URL}`);
    
    // Ping a cada 25 minutos (Heroku dorme após 30 min de inatividade)
    const KEEP_ALIVE_INTERVAL = 25 * 60 * 1000; // 25 minutos
    
    async function keepAlive() {
      try {
        const response = await axios.get(APP_URL, { timeout: 10000 });
        console.log(`💓 Keep-alive ping: ${response.status} OK`);
      } catch (error) {
        console.log(`⚠️ Keep-alive ping falhou: ${error.message}`);
      }
    }
    
    // Primeiro ping após 5 minutos, depois a cada 25 minutos
    setTimeout(() => {
      keepAlive();
      setInterval(keepAlive, KEEP_ALIVE_INTERVAL);
    }, 5 * 60 * 1000);
  } else {
    console.log('⚠️ APP_URL não configurada - Keep-alive desativado');
    console.log('   Configure APP_URL no Heroku para evitar sleep dos dynos');
  }

  // Rotação de status (carrega do arquivo JSON)
  const statuses = statusMessages.statuses.map(s => s.text);
  // Adiciona status dinâmico de servidores
  statuses.push(`🌐 ${client.guilds.cache.size} servidores`);
  
  console.log(`📋 Carregadas ${statuses.length} mensagens de status`);
  
  let idx = 0;
  setInterval(() => {
    // Atualiza contagem de servidores dinamicamente
    const currentStatus = statuses[idx] === `🌐 ${client.guilds.cache.size} servidores` 
      ? `🌐 ${client.guilds.cache.size} servidores`
      : statuses[idx];
    client.user.setActivity(currentStatus);
    idx = (idx + 1) % statuses.length;
  }, statusMessages.rotationIntervalMs || 30_000);
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

  // === WEBSOCKET: Emite evento de track start ===
  if (playerSocket) {
    playerSocket.onTrackStart(player.guildId, track, player);
  }

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
    
    // === WEBSOCKET: Emite posição atual ===
    if (playerSocket) {
      playerSocket.onPositionUpdate(player.guildId, player.position, track.info.length);
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
  // === WEBSOCKET: Emite evento de track end ===
  if (playerSocket) {
    playerSocket.onTrackEnd(player.guildId, track);
  }

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
  
  // === WEBSOCKET: Emite evento de queue end ===
  if (playerSocket) {
    playerSocket.onQueueEnd(player.guildId);
  }
  
  const ch = client.channels.cache.get(player.textChannelId);
  
  // === AUTOPLAY: Verifica se autoplay está ativo ===
  const config = await GuildConfig.findOne({ guildId: player.guildId });
  const isAutoplay = config?.autoplay || false;
  
  if (mode === 'off' && isAutoplay) {
    // Busca música relacionada baseada na última tocada
    try {
      const lastTrack = player.queue.previous?.[0];
      if (lastTrack) {
        const searchQuery = `${lastTrack.info.author} ${lastTrack.info.title.replace(/\(.*?\)/g, '').trim()} mix`;
        const result = await player.search({ query: searchQuery, source: 'youtube' }, player);
        
        if (result.tracks.length > 0) {
          // Pega uma música aleatória dos 5 primeiros resultados (evita repetição)
          const randomIndex = Math.floor(Math.random() * Math.min(5, result.tracks.length));
          const nextTrack = result.tracks[randomIndex];
          
          // Adiciona à fila e toca
          player.queue.add(nextTrack);
          await player.play();
          
          if (ch) {
            ch.send({
              content: `🔄 **Autoplay:** Adicionando **${nextTrack.info.title}**`
            }).catch(() => {});
          }
          return; // Não desconecta se autoplay adicionou música
        }
      }
    } catch (error) {
      console.error('Erro no autoplay:', error);
    }
  }
  
  if (ch) {
    ch.send({
      content: `✅ Fim da fila${mode === 'off' ? '' : ` (loop: ${mode})`}`,
      ephemeral: false
    }).catch(() => {});
  }
  
  if (mode === 'off') {
    stopIv(player.guildId);
    
    // config já foi buscado acima para autoplay
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
            // === WEBSOCKET: Emite evento de pause ===
            if (playerSocket) playerSocket.onPlayerPause(guildIdPause, false);
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
            // === WEBSOCKET: Emite evento de pause ===
            if (playerSocket) playerSocket.onPlayerPause(guildIdPause, true);
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
          // === WEBSOCKET: Emite evento de volume ===
          if (playerSocket) playerSocket.onVolumeChange(i.guild.id, newVolDown);
          await i.reply({ content: `🔉 Volume: ${newVolDown}%`, ephemeral: true });
          break;

        case 'controller_volume_up':
          const newVolUp = Math.min(200, player.volume + 10);
          await player.setVolume(newVolUp);
          // === WEBSOCKET: Emite evento de volume ===
          if (playerSocket) playerSocket.onVolumeChange(i.guild.id, newVolUp);
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
