// index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');
const fs = require('fs');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.MessageContent]
});

// Carrega comandos
client.commands = new Collection();
for (const f of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${f}`);
  client.commands.set(cmd.data.name, cmd);
}

// Argumentos iniciais do bot
client.distube = new DisTube(client, {
  plugins: [ new YouTubePlugin() ],
  emitNewSongOnly: true,
  savePreviousSongs: true
});

// Barra ASCII
function makeBar(current, total, size = 20) {
  const filled = Math.round((current / total) * size);
  const empty = size - filled;
  return '█'.repeat(filled) + '─'.repeat(empty);
}

// Cria embed "Now Playing"
function createEmbed(song, totalSec, currentSec) {
  const bar = makeBar(currentSec, totalSec);
  const fmt = sec => `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
  const now = fmt(Math.floor(currentSec));
  const tot = song.formattedDuration;
  return new EmbedBuilder()
    .setTitle(`🎶 ${song.name}`)
    .setDescription(`${bar}\n\`${now}/${tot}\``)
    .setThumbnail(song.thumbnail)
    .setColor('Purple');
}

// Quando uma música começa
client.distube.on('playSong', (queue, song) => {
  if (!queue?.textChannel) return;
  const embed = createEmbed(song, queue.duration, queue.currentTime);
  queue.textChannel.send({ embeds: [embed] }).then(msg => {
    const iv = setInterval(() => {
      msg.edit({ embeds: [createEmbed(song, queue.duration, queue.currentTime)] })
         .catch(() => clearInterval(iv));
    }, 5000);

    // Limpa o setInterval quando a fila acabar
    client.distube.once('finish', queue2 => {
      if (queue2.id === queue.id) clearInterval(iv);
    });
  });
});

// Tratamento de erro
client.distube.on('error', (queue, e) => {
  if (queue?.textChannel) {
    queue.textChannel.send(`❌ Erro: ${e.message}`);
  } else {
    console.error('❌ Erro sem canal:', e);
  }
});

// Eventos do cliente
client.on('ready', () => console.log(`✅ Bot online: ${client.user.tag}`));
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error('❌ Erro no comando:', err);
    const rep = { content: '❌ Erro ao executar o comando.', ephemeral: true };
    interaction.replied ? await interaction.followUp(rep) : await interaction.reply(rep);
  }
});

client.login(process.env.TOKEN);
