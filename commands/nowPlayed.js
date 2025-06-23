const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function makeBar(current, total, size = 20) {
  const filled = Math.round((current / total) * size);
  return '█'.repeat(filled) + '─'.repeat(size - filled);
}
function fmt(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplayed')
    .setDescription('Mostra a música que está tocando agora'),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.guild) return interaction.editReply('Somente em servidores.');

    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    if (!player || !player.queue.current) {
      return interaction.editReply('❌ Não há nada tocando no momento.');
    }

    const track = player.queue.current;
    const vol = player.volume;
    const current = player.position;
    const total = track.info.length;
    const bar = makeBar(current, total);

    const embed = new EmbedBuilder()
      .setTitle('🎵 Now Playing')
      .setDescription(`${bar}\n\`${fmt(current)}/${fmt(total)}\`\n**${track.info.title}**\nVolume: **${vol}%**`)
      .setURL(track.info.uri)
      .setThumbnail(track.info.artworkUrl || null)
      .setColor('Purple');

    return interaction.editReply({ embeds: [embed] });
  }
};
