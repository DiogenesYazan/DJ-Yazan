// commands/stop.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Para a música atual e limpa a fila'),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    if (!queue) {
      return interaction.reply({ content: '🤷‍♂️ Não há nada tocando.', ephemeral: true });
    }
    await queue.stop(); // para e limpa a fila
    await interaction.reply('🛑 Música e fila paradas com sucesso!');
  }
};
