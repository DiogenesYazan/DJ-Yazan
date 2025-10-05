const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('🔍 Procurar e escolher uma música')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Nome da música ou artista')
        .setRequired(true)),
  
  async execute(interaction) {
    const query = interaction.options.getString('query');
    
    await interaction.deferReply();
    
    // Verifica se está em canal de voz
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const vc = member.voice.channel;
    if (!vc) {
      return interaction.editReply({
        content: '❌ Você precisa estar em um canal de voz!',
        ephemeral: true
      });
    }
    
    // Cria ou recupera player
    let player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    if (!player) {
      player = await interaction.client.lavalink.createPlayer({
        guildId: interaction.guild.id,
        voiceChannelId: vc.id,
        textChannelId: interaction.channel.id,
        selfDeaf: true,
        volume: 100
      });
    }
    
    if (!player.connected) await player.connect();
    
    try {
      const results = await player.search({ query, source: 'youtube' }, interaction.user);
      
      if (!results || !results.tracks || results.tracks.length === 0) {
        return interaction.editReply({
          content: '❌ Nenhuma música encontrada!',
          ephemeral: true
        });
      }
      
      const tracks = results.tracks.slice(0, 10);
      
      const options = tracks.map((track, index) => 
        new StringSelectMenuOptionBuilder()
          .setLabel(track.info.title.substring(0, 100))
          .setDescription(`${track.info.author.substring(0, 50)} - ${formatTime(track.info.duration || track.info.length)}`)
          .setValue(index.toString())
      );
      
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('search_select')
        .setPlaceholder('Selecione uma música')
        .addOptions(options);
      
      const row = new ActionRowBuilder().addComponents(selectMenu);
      
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('🔍 Resultados da Pesquisa')
        .setDescription(tracks.map((track, i) => 
          `**${i + 1}.** [${track.info.title}](${track.info.uri})\n` +
          `👤 ${track.info.author} | ⏱️ ${formatTime(track.info.duration || track.info.length)}`
        ).join('\n\n'))
        .setFooter({ text: 'Selecione uma música no menu abaixo' });
      
      const response = await interaction.editReply({
        embeds: [embed],
        components: [row]
      });
      
      const collector = response.createMessageComponentCollector({ time: 60000 });
      
      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: '❌ Esta pesquisa não é sua!',
            ephemeral: true
          });
        }
        
        const selectedIndex = parseInt(i.values[0]);
        const selectedTrack = tracks[selectedIndex];
        
        if (!player.connected) await player.connect();
        
        player.queue.add(selectedTrack);
        
        if (!player.playing) await player.play();
        
        await i.update({
          content: `✅ Adicionada: **${selectedTrack.info.title}**`,
          embeds: [],
          components: []
        });
        
        collector.stop();
      });
      
      collector.on('end', collected => {
        if (collected.size === 0) {
          interaction.editReply({
            content: '⏱️ Tempo esgotado para seleção!',
            embeds: [],
            components: []
          }).catch(() => {});
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar músicas:', error);
      await interaction.editReply({
        content: '❌ Erro ao buscar músicas. Tente novamente!',
        ephemeral: true
      });
    }
  }
};

function formatTime(ms) {
  if (!ms || ms <= 0) return '00:00';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}
