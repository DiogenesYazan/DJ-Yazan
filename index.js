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

// Instância DisTube
client.distube = new DisTube(client, {
  plugins: [new YouTubePlugin()],
  emitNewSongOnly: true,
  savePreviousSongs: true
});

// Barra de progresso
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

const idleTimeouts = new Map(); // 🔹 track timeouts per guild

// Eventos DisTube
client.distube
  .on('playSong', (queue, song) => {
    // Cancela qualquer timeout pendente
    clearTimeout(idleTimeouts.get(queue.id));
    idleTimeouts.delete(queue.id);

    const totalSec = song.duration;
    const embed = createEmbed(song, totalSec, queue.currentTime);
    queue.textChannel?.send({ embeds: [embed] }).then(msg => {
      const iv = setInterval(() => {
        msg.edit({ embeds: [createEmbed(song, totalSec, queue.currentTime)] })
           .catch(() => clearInterval(iv));
      }, 5000);
    });
  })
  .on('addSong', (queue, song) => {
    queue.textChannel?.send(`➕ Adicionada à fila: **${song.name}**`);
  })
  .on('finish', queue => {
    queue.textChannel?.send('✅ Fim da fila!');
    scheduleLeave(queue);
  })
  .on('error', (queue, e) => {
    if (queue?.textChannel) queue.textChannel.send(`❌ Erro: ${e.message}`);
    else console.error('❌ Erro sem canal:', e);
  });

// 🚪 Sai se todos sairem: verifica voz e agenda saída
client.on('voiceStateUpdate', (oldState, newState) => {
  const queue = client.distube.getQueue(oldState.guild.id) || client.distube.getQueue(newState.guild.id);
  if (!queue?.voice.channel) return;

  const vc = queue.voice.channel;
  const nonBots = vc.members.filter(m => !m.user.bot);
  if (nonBots.size === 0) {
    scheduleLeave(queue);
  } else {
    clearTimeout(idleTimeouts.get(queue.id));
    idleTimeouts.delete(queue.id);
  }
});

// Agenda saída após 30s sem usuários humanos
function scheduleLeave(queue) {
  clearTimeout(idleTimeouts.get(queue.id));
  const to = setTimeout(() => {
    queue.voice.disconnect();
    queue.textChannel?.send('🔚 Saindo por ausência de usuários.');
    idleTimeouts.delete(queue.id);
  }, 30000);
  idleTimeouts.set(queue.id, to);
}

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
    const rep = { content: '❌ Ocorreu um erro.', ephemeral: true };
    interaction.replied ? await interaction.followUp(rep) : await interaction.reply(rep);
  }
});

client.login(process.env.TOKEN);
