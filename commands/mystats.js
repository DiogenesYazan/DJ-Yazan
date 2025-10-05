const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mystats')
    .setDescription('📊 Veja suas estatísticas musicais do mês')
    .addUserOption(option =>
      option.setName('usuário')
        .setDescription('Usuário para ver estatísticas (deixe vazio para ver as suas)')
        .setRequired(false)),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    const targetUser = interaction.options.getUser('usuário') || interaction.user;
    const guildId = interaction.guild.id;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    // Busca dados do usuário
    const leaderboardData = await db.get(`leaderboard_${guildId}_${monthKey}`) || {};
    const userData = leaderboardData[targetUser.id];
    
    if (!userData || (userData.songs === 0 && userData.time === 0)) {
      return interaction.editReply({
        content: targetUser.id === interaction.user.id 
          ? '📊 Você ainda não tem estatísticas neste mês! Comece a ouvir música!'
          : `📊 ${targetUser.username} ainda não tem estatísticas neste mês!`,
        ephemeral: true
      });
    }
    
    // Calcula posição no ranking
    const allUsers = Object.entries(leaderboardData)
      .map(([userId, data]) => ({
        userId,
        songs: data.songs || 0,
        time: data.time || 0,
        score: (data.songs * 10) + (data.time / 60000)
      }))
      .sort((a, b) => b.score - a.score);
    
    const position = allUsers.findIndex(u => u.userId === targetUser.id) + 1;
    const totalUsers = allUsers.length;
    
    // Calcula percentil
    const percentil = Math.round((1 - (position / totalUsers)) * 100);
    
    // Média por dia
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const currentDay = new Date().getDate();
    const avgSongsPerDay = (userData.songs / currentDay).toFixed(1);
    const avgTimePerDay = formatTime(userData.time / currentDay);
    
    const embed = new EmbedBuilder()
      .setColor('#FF69B4')
      .setTitle(`🎵 Estatísticas Musicais - ${targetUser.username}`)
      .setDescription(`Estatísticas de **${getMonthName(currentMonth)} ${currentYear}**`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        {
          name: '🏆 Ranking',
          value: 
            `**Posição:** #${position} de ${totalUsers}\n` +
            `**Percentil:** Top ${percentil}%\n` +
            `**Pontuação:** ${Math.floor(allUsers[position - 1].score)} pts`,
          inline: true
        },
        {
          name: '🎵 Músicas',
          value: 
            `**Total:** ${userData.songs} músicas\n` +
            `**Média/dia:** ${avgSongsPerDay} músicas\n` +
            `**Projeção:** ${Math.floor(userData.songs / currentDay * daysInMonth)} músicas`,
          inline: true
        },
        {
          name: '⏱️ Tempo',
          value: 
            `**Total:** ${formatTime(userData.time)}\n` +
            `**Média/dia:** ${avgTimePerDay}\n` +
            `**Projeção:** ${formatTime((userData.time / currentDay) * daysInMonth)}`,
          inline: true
        }
      )
      .addFields({
        name: '📅 Período',
        value: 
          `**Mês:** ${getMonthName(currentMonth)} ${currentYear}\n` +
          `**Dia atual:** ${currentDay}/${daysInMonth}\n` +
          `**Última música:** ${userData.lastPlayed ? new Date(userData.lastPlayed).toLocaleDateString('pt-BR') : 'N/A'}`,
        inline: false
      });
    
    // Adiciona mensagens motivacionais baseadas na posição
    let motivationalMsg = '';
    if (position === 1) {
      motivationalMsg = '👑 **Você é o #1!** Continue dominando o ranking!';
    } else if (position <= 3) {
      motivationalMsg = '🥉 **Top 3!** Você está entre os melhores!';
    } else if (position <= 10) {
      motivationalMsg = '⭐ **Top 10!** Continue assim!';
    } else if (percentil >= 75) {
      motivationalMsg = '🔥 **Top 25%!** Você está indo muito bem!';
    } else if (percentil >= 50) {
      motivationalMsg = '💪 **Acima da média!** Continue ouvindo!';
    } else {
      motivationalMsg = '🎧 **Continue ouvindo!** Você pode subir no ranking!';
    }
    
    embed.addFields({
      name: '💬 Motivação',
      value: motivationalMsg,
      inline: false
    });
    
    embed.setFooter({ 
      text: `${userData.songs} músicas • ${formatTime(userData.time)} • #${position}/${totalUsers}` 
    });
    embed.setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  }
};

function formatTime(ms) {
  if (!ms || ms <= 0) return '0s';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function getMonthName(month) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month];
}
