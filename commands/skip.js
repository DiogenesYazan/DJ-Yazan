const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pula para a próxima música na fila'),
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    if (!queue || queue.songs.length <= 1) {
      return interaction.reply({ content: '❗ Não há próxima música!', ephemeral: true });
    }
    await queue.skip();
    interaction.reply('⏭️ Música pulada!');
  }
};
