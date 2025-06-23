// commands/playlist.js
const { SlashCommandBuilder } = require('discord.js');
const yts = require('yt-search');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist')
    .setDescription('Toca até 25 músicas de um artista no YouTube')
    .addStringOption(opt =>
      opt.setName('artist')
         .setDescription('Nome do artista')
         .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    if (!interaction.guild) {
      return interaction.editReply('❌ Este comando só funciona em servidores.');
    }

    // 1) Verifica canal de voz
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const vc     = member.voice.channel;
    if (!vc) {
      return interaction.editReply('🎤 Entre em um canal de voz primeiro!');
    }

    // 2) Obtém ou cria o player Lavalink
    const guildId = interaction.guild.id;
    let player = interaction.client.lavalink.getPlayer(guildId);
    if (!player) {
      player = await interaction.client.lavalink.createPlayer({
        guildId,
        voiceChannelId: vc.id,
        textChannelId: interaction.channel.id
      });
    }
    if (!player.connected) {
      await player.connect();
    }

    const artist = interaction.options.getString('artist');
    await interaction.editReply(`🔍 Buscando as 25 músicas mais populares de **${artist}**...`);

    try {
      // 3) Pesquisa no YouTube com yt-search
      const { videos } = await yts(artist);
      const top25 = videos.slice(0, 25);
      if (top25.length === 0) {
        return interaction.followUp(`❌ Não encontrei músicas para **${artist}**.`);
      }

      // 4) Para cada vídeo, usa player.search para obter e enfileirar
      for (const video of top25) {
        const url = `https://www.youtube.com/watch?v=${video.videoId}`;
        // player.search usa o endpoint interno de loadTracks do manager :contentReference[oaicite:0]{index=0}
        const res = await player.search({ query: url, source: 'youtube' }, interaction.user);
        if (res.tracks.length) {
          player.queue.add(...res.tracks);
        }
      }

      // 5) Se não estiver tocando, inicia reprodução
      if (!player.isPlaying) {
        await player.play();
      }

      return interaction.followUp(
        `▶️ Playlist iniciada com ${top25.length} faixas de **${artist}**!`
      );
    } catch (error) {
      console.error('Erro ao buscar playlist:', error);
      return interaction.followUp(`❌ Ocorreu um erro: ${error.message}`);
    }
  }
};
