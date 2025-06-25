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
    .setImage('attachment://disc.gif') // GIF do disco girando
    .setColor('Purple');
}

// Configuração do Lavalink
client.lavalink = new LavalinkManager({
  nodes: [{
    host: process.env.LAVA_HOST,
    port: +process.env.LAVA_PORT,
    authorization: process.env.LAVA_PASSWORD,
    secure: process.env.LAVA_SECURE === 'true',
    id: 'main'
  }],
  sendToShard: (guildId, packet) =>
    client.guilds.cache.get(guildId)?.shard?.send(packet),
  client: { id: process.env.CLIENT_ID, username: 'MusicBot' },
  playerOptions: { onEmptyQueue: { destroyAfterMs: 30_000 } },
  queueOptions: { emitQueueUpdates: true },
  autoSkip: true
});

client.on('ready', () => {
  client.lavalink.init({ id: client.user.id, username: client.user.username });
  console.log(`✅ Online: ${client.user.tag}`);

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

client.on('raw', data => client.lavalink.sendRawData(data));

// Barra de progresso ao iniciar faixa
const ivMap = new Map();
client.lavalink.on('trackStart', async (player, track) => {
  const ch = client.channels.cache.get(player.textChannelId);
  if (!ch) return;

  const msg = await ch.send({ 
    embeds: [mkEmbedBlocks(track, player)],
    files: [{ 
      attachment: './assets/disc.gif', 
      name: 'disc.gif' 
    }] 
  });
  
  const iv = setInterval(async () => {
    if (!player.queue.current) return clearInterval(iv);
    try { 
      await msg.edit({ 
        embeds: [mkEmbedBlocks(track, player)],
        files: [{ 
          attachment: './assets/disc.gif', 
          name: 'disc.gif' 
        }] 
      }); 
    } catch {}
  }, BLOCK_INTERVAL);

  ivMap.set(player.guildId, iv);
});

// Limpa barra quando necessário
function stopIv(guildId) {
  const iv = ivMap.get(guildId);
  if (iv) clearInterval(iv), ivMap.delete(guildId);
}

// Loop manual ao finalizar faixa
client.lavalink.on('trackEnd', (player, track) => {
  const mode = client.loopModes.get(player.guildId) || 'off';

  if (mode === 'track') {
    player.queue.unshift(track);
    player.play();
  } else if (mode === 'queue') {
    player.queue.add(track);
  } else {
    stopIv(player.guildId);
  }
});


// Ações ao terminar a fila
client.lavalink.on('queueEnd', player => {
  const mode = client.loopModes.get(player.guildId) || 'off';
  client.channels.cache.get(player.textChannelId)
    ?.send(`✅ Fim da fila${mode === 'off' ? '' : ` (loop: ${mode})`}`);
  if (mode === 'off') stopIv(player.guildId);
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
