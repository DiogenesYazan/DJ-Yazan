const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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
    const position = player.position;
    const duration = track.info.duration || track.info.length;
    
    const progressBar = createProgressBar(position, duration);
    
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🎵 Tocando Agora')
      .setDescription(`**[${track.info.title}](${track.info.uri})**`)
      .addFields(
        { name: '👤 Artista', value: track.info.author, inline: true },
        { name: '⏱️ Duração', value: formatTime(duration), inline: true },
        { name: '🔊 Volume', value: `${player.volume}%`, inline: true },
        { name: '📊 Progresso', value: progressBar }
      )
      .setThumbnail(track.info.artworkUrl || null)
      .setFooter({ text: `Pedido por ${track.requester.username}` })
      .setTimestamp();
    
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

function createProgressBar(position, duration) {
  const progress = Math.min(position / duration, 1);
  const barLength = 20;
  const filled = Math.round(barLength * progress);
  const empty = barLength - filled;
  
  const bar = '▬'.repeat(filled) + '🔘' + '▬'.repeat(empty);
  const current = formatTime(position);
  const total = formatTime(duration);
  
  return `${current} ${bar} ${total}`;
}

function formatTime(ms) {
  if (!ms || ms <= 0) return '00:00';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}
