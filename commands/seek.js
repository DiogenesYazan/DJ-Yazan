const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('⏩ Pula para um ponto específico da música')
    .addStringOption(option =>
      option.setName('tempo')
        .setDescription('Tempo em formato mm:ss ou segundos')
        .setRequired(true)),
  
  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    
    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '❌ Não há nenhuma música tocando!',
        ephemeral: true
      });
    }
    
    const track = player.queue.current;
    const timeInput = interaction.options.getString('tempo');
    
    let targetMs;
    
    // Tenta converter de mm:ss
    if (timeInput.includes(':')) {
      const [min, sec] = timeInput.split(':').map(Number);
      if (isNaN(min) || isNaN(sec)) {
        return interaction.reply({
          content: '❌ Formato inválido! Use mm:ss (ex: 1:30) ou segundos (ex: 90)',
          ephemeral: true
        });
      }
      targetMs = (min * 60 + sec) * 1000;
    } else {
      // Assume que é em segundos
      const seconds = Number(timeInput);
      if (isNaN(seconds)) {
        return interaction.reply({
          content: '❌ Tempo inválido! Use mm:ss (ex: 1:30) ou segundos (ex: 90)',
          ephemeral: true
        });
      }
      targetMs = seconds * 1000;
    }
    
    const duration = track.info.duration || track.info.length;
    
    if (targetMs > duration) {
      return interaction.reply({
        content: `❌ O tempo especificado é maior que a duração da música (${formatTime(duration)})!`,
        ephemeral: true
      });
    }
    
    if (targetMs < 0) {
      return interaction.reply({
        content: '❌ O tempo não pode ser negativo!',
        ephemeral: true
      });
    }
    
    await player.seek(targetMs);
    
    const progress = (targetMs / duration * 100).toFixed(1);
    
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('⏩ Posição Alterada')
      .setDescription(`**${track.info.title}**`)
      .addFields(
        { name: 'Novo Tempo', value: formatTime(targetMs), inline: true },
        { name: 'Duração Total', value: formatTime(duration), inline: true },
        { name: 'Progresso', value: `${progress}%`, inline: true }
      )
      .setThumbnail(track.info.artworkUrl || null)
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
