const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('🧹 Limpa toda a fila de músicas'),
  
  async execute(interaction) {
    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    
    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '❌ Não há nenhuma música tocando!',
        ephemeral: true
      });
    }
    
    if (player.queue.tracks.length === 0) {
      return interaction.reply({
        content: '❌ A fila já está vazia!',
        ephemeral: true
      });
    }
    
    const count = player.queue.tracks.length;
    player.queue.tracks = [];
    
    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🧹 Fila Limpa')
      .setDescription(`✅ ${count} música(s) foram removidas da fila!`)
      .setFooter({ text: 'A música atual continua tocando' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
