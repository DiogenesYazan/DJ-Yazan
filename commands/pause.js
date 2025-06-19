const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausa a música que está tocando'),
  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    if (!queue || !queue.playing) {
      return interaction.reply({ content: '❗ Nada está tocando!', ephemeral: true });
    }
    queue.pause();
    interaction.reply('⏸️ Música pausada!');
  }
};
