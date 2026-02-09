const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Mostra a fila de músicas'),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.guild) return interaction.editReply('Somente em servidores.');

    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    if (!player || !player.queue.tracks.length) {
      return interaction.editReply('❗ Nenhuma música na fila.');
    }

    const queue = player.queue.tracks;
    const embed = new EmbedBuilder()
      .setTitle('📜 Fila atual')
      .setDescription(queue.map((t, i) => `${i + 1}. ${t.info.title}`).join('\n'))
      .setFooter({ text: `Total: ${queue.length} músicas` });

    return interaction.editReply({ embeds: [embed] });
  }
};
