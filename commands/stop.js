const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Para a música atual e limpa a fila'),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.guild) return interaction.editReply('Somente em servidores.');

    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    if (!player) return interaction.editReply('🤷‍♂️ Não há nada tocando.');

    await player.stopPlaying(true, false); // limpa a fila e para sem destruir o player 【novas APIs】:contentReference[oaicite:2]{index=2}

    return interaction.editReply('🛑 Música e fila paradas com sucesso!');
  }
};
