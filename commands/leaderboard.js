const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Leaderboard = require('../models/Leaderboard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('🏆 Ranking dos maiores ouvintes do mês')
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('Tipo de ranking')
        .setRequired(false)
        .addChoices(
          { name: '🎵 Músicas Pedidas', value: 'songs' },
          { name: '⏱️ Tempo Ouvido', value: 'time' },
          { name: '📊 Geral', value: 'general' }
        )),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    const guildId = interaction.guild.id;
    const tipo = interaction.options.getString('tipo') || 'general';
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    // Busca dados do mês atual no MongoDB
    const leaderboardData = await Leaderboard.find({ 
      guildId, 
      month: monthKey 
    });
    
    if (leaderboardData.length === 0) {
      return interaction.editReply({
        content: '📊 Nenhum dado registrado neste mês ainda! Comece a ouvir músicas para aparecer no ranking!',
        ephemeral: true
      });
    }
    
    // Converte para array (formato já compatível com lógica abaixo, ajustando nomes se precisar)
    const users = leaderboardData.map(data => ({
      userId: data.userId,
      songs: data.songs || 0,
      time: data.time || 0,
      lastPlayed: data.lastPlayed || null
    }));
    
    // Define ordenação baseada no tipo
    let sortedUsers;
    let title;
    let description;
    
    if (tipo === 'songs') {
      sortedUsers = users.sort((a, b) => b.songs - a.songs).slice(0, 10);
      title = '🎵 Top 10 - Músicas Pedidas';
      description = 'Usuários que mais adicionaram músicas este mês';
    } else if (tipo === 'time') {
      sortedUsers = users.sort((a, b) => b.time - a.time).slice(0, 10);
      title = '⏱️ Top 10 - Tempo Ouvido';
      description = 'Usuários que mais ouviram música este mês';
    } else {
      // Ranking geral (pontuação combinada)
      sortedUsers = users
        .map(u => ({
          ...u,
          score: (u.songs * 10) + (u.time / 60000) // 10 pontos por música + 1 ponto por minuto
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      title = '🏆 Top 10 - Ranking Geral';
      description = 'Os maiores ouvintes do mês';
    }
    
    // Monta o embed
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(title)
      .setDescription(description)
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setFooter({ 
        text: `${getMonthName(currentMonth)} ${currentYear} • ${users.length} participantes` 
      })
      .setTimestamp();
    
    // Adiciona rankings
    if (sortedUsers.length > 0) {
      // Top 3 com destaque
      const top3 = sortedUsers.slice(0, 3);
      const medals = ['🥇', '🥈', '🥉'];
      
      for (let i = 0; i < top3.length; i++) {
        const user = top3[i];
        const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
        const username = member ? member.user.username : 'Usuário Desconhecido';
        
        let valueText = '';
        if (tipo === 'songs') {
          valueText = `**${user.songs}** músicas pedidas`;
        } else if (tipo === 'time') {
          valueText = `**${formatTime(user.time)}** de audição`;
        } else {
          valueText = `**${user.songs}** músicas • **${formatTime(user.time)}** ouvido\n` +
                     `Pontuação: **${Math.floor(user.score)}** pts`;
        }
        
        embed.addFields({
          name: `${medals[i]} ${i + 1}º Lugar - ${username}`,
          value: valueText,
          inline: false
        });
      }
      
      // Resto do top 10
      if (sortedUsers.length > 3) {
        const others = sortedUsers.slice(3);
        let othersText = '';
        
        for (let i = 0; i < others.length; i++) {
          const user = others[i];
          const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
          const username = member ? member.user.username : 'Usuário Desconhecido';
          const position = i + 4;
          
          if (tipo === 'songs') {
            othersText += `**${position}º** ${username} - ${user.songs} músicas\n`;
          } else if (tipo === 'time') {
            othersText += `**${position}º** ${username} - ${formatTime(user.time)}\n`;
          } else {
            othersText += `**${position}º** ${username} - ${user.songs} músicas • ${formatTime(user.time)}\n`;
          }
        }
        
        embed.addFields({
          name: '📋 Restante do Top 10',
          value: othersText || 'Nenhum outro participante',
          inline: false
        });
      }
      
      // Estatísticas gerais
      const totalSongs = users.reduce((acc, u) => acc + u.songs, 0);
      const totalTime = users.reduce((acc, u) => acc + u.time, 0);
      
      embed.addFields({
        name: '📊 Estatísticas do Servidor',
        value: 
          `🎵 Total de músicas: **${totalSongs}**\n` +
          `⏱️ Tempo total: **${formatTime(totalTime)}**\n` +
          `👥 Participantes: **${users.length}**\n` +
          `📅 Mês: **${getMonthName(currentMonth)}**`,
        inline: false
      });
      
      // Posição do usuário atual
      const userPosition = sortedUsers.findIndex(u => u.userId === interaction.user.id);
      if (userPosition !== -1) {
        const userData = sortedUsers[userPosition];
        embed.addFields({
          name: '🎯 Sua Posição',
          value: tipo === 'general'
            ? `**${userPosition + 1}º lugar** • ${userData.songs} músicas • ${formatTime(userData.time)} • ${Math.floor(userData.score)} pts`
            : tipo === 'songs'
            ? `**${userPosition + 1}º lugar** • ${userData.songs} músicas`
            : `**${userPosition + 1}º lugar** • ${formatTime(userData.time)}`,
          inline: false
        });
      }
    }
    
    await interaction.editReply({ embeds: [embed] });
  }
};

// Função auxiliar para formatar tempo
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

// Função para nome do mês em português
function getMonthName(month) {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month];
}
