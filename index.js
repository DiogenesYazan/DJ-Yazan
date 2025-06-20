// index.js
require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  EmbedBuilder
} = require('discord.js');
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

// Instancia DisTube
client.distube = new DisTube(client, {
  plugins: [new YouTubePlugin()],
  emitNewSongOnly: true,
  savePreviousSongs: true
});

// Barra de progresso
function makeBar(current, total, size = 20) {
  const pct = Math.max(0, Math.min(current / total, 1));
  const filled = Math.round(pct * size);
  return '█'.repeat(filled) + '─'.repeat(size - filled);
}

function createEmbed(song, totalSec, currentSec, volume) {
  const bar = makeBar(currentSec, totalSec);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;
  return new EmbedBuilder()
    .setTitle(`🎶 ${song.name}`)
    .setDescription(`${bar}\n\`${fmt(Math.floor(currentSec))}/${song.formattedDuration}\``)
    .addFields({ name:'🔊 Volume', value:`${volume}%`, inline:true })
    .setThumbnail(song.thumbnail)
    .setColor('Purple');
}

const idleTimeouts = new Map();

// Eventos DisTube
client.distube
  .on('playSong', (queue, song) => {
    clearTimeout(idleTimeouts.get(queue.id));
    idleTimeouts.delete(queue.id);

    if (!queue.textChannel) return;
    const embed = createEmbed(song, queue.duration, queue.currentTime, queue.volume);
    queue.textChannel.send({ embeds: [embed] }).then(msg => {
      const iv = setInterval(() => {
        msg.edit({
          embeds: [
            createEmbed(song, queue.duration, queue.currentTime, queue.volume)
          ]
        }).catch(() => clearInterval(iv));
      }, 5000);

      // Mantém referência para limpar depois
      idleTimeouts.set(queue.id, { iv, msg });
    });
  })
  .on('finish', queue => {
    const ref = idleTimeouts.get(queue.id);
    if (ref) {
      clearInterval(ref.iv);
      ref.msg.delete().catch(()=>{});
      idleTimeouts.delete(queue.id);
    }
    queue.textChannel?.send('✅ Fim da fila!');
    scheduleLeave(queue);
  })
  .on('addSong', (queue, song) => {
    queue.textChannel?.send(`➕ Adicionada à fila: **${song.name}**`);
  })
  .on('error', (queue, e) => {
    if (queue?.textChannel) queue.textChannel.send(`❌ Erro: ${e.message}`);
    else console.error(e);
  });

// Sai se a voz esvaziar
client.on('voiceStateUpdate', (oldState, newState) => {
  const queue = client.distube.getQueue(
    oldState.guild.id ?? newState.guild.id
  );
  if (!queue) return;
  const vc = queue.voice.channel;
  const humans = vc.members.filter(m => !m.user.bot);
  if (humans.size === 0) scheduleLeave(queue);
  else {
    const ref = idleTimeouts.get(queue.id);
    if (ref) {
      clearTimeout(ref.timeout);
      idleTimeouts.delete(queue.id);
    }
  }
});

function scheduleLeave(queue) {
  const ref = idleTimeouts.get(queue.id);
  if (ref) clearTimeout(ref.timeout);

  const timeout = setTimeout(() => {
    client.distube.voices.leave(queue.voice.channel);
    queue.textChannel?.send('🔚 Saindo por ausência de usuários.');
    idleTimeouts.delete(queue.id);
  }, 30000);

  idleTimeouts.set(queue.id, { timeout });
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
    console.error('❌ Erro no comando:', err);
    const rep = {
      content: '❌ Ocorreu um erro',
      flags: 1 << 6
    };
    i.replied ? i.followUp(rep) : i.reply(rep);
  }
});

client.login(process.env.TOKEN);
