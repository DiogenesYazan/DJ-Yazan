const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function makeBar(current, total, size = 20) {
  if (!total || total <= 0 || isNaN(total)) {
    return '█'.repeat(size); // Barra cheia se não tiver duração
  }
  const filled = Math.round((current / total) * size);
  return '█'.repeat(filled) + '─'.repeat(size - filled);
}

function fmt(ms) {
  if (!ms || ms <= 0 || isNaN(ms)) return '00:00';
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
    const total = track.info.length || track.info.duration || 0;
    
    // Se não conseguir obter duração, tenta outras propriedades
    const duration = total || player?.queue?.current?.info?.length || 0;
    
    const bar = makeBar(current, duration);
    const timeDisplay = duration > 0 
      ? `${fmt(current)}/${fmt(duration)}`
      : `${fmt(current)}/∞`; // Para streams ao vivo

    const embed = new EmbedBuilder()
      .setTitle('🎵 Now Playing')
      .setDescription(`${bar}\n\`${timeDisplay}\`\n**${track.info.title}**\n🎨 **Artista:** ${track.info.author}\n🔊 **Volume:** ${vol}%`)
      .setURL(track.info.uri)
      .setThumbnail(track.info.artworkUrl || null) // Thumbnail da música
      .setImage('https://i.imgur.com/DvyUJKA.gif') // GIF do disco girando
      .setColor('Purple');

    return interaction.editReply({ embeds: [embed] });
  }
};
