// index.js
require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});

// Carrega comandos
client.commands = new Collection();
for (const f of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${f}`);
  client.commands.set(cmd.data.name, cmd);
}

// Instância DisTube com o plugin do YouTube
client.distube = new DisTube(client, {
  plugins: [new YouTubePlugin()],
  emitNewSongOnly: true,
  savePreviousSongs: true
});

// Funções de barra de progresso
function makeBar(current, total, size = 20) {
  const filled = Math.round((current / total) * size);
  return '█'.repeat(filled) + '─'.repeat(size - filled);
}

function createEmbed(song, totalSec, currentSec) {
  const bar = makeBar(currentSec, totalSec);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  return new EmbedBuilder()
    .setTitle(`🎶 ${song.name}`)
    .setDescription(`${bar}\n\`${fmt(Math.floor(currentSec))}/${song.formattedDuration}\``)
    .setThumbnail(song.thumbnail)
    .setColor('Purple');
}

// Eventos de reprodução
client.distube
  .on('playSong', (queue, song) => {
    if (!queue.textChannel) return;
    const embed = createEmbed(song, queue.duration, queue.currentTime);
    queue.textChannel.send({ embeds: [embed] }).then(msg => {
      const iv = setInterval(() => {
        msg.edit({ embeds: [createEmbed(song, queue.duration, queue.currentTime)] })
           .catch(() => clearInterval(iv));
      }, 5000);
      // Limpa o intervalo quando a fila termina
      client.distube.once('finish', q => {
        if (q.id === queue.id) clearInterval(iv);
      });
    });
  })
  .on('addSong', (queue, song) => queue.textChannel.send(`➕ Adicionada à fila: **${song.name}**`))
  .on('finish', queue => queue.textChannel.send('✅ Fim da fila!'))
  .on('error', (queue, e) => {
    if (queue?.textChannel) queue.textChannel.send(`❌ Erro: ${e.message}`);
    else console.error('❌ Erro sem canal:', e);
  });

// Eventos do bot
client.on('ready', () => console.log(`✅ Bot online: ${client.user.tag}`));
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error('❌ Erro no comando:', err);
    const reply = { content: '❌ Ocorreu um erro.', ephemeral: true };
    interaction.replied ? await interaction.followUp(reply) : await interaction.reply(reply);
  }
});

client.login(process.env.TOKEN);
