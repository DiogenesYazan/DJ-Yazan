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

// Função utilitária para formatar tempo
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Barra de progresso
function makeBar(current, total, size = 20) {
  const safeTotal = total > 0 ? total : 1;
  const curr = Math.min(Math.max(current, 0), safeTotal);
  const filled = Math.round((curr / safeTotal) * size);
  return '█'.repeat(filled) + '─'.repeat(size - filled);
}

// Cria Embed Now Playing
function createEmbed(song, currentSec) {
  const bar = makeBar(currentSec, song.duration);
  return new EmbedBuilder()
    .setTitle(`🎶 ${song.name}`)
    .setDescription(`${bar}\n\`${formatTime(currentSec)}/${song.formattedDuration}\``)
    .setThumbnail(song.thumbnail)
    .setColor('Purple');
}

// Guarda mensagem de progresso por fila
const nowPlayingMsg = new Map();
const idleTimeouts = new Map();

// Eventos do DisTube
client.distube
  .on('playSong', (queue, song) => {
    const prev = nowPlayingMsg.get(queue.id);
    if (prev) {
      clearInterval(prev.iv);
      prev.msg.delete().catch(() => {});
      nowPlayingMsg.delete(queue.id);
    }

    queue.textChannel?.send({ embeds: [createEmbed(song, queue.currentTime)] })
      .then(msg => {
        const iv = setInterval(() => {
          const q = client.distube.getQueue(queue.id);
          if (!q || !msg.editable) return clearInterval(iv);
          msg.edit({ embeds: [createEmbed(song, q.currentTime)] })
             .catch(() => clearInterval(iv));
        }, 5000);

        nowPlayingMsg.set(queue.id, { msg, iv });
      });
  })
  .on('addSong', (queue, song) =>
    queue.textChannel?.send(`➕ Adicionada à fila: **${song.name}**`)
  )
  .on('finish', queue => {
    const prev = nowPlayingMsg.get(queue.id);
    if (prev) {
      clearInterval(prev.iv);
      prev.msg.delete().catch(() => {});
      nowPlayingMsg.delete(queue.id);
    }
    queue.textChannel?.send('✅ Fim da fila!');
    scheduleLeave(queue);
  })
  .on('error', (queue, e) => {
    queue?.textChannel
      ? queue.textChannel.send(`❌ Erro: ${e.message}`)
      : console.error(e);
  });

// Se todos saírem, agenda desconexão
client.on('voiceStateUpdate', (oldS, newS) => {
  const q = client.distube.getQueue(oldS.guild.id) || client.distube.getQueue(newS.guild.id);
  if (!q?.voice.channel) return;

  const humanCount = q.voice.channel.members.filter(m => !m.user.bot).size;
  if (humanCount === 0) scheduleLeave(q);
  else {
    clearTimeout(idleTimeouts.get(q.id));
    idleTimeouts.delete(q.id);
  }
});

// Desconectar após 30s sem humanos
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
client.on('interactionCreate', async i => {
  if (!i.isCommand()) return;
  const cmd = client.commands.get(i.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(i);
  } catch (err) {
    console.error(err);
    const rep = { content: '❌ Erro ao executar o comando.', ephemeral: true };
    i.replied ? await i.followUp(rep) : await i.reply(rep);
  }
});

client.login(process.env.TOKEN);
