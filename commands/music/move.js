const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('move')
    .setDescription('↔️ Move uma música para outra posição na fila')
    .addIntegerOption(option =>
      option.setName('de')
        .setDescription('Posição atual da música')
        .setRequired(true)
        .setMinValue(1))
    .addIntegerOption(option =>
      option.setName('para')
        .setDescription('Nova posição da música')
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
    
    const from = interaction.options.getInteger('de');
    const to = interaction.options.getInteger('para');
    
    if (from > player.queue.tracks.length || to > player.queue.tracks.length) {
      return interaction.reply({
        content: `❌ Posição inválida! A fila tem apenas ${player.queue.tracks.length} música(s).`,
        ephemeral: true
      });
    }
    
    if (from === to) {
      return interaction.reply({
        content: '❌ A música já está nessa posição!',
        ephemeral: true
      });
    }
    
    const track = player.queue.tracks.splice(from - 1, 1)[0];
    player.queue.tracks.splice(to - 1, 0, track);
    
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('↔️ Música Movida')
      .setDescription(`**${track.info.title}**\n👤 ${track.info.author}`)
      .addFields(
        { name: 'De', value: `Posição #${from}`, inline: true },
        { name: 'Para', value: `Posição #${to}`, inline: true }
      )
      .setThumbnail(track.info.artworkUrl || null)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
