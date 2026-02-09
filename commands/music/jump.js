const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('⏩ Pula para uma música específica na fila')
    .addIntegerOption(option =>
      option.setName('posição')
        .setDescription('Posição da música na fila')
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
    
    // Remove todas as músicas antes da posição desejada
    const skipped = position - 1;
    player.queue.tracks.splice(0, skipped);
    
    // Pula para a próxima (que agora é a primeira da fila)
    await player.skip();
    
    const nextTrack = player.queue.current;
    
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('⏩ Pulando para Música')
      .setDescription(`**${nextTrack.info.title}**\n👤 ${nextTrack.info.author}`)
      .addFields(
        { name: 'Músicas Puladas', value: `${skipped}`, inline: true },
        { name: 'Restantes na Fila', value: `${player.queue.tracks.length}`, inline: true }
      )
      .setThumbnail(nextTrack.info.artworkUrl || null)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
