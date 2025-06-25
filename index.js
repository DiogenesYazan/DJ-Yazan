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
const BAR_SIZE = 13;
const BLOCK_INTERVAL = 15_000;
function makeBlockBar(blocks) {
  const filled = Math.min(blocks, BAR_SIZE);
  return '▇'.repeat(filled) + '─'.repeat(BAR_SIZE - filled);
}
function mkEmbedBlocks(track, blocks, vol) {
  return new EmbedBuilder()
    .setTitle(`🎶 ${track.info.title} — ${track.info.author}`)
    .setDescription(makeBlockBar(blocks))
    .addFields({ name: '🔊 Volume', value: `${vol}%`, inline: true })
    .setThumbnail(track.info.artworkUrl || null)
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

  const msg = await ch.send({ embeds: [mkEmbedBlocks(track, 0, player.volume)] });
  let blocks = 0;
  const iv = setInterval(async () => {
    if (!player.queue.current) return clearInterval(iv);
    blocks++;
    try { await msg.edit({ embeds: [mkEmbedBlocks(track, blocks, player.volume)] }); } catch {}
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
