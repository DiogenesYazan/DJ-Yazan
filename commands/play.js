const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Toca música do YouTube pelo nome ou link')
    .addStringOption(opt =>
      opt.setName('query')
         .setDescription('Nome ou URL da música')
         .setRequired(true)
    ),
  async execute(interaction) {
    const query = interaction.options.getString('query');
    const vc = interaction.member.voice.channel;
    if (!vc) {
      return interaction.reply({ content: '❗ Você precisa estar em um canal de voz!', ephemeral: true });
    }
    await interaction.reply(`🔍 Tocando: **${query}**`);
    interaction.client.distube.play(vc, query, {
      member: interaction.member,
      textChannel: interaction.channel
    });
  }
};
