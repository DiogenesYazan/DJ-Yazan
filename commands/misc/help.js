const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📚 Mostra todos os comandos disponíveis'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle('🎧 DJ-Yazan - Comandos Profissionais')
      .setDescription('Bot de música e quiz completo!\nUse `/help` para ver a lista.')
      .addFields(
        {
          name: '🎵 Música',
          value: 
            '`/play <música>` - Toca música ou playlist\n' +
            '`/search <música>` - Pesquisa para escolher\n' +
            '`/playlist <artista>` - Toca top músicas do artista\n' +
            '`/stop` - Para tudo e desconecta (Música e Quiz)',
          inline: false
        },
        {
          name: '🎮 Games',
          value: 
            '`/quiz start <rounds>` - Inicia o Music Quiz!',
          inline: false
        },
        {
          name: '🎛️ Controles',
          value: 
            '`/pause` - Pausa/Resume\n' +
            '`/skip` - Pula música\n' +
            '`/volume <0-200>` - Ajusta volume\n' +
            '`/loop <modo>` - Loop track/queue\n' +
            '`/seek <tempo>` - Pula para mm:ss\n' +
            '`/filter <tipo>` - Efeitos (8d, nightcore...)',
          inline: false
        },
        {
          name: '📋 Fila',
          value: 
            '`/queue` - Vê a fila\n' +
            '`/shuffle` - Embaralha\n' +
            '`/remove <pos>` - Remove item\n' +
            '`/clear` - Limpa fila',
          inline: false
        },
        {
          name: '⚙️ Outros',
          value: 
            '`/247` - Alterna modo 24/7\n' +
            '`/leaderboard` - Ranking do servidor\n' +
            '`/mystats` - Seus stats\n' +
            '`/ping` - Latência',
          inline: false
        }
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: 'DJ Yazan • O melhor bot de música' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
