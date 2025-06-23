require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const { LavalinkManager } = require('lavalink-client');
const fs = require('fs');

/* ─── Discord client & comandos ─── */
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});
client.commands = new Collection();
for (const file of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
}

/* ─── Helpers de barra ─── */
const BAR_SIZE = 13;              // total de blocos na barra
const BLOCK_INTERVAL = 15_000;    // 15 segundos por bloco
const EMPTY_BAR = '─'.repeat(BAR_SIZE);

// Gera a barra com N blocos preenchidos
function makeBlockBar(blocks) {
  const filled = Math.min(blocks, BAR_SIZE);
  return '▇'.repeat(filled) + '─'.repeat(BAR_SIZE - filled);
}

/* ─── Cria Embed sem timestamps ─── */
function mkEmbedBlocks(track, blocks, vol) {
  return new EmbedBuilder()
    .setTitle(`🎶 ${track.info.title} — ${track.info.author}`)
    .setDescription(makeBlockBar(blocks))
    .addFields({ name: '🔊 Volume', value: `${vol}%`, inline: true })
    .setThumbnail(track.info.artworkUrl || null)
    .setColor('Purple');
}

/* ─── Configuração do Lavalink ─── */
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

/* ─── Controle de intervalos ─── */
const ivMap = new Map();

/* ─── Eventos do Bot ─── */
client.on('ready', () => {
  client.lavalink.init({ id: client.user.id, username: client.user.username });
  console.log(`✅ Online: ${client.user.tag}`);
});
client.on('raw', data => client.lavalink.sendRawData(data));

client.lavalink.on('trackStart', async (player, track) => {
  const channel = client.channels.cache.get(player.textChannelId);
  if (!channel) return;

  // Envia embed inicial com zero blocos
  const msg = await channel.send({
    embeds: [mkEmbedBlocks(track, 0, player.volume)]
  });

  // A cada 15s, adiciona um bloco
  let blocks = 0;
  const interval = setInterval(async () => {
    // Se a música acabou ou mudou, limpa o intervalo
    if (!player.queue.current) {
      clearInterval(interval);
      return;
    }

    blocks++;
    try {
      await msg.edit({
        embeds: [mkEmbedBlocks(track, blocks, player.volume)]
      });
    } catch {
      // se falhar, apenas ignore
    }
  }, BLOCK_INTERVAL);

  ivMap.set(player.guildId, interval);
});

const stopIv = guildId => {
  const iv = ivMap.get(guildId);
  if (iv) {
    clearInterval(iv);
    ivMap.delete(guildId);
  }
};

client.lavalink.on('trackEnd', p => stopIv(p.guildId));
client.lavalink.on('queueEnd', p => {
  stopIv(p.guildId);
  client.channels.cache.get(p.textChannelId)
    ?.send('✅ Fim da fila! Saindo em 30 s se nada for adicionado.');
});

/* ─── Comandos Slash ─── */
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (error) {
    console.error('Erro ao executar comando:', error);
    const reply = { content: '❌ Erro interno', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

/* ─── Inicia sessão ─── */
client.login(process.env.TOKEN);
