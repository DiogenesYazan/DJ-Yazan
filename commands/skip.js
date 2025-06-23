const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pula para a próxima música na fila'),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.guild) return interaction.editReply('Somente em servidores.');

    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    if (!player || !player.queue.tracks.length) {
      return interaction.editReply('❗ Nada na fila para pular!');
    }

    await player.skip(1, false); // pula com throwError=false para não falhar no fim :contentReference[oaicite:3]{index=3}

    return interaction.editReply('⏭️ Música pulada!');
  }
};
