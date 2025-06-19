const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Mostra a fila de músicas'),
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    if (!queue) {
      return interaction.reply({ content: '❗ Nenhuma música na fila.', ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setTitle('📜 Fila atual')
      .setDescription(queue.songs.map((s, i) => `${i + 1}. ${s.name}`).join('\n'))
      .setFooter({ text: `Total: ${queue.songs.length} música(s)` });
    interaction.reply({ embeds: [embed] });
  }
};
