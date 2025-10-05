const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('🗑️ Remove uma música específica da fila')
    .addIntegerOption(option =>
      option.setName('posição')
        .setDescription('Posição da música na fila (1, 2, 3...)')
        .setRequired(true)
        .setMinValue(1)),
  
  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    
    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '❌ Não há nenhuma música tocando!',
        ephemeral: true
      });
    }
    
    const position = interaction.options.getInteger('posição');
    
    if (position > player.queue.tracks.length) {
      return interaction.reply({
        content: `❌ Posição inválida! A fila tem apenas ${player.queue.tracks.length} música(s).`,
        ephemeral: true
      });
    }
    
    const removed = player.queue.tracks[position - 1];
    player.queue.tracks.splice(position - 1, 1);
    
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🗑️ Música Removida')
      .setDescription(`**${removed.info.title}**\n👤 ${removed.info.author}`)
      .addFields(
        { name: 'Posição', value: `#${position}`, inline: true },
        { name: 'Duração', value: formatTime(removed.info.duration || removed.info.length), inline: true }
      )
      .setThumbnail(removed.info.artworkUrl || null)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};

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
