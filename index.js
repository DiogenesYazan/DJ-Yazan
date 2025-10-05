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

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  presence: {
    status: 'online',
    activities: [{ name: 'iniciando...', type: ActivityType.Playing }]
  }
});

// Carrega comandos
client.commands = new Collection();
for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

// Map para armazenar modo de loop por guilda
client.loopModes = new Map();

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

// Configuração do Lavalink v4 com melhores práticas
client.lavalink = new LavalinkManager({
  nodes: [
    {
      authorization: process.env.LAVA_PASSWORD,
      host: process.env.LAVA_HOST,
      port: +process.env.LAVA_PORT,
      id: 'main_lavalink',
      secure: process.env.LAVA_SECURE === 'true',
      // Configurações de conexão otimizadas
      requestSignalTimeoutMS: 10000,
      closeOnError: false,
      heartBeatInterval: 30_000,
      enablePingOnStatsCheck: true,
      retryDelay: 10_000,
      retryAmount: 5
    }
  ],
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
  linksWhitelist: []
});

client.on('ready', () => {
  console.log(`✅ Online: ${client.user.tag}`);
  
  // Verificar se as variáveis de ambiente estão configuradas
  if (!process.env.LAVA_HOST || !process.env.LAVA_PORT || !process.env.LAVA_PASSWORD) {
    console.error('❌ ERRO: Variáveis de ambiente do Lavalink não configuradas!');
    console.error('📝 Verifique o arquivo .env');
    return;
  }
  
  console.log(`🎵 Inicializando Lavalink Manager...`);
  console.log(`📡 Servidor: ${process.env.LAVA_HOST}:${process.env.LAVA_PORT}`);
  console.log(`� Secure: ${process.env.LAVA_SECURE === 'true' ? 'SSL/TLS' : 'HTTP'}`);
  
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
    '🎧 ouvindo você',
    '📻 música 24/7',
    '🎤 solicite uma música',
    '🎼 música é arte',
    '🎹 música para todos',
    '🎷 relaxe com música',
    '🎺 música é felicidade' 
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
  console.log(`✅ Conectado ao Lavalink: ${node.id}`);
  console.log(`   Host: ${node.options.host}:${node.options.port}`);
  console.log(`   Versão: Lavalink v4`);
  console.log(`   Secure: ${node.options.secure ? 'SSL/TLS' : 'HTTP'}`);
  lavalinkReady = true;
});

client.lavalink.nodeManager.on('reconnecting', (node) => {
  console.log(`🔄 Reconectando ao Lavalink: ${node.id}...`);
});

client.lavalink.nodeManager.on('disconnect', (node, reason) => {
  console.log(`❌ Desconectado do Lavalink: ${node.id}`);
  console.log(`   Motivo: ${reason?.code || 'Desconhecido'} - ${reason?.reason || 'N/A'}`);
  
  // Só marca como não pronto se todos os nós estiverem desconectados
  const connectedNodes = Array.from(client.lavalink.nodeManager.nodes.values())
    .filter(n => n.connected);
  
  if (connectedNodes.length === 0) {
    lavalinkReady = false;
    console.log('⚠️ Nenhum servidor Lavalink disponível!');
  }
});

client.lavalink.nodeManager.on('error', (node, error, payload) => {
  console.error(`❌ Erro no Lavalink ${node.id}:`);
  console.error(`   Mensagem: ${error.message || error}`);
  if (payload) {
    console.error(`   Payload:`, payload);
  }
});

client.lavalink.nodeManager.on('destroy', (node) => {
  console.log(`🗑️ Nó Lavalink destruído: ${node.id}`);
});

// === Eventos do Player (música) ===

// Barra de progresso ao iniciar faixa
const ivMap = new Map();
client.lavalink.on('trackStart', async (player, track) => {
  const ch = client.channels.cache.get(player.textChannelId);
  if (!ch) return;

  const msg = await ch.send({ embeds: [mkEmbedBlocks(track, player)] });
  
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
client.lavalink.on('queueEnd', (player) => {
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
  }
});

// Handler de comandos
client.on('interactionCreate', async i => {
  if (!i.isChatInputCommand()) return;
  const cmd = client.commands.get(i.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(i);
  } catch (e) {
    console.error('Erro:', e);
    const r = { content: '❌ Erro interno', ephemeral: true };
    i.replied || i.deferred
      ? await i.followUp(r)
      : await i.reply(r);
  }
});

client.login(process.env.TOKEN);
