const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Constantes da barra de progresso (mesmo estilo do /play)
const BAR_SIZE = 12;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('controller')
    .setDescription('🎮 Painel de controle interativo da música atual'),
  
  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    
    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '❌ Não há nenhuma música tocando no momento!',
        ephemeral: true
      });
    }
    
    const track = player.queue.current;
    const currentTime = player.position;
    const duration = track.info.duration || track.info.length;
    const vol = player.volume;
    
    // Status atual
    const statusIcon = player.paused ? '⏸️' : '▶️';
    const statusText = player.paused ? 'Pausado' : 'Tocando';
    
    // Barra de progresso moderna
    const progressBar = createProgressBar(currentTime, duration);
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
    const loopMode = interaction.client.loopModes?.get(interaction.guild.id) || 'off';
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
    
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('controller_pause')
          .setLabel(player.paused ? '▶️ Play' : '⏸️ Pause')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('controller_skip')
          .setLabel('⏭️ Skip')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('controller_stop')
          .setLabel('⏹️ Stop')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('controller_shuffle')
          .setLabel('🔀 Shuffle')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(player.queue.tracks.length < 2),
        new ButtonBuilder()
          .setCustomId('controller_loop')
          .setLabel('🔁 Loop')
          .setStyle(ButtonStyle.Secondary)
      );
    
    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('controller_volume_down')
          .setLabel('🔉 -10%')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('controller_volume_up')
          .setLabel('🔊 +10%')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('controller_queue')
          .setLabel('📋 Fila')
          .setStyle(ButtonStyle.Secondary)
      );
    
    await interaction.reply({
      embeds: [embed],
      components: [row1, row2]
    });
  }
};

// Barra de progresso moderna estilo Hydra/Jockie
function createProgressBar(current, total) {
  if (!total || total <= 0 || isNaN(total)) {
    return '▬▬▬🔴▬▬▬▬▬▬▬▬ LIVE';
  }
  
  const progress = Math.min(current / total, 1);
  const filledBars = Math.round(progress * BAR_SIZE);
  
  const filled = '▰'.repeat(filledBars);
  const empty = '▱'.repeat(BAR_SIZE - filledBars);
  return filled + '⚪' + empty;
}

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
