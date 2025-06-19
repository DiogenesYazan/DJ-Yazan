// commands/play.js
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
      return await interaction.reply({
        content: '🎤 Entre em um canal de voz primeiro!',
        ephemeral: true
      });
    }

    await interaction.reply(`🔍 Procurando: **${query}**...`);
    try {
      await interaction.client.distube.play(vc, query, {
        member: interaction.member,
        textChannel: interaction.channel
      });
    } catch (err) {
      console.error(err);
      await interaction.followUp({ content: `❌ Erro: ${err.message}`, ephemeral: true });
    }
  }
};
