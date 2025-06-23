const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausa a música que está tocando'),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.guild) return interaction.editReply('Somente em servidores.');

    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    if (!player || !player.isPlaying) {
      return interaction.editReply('❗ Nada está tocando!');
    }

    await player.setPause(true);
    return interaction.editReply('⏸️ Música pausada!');
  }
};
