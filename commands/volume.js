const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Define o volume (1–200%)')
    .addIntegerOption(o => o.setName('amount').setDescription('Volume').setMinValue(1).setMaxValue(200).setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();
    if (!interaction.guild) return interaction.editReply('Somente em servidores.');

    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    if (!player) return interaction.editReply('❗ Nada está tocando.');

    const vol = interaction.options.getInteger('amount');
    await player.setVolume(vol);
    return interaction.editReply(`🔊 Volume ajustado para ${vol}%`);
  }
};
