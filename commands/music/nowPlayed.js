const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Constantes da barra de progresso (mesmo estilo do /play)
const BAR_SIZE = 12;

// Função para formatar tempo em mm:ss ou hh:mm:ss
function formatTime(ms) {
  if (!ms || ms <= 0 || isNaN(ms)) return '0:00';
  
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// Barra de progresso moderna estilo Hydra/Jockie
function makeProgressBar(current, total) {
  if (!total || total <= 0 || isNaN(total)) {
    return '▬▬▬🔴▬▬▬▬▬▬▬▬ LIVE';
  }
  
  const progress = Math.min(current / total, 1);
  const filledBars = Math.round(progress * BAR_SIZE);
  
  const filled = '▰'.repeat(filledBars);
  const empty = '▱'.repeat(BAR_SIZE - filledBars);
  return filled + '⚪' + empty;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplayed')
    .setDescription('Mostra a música que está tocando agora'),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.guild) return interaction.editReply('Somente em servidores.');

    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    if (!player || !player.queue.current) {
      return interaction.editReply('❌ Não há nada tocando no momento.');
    }

    const track = player.queue.current;
    const vol = player.volume;
    const currentTime = player.position;
    const duration = track.info.length || track.info.duration || 0;
    
    // Status atual
    const statusIcon = player.paused ? '⏸️' : '▶️';
    const statusText = player.paused ? 'Pausado' : 'Tocando';
    
    // Barra de progresso
    const progressBar = makeProgressBar(currentTime, duration);
    
    // Tempo formatado
    const timeDisplay = duration > 0 
      ? `\`${formatTime(currentTime)}\` ${progressBar} \`${formatTime(duration)}\``
      : `\`${formatTime(currentTime)}\` ${progressBar}`;
    
    // Informações do requester
    const requester = track.requester;
    const requesterText = requester ? `<@${requester.id}>` : 'Autoplay';
    
    // Próxima música na fila
    const nextTrack = player.queue.tracks[0];
    const nextText = nextTrack 
      ? `[${nextTrack.info.title.slice(0, 40)}${nextTrack.info.title.length > 40 ? '...' : ''}](${nextTrack.info.uri})`
      : 'Nenhuma';
    
    // Loop mode
    const loopMode = player.repeatMode || 'off';
    const loopIcons = { off: '➡️', track: '🔂', queue: '🔁' };
    const loopText = { off: 'Desativado', track: 'Música', queue: 'Fila' };
    
    // Volume icon dinâmico
    const volIcon = vol === 0 ? '🔇' : vol < 30 ? '🔈' : vol < 70 ? '🔉' : '🔊';
    
    // Cor do embed baseada no status
    const embedColor = player.paused ? 0xFFA500 : 0x5865F2;
    
    const embed = new EmbedBuilder()
      .setAuthor({ 
        name: `${statusIcon} ${statusText}`, 
        iconURL: 'https://cdn.discordapp.com/emojis/1055188868453359616.gif'
      })
      .setTitle(track.info.title)
      .setURL(track.info.uri)
      .setDescription(timeDisplay)
      .addFields(
        { name: '👤 Artista', value: track.info.author || 'Desconhecido', inline: true },
        { name: '🎧 Pedido por', value: requesterText, inline: true },
        { name: `${volIcon} Volume`, value: `${vol}%`, inline: true },
        { name: `${loopIcons[loopMode]} Loop`, value: loopText[loopMode], inline: true },
        { name: '📋 Na Fila', value: `${player.queue.tracks.length} música(s)`, inline: true },
        { name: '⏭️ Próxima', value: nextText, inline: true }
      )
      .setThumbnail(track.info.artworkUrl || null)
      .setColor(embedColor)
      .setFooter({ text: `🎵 DJ Yazan • Qualidade: Alta` })
      .setTimestamp();
    
    // Adiciona imagem grande se for do YouTube
    if (track.info.artworkUrl && track.info.sourceName === 'youtube') {
      const videoId = track.info.identifier;
      const highResThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      embed.setImage(highResThumbnail);
    }

    return interaction.editReply({ embeds: [embed] });
  }
};
