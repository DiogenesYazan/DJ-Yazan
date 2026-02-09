const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Adiciona música à fila — sem reiniciar a atual')
    .addStringOption(o =>
      o.setName('query')
       .setDescription('Nome ou link da música')
       .setRequired(true)
    ),

  async execute(i) {
    await i.deferReply();
    if (!i.guild) return i.editReply('❌ Use em servidor.');

    // canal de voz do autor
    const member  = await i.guild.members.fetch(i.user.id);
    const vc      = member.voice.channel;
    if (!vc) return i.editReply('🎤 Entre num canal de voz.');

    // cria ou recupera player
    const guildId = i.guild.id;
    let player = i.client.lavalink.getPlayer(guildId) ||
                 await i.client.lavalink.createPlayer({
                    guildId,
                    voiceChannelId: vc.id,
                    textChannelId: i.channel.id
                 });
    if (!player.connected) await player.connect();

    // busca a música
    const query = i.options.getString('query');
    const res   = await player.search({ query, source: 'youtube' }, i.user);
    if (!res.tracks.length) return i.editReply('🔍 Nada encontrado.');

    const track = res.tracks[0];

    // ----------- Fila nativa -----------
    // se já existe uma música tocando, só adiciona;
    // se não há nada tocando, adiciona e dá play.
    if (player.queue.current) {
      await player.queue.add(track);
      return i.editReply(`✅ Adicionado à fila: **${track.info.title}**`);
    } else {
      await player.queue.add(track);   // primeiro põe na fila
      await player.play();             // recebe e toca a 1ª da fila
      return i.editReply(`🎶 Tocando agora: **${track.info.title}**`);
    }
  }
};
