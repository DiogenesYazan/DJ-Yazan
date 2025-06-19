// commands/playlist.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Toca até 25 músicas de um artista no YouTube')
    .addStringOption(opt =>
      opt.setName('artista')
         .setDescription('Nome do artista')
         .setRequired(true)
    ),

  async execute(interaction) {
    const artista = interaction.options.getString('artista');
    const vc = interaction.member.voice.channel;
    if (!vc) {
      return interaction.reply({ content: '🎤 Entre num canal de voz primeiro!', ephemeral: true });
    }

    await interaction.reply(`🔍 Buscando até 25 músicas de **${artista}**...`);

    try {
      const yt = interaction.client.distube.plugins.find(p => p.constructor.name === 'YouTubePlugin');
      const results = await yt.search(artista, { type: 'video', limit: 25 });

      if (!results.length) {
        return interaction.followUp(`❌ Não encontrei músicas para **${artista}**.`);
      }

      const urls = results.map(v => v.url);
      // Cria uma playlist personalizada
      const playlist = await interaction.client.distube.createCustomPlaylist(urls, {
        member: interaction.member,
        metadata: { name: `Top músicas de ${artista}` }
      });
      // Toca a playlist completa
      await interaction.client.distube.play(vc, playlist, {
        member: interaction.member,
        textChannel: interaction.channel
      });

      return interaction.followUp(`▶️ Playlist criada com ${urls.length} músicas de **${artista}**!`);
    } catch (e) {
      console.error(e);
      return interaction.followUp({ content: `❌ Erro: ${e.message}`, ephemeral: true });
    }
  }
};
