const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Define o volume (1–200%)')
    .addIntegerOption(opt =>
      opt.setName('amount')
         .setDescription('Nível de volume entre 1 e 200')
         .setRequired(true)
         .setMinValue(1)
         .setMaxValue(200)
    ),
  async execute(interaction) {
    const volume = interaction.options.getInteger('amount');
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    if (!queue) {
      return interaction.reply({ content: '❗ Nada está tocando!', ephemeral: true });
    }
    queue.setVolume(volume);
    interaction.reply(`🔊 Volume ajustado para ${volume}%`);
  }
};
