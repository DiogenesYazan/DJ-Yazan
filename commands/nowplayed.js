// commands/nowplayed.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function makeBar(current, total, size = 20) {
  const filled = Math.round((current / total) * size);
  return '█'.repeat(filled) + '─'.repeat(size - filled);
}
function fmt(s) {
  return `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(Math.floor(s % 60)).padStart(2,'0')}`;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplayed')
    .setDescription('Mostra a música que está tocando agora e o volume'),

  async execute(interaction) {
    const queue = interaction.client.distube.getQueue(interaction.guildId);
    if (!queue || !queue.songs?.length) {
      return interaction.reply({ content: '❌ Não há nada tocando no momento.', flags: 64 });
    }

    const song = queue.songs[0];
    const volume = queue.volume;
    const current = queue.currentTime;
    const total = song.duration;
    const bar = makeBar(current, total);

    const embed = new EmbedBuilder()
      .setTitle('🎵 Now Playing')
      .setDescription(`${bar}\n\`${fmt(current)}/${song.formattedDuration}\`\n**${song.name}**\nVolume: **${volume}%**`)
      .setURL(song.url)
      .setThumbnail(song.thumbnail)
      .setColor('Purple');

    return interaction.reply({ embeds: [embed] });
  }
};
