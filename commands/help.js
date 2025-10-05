const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📚 Mostra todos os comandos disponíveis'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🎧 DJ-Yazan - Comandos Profissionais')
      .setDescription('Bot de música completo para Discord!\n\nUse `/help <comando>` para ajuda detalhada')
      .addFields(
        {
          name: '🎵 Reprodução',
          value: 
            '`/play <música>` - Adiciona música à fila\n' +
            '`/search <música>` - Busca e escolhe música\n' +
            '`/playlist <artista>` - Toca playlist do artista\n' +
            '`/nowplayed` - Mostra música atual',
          inline: false
        },
        {
          name: '🎛️ Controle Interativo',
          value: 
            '`/controller` - Painel com botões interativos\n' +
            '`/pause` - Pausa/retoma reprodução\n' +
            '`/skip` - Pula para próxima música\n' +
            '`/jump <posição>` - Pula para música específica\n' +
            '`/stop` - Para e limpa tudo',
          inline: false
        },
        {
          name: '� Organização da Fila',
          value: 
            '`/queue` - Mostra fila completa\n' +
            '`/shuffle` - Embaralha a fila\n' +
            '`/remove <posição>` - Remove música\n' +
            '`/clear` - Limpa toda a fila\n' +
            '`/move <de> <para>` - Move música',
          inline: false
        },
        {
          name: '�️ Efeitos e Volume',
          value: 
            '`/volume <1-200>` - Ajusta volume\n' +
            '`/filter <tipo>` - 10+ efeitos de áudio\n' +
            '`/seek <tempo>` - Pula para ponto específico\n' +
            '`/loop <modo>` - Loop off/queue/track',
          inline: false
        },
        {
          name: '⚙️ Configurações',
          value: 
            '`/247` - Modo 24/7 (bot permanece)\n' +
            '`/leaderboard` - 🏆 Ranking mensal do servidor\n' +
            '`/mystats` - 📊 Suas estatísticas pessoais\n' +
            '`/stats` - Estatísticas do bot\n' +
            '`/about` - Informações do bot\n' +
            '`/ping` - Latência e status',
          inline: false
        }
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: '4 servidores • 75 usuários • Hoje às 04:59' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
