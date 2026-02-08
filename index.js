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
const lavalinkServers = require('./lavalink-servers.json');

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

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado ao MongoDB com sucesso!'))
  .catch((err) => console.error('❌ Erro ao conectar ao MongoDB:', err));

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

// Funções de barra de progresso
const BAR_SIZE = 25; // Tamanho da barra de progresso
const BLOCK_INTERVAL = 5_000;

// Função para formatar tempo em mm:ss
function formatTime(ms) {
  if (!ms || ms <= 0 || isNaN(ms)) return '00:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function makeBlockBar(currentTime, totalTime) {
  if (!totalTime || totalTime <= 0 || isNaN(totalTime)) {
    return '▇'.repeat(BAR_SIZE); // Barra cheia se não tiver duração
  }
  
  const progress = Math.min(currentTime / totalTime, 1);
  const filled = Math.floor(progress * BAR_SIZE);
  return '▇'.repeat(filled) + '─'.repeat(BAR_SIZE - filled);
}

function mkEmbedBlocks(track, player) {
  const currentTime = player ? player.position : 0;
  const totalTime = track.info.length || track.info.duration || 0;
  
  // Se não conseguir obter duração, tenta outras propriedades
  const duration = totalTime || player?.queue?.current?.info?.length || 0;
  
  const timeDisplay = duration > 0 
    ? `${formatTime(currentTime)} / ${formatTime(duration)}`
    : `${formatTime(currentTime)} / ∞`; // Para streams ao vivo
  
  return new EmbedBuilder()
    .setTitle(`🎶 ${track.info.title} — ${track.info.author}`)
    .setDescription(`${makeBlockBar(currentTime, duration)}\n\`${timeDisplay}\``)
    .addFields({ name: '🔊 Volume', value: `${player.volume}%`, inline: true })
    .setThumbnail(track.info.artworkUrl || null)
    .setColor('Purple');
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

  // Rotação de status
  const statuses = [
    '♬ tocando música',
    '🎵 use /play para ouvir',
    `${client.guilds.cache.size} servidores`,
    '🎶 música é vida',
    '🔁 use /loop para loop',
    '🎧 Ariel deixe de brincadeira gostosa',
    '📻 música 24/7',
    '🎤 solicite uma música',
    '🎼 OS CARA TÁ NA MALDADE',
    '🎹 ESCONDAM A MAKITA',
    '🎷 relaxe com música',
    '🎺 NÃO CHORAXX' 
  ];
  let idx = 0;
  setInterval(() => {
    client.user.setActivity(statuses[idx]);
    idx = (idx + 1) % statuses.length;
  }, 30_000);
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

  const msg = await ch.send({ embeds: [mkEmbedBlocks(track, player)] });
  
  // === LEADERBOARD TRACKING ===
  // Registra início da música para tracking de tempo
  if (track.requester && track.requester.id) {
    const trackKey = `${player.guildId}_${track.requester.id}`;
    trackStartTimes.set(trackKey, Date.now());
    
    // Incrementa contador de músicas
    await updateLeaderboard(player.guildId, track.requester.id, 'song');
  }
  
  // Atualizar barra de progresso a cada 5 segundos
  const iv = setInterval(async () => {
    if (!player.queue.current) {
      clearInterval(iv);
      return;
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
  // === LEADERBOARD TRACKING ===
  // Registra tempo ouvido quando música termina
  if (track.requester && track.requester.id) {
    const trackKey = `${player.guildId}_${track.requester.id}`;
    const startTime = trackStartTimes.get(trackKey);
    
    if (startTime) {
      const timeListened = Date.now() - startTime;
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
  
  const ch = client.channels.cache.get(player.textChannelId);
  if (ch) {
    ch.send({
      content: `✅ Fim da fila${mode === 'off' ? '' : ` (loop: ${mode})`}`,
      ephemeral: false
    }).catch(() => {});
  }
  
  if (mode === 'off') {
    stopIv(player.guildId);
    
    // Verifica modo 24/7 no Banco de Dados
    const config = await GuildConfig.findOne({ guildId: player.guildId });
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
          if (player.paused) {
            await player.resume();
            await i.reply({ content: '▶️ Reprodução retomada!', ephemeral: true });
          } else {
            await player.pause();
            await i.reply({ content: '⏸️ Música pausada!', ephemeral: true });
          }
          break;

        case 'controller_skip':
          const skipped = player.queue.current;
          await player.skip();
          await i.reply({ content: `⏭️ Pulada: **${skipped.info.title}**`, ephemeral: true });
          break;

        case 'controller_stop':
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
          await i.reply({ content: `🔉 Volume: ${newVolDown}%`, ephemeral: true });
          break;

        case 'controller_volume_up':
          const newVolUp = Math.min(200, player.volume + 10);
          await player.setVolume(newVolUp);
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
