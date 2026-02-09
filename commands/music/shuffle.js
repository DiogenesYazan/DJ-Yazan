const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shuffle')
    .setDescription('🔀 Embaralha a fila de músicas'),
  
  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    
    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '❌ Não há nenhuma música tocando!',
        ephemeral: true
      });
    }
    
    if (player.queue.tracks.length < 2) {
      return interaction.reply({
        content: '❌ É necessário pelo menos 2 músicas na fila para embaralhar!',
        ephemeral: true
      });
    }
    
    // Algoritmo Fisher-Yates para embaralhar
    const tracks = [...player.queue.tracks];
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }
    
    // Limpa e adiciona embaralhado
    player.queue.tracks = tracks;
    
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🔀 Fila Embaralhada')
      .setDescription(`✅ ${tracks.length} músicas foram embaralhadas aleatoriamente!`)
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
