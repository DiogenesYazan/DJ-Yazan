// commands/ping.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Verifica a latência do bot e informações do sistema'),
  async execute(interaction) {
    // envia resposta inicial e aguarda pelo objeto Message
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });

    const roundTrip = sent.createdTimestamp - interaction.createdTimestamp;
    const wsLatency = Math.round(interaction.client.ws.ping);
    
    // Informações do sistema
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const guildCount = interaction.client.guilds.cache.size;
    const userCount = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    
    // Formatação do tempo de atividade
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const minutes = Math.floor(uptime / 60) % 60;
    const seconds = Math.floor(uptime % 60);
    
    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    
    // Status de latência
    let latencyStatus = '🟢 Excelente';
    if (wsLatency > 100) latencyStatus = '🟡 Boa';
    if (wsLatency > 200) latencyStatus = '🟠 Moderada';
    if (wsLatency > 500) latencyStatus = '🔴 Alta';
    
    // Verifica se há música tocando
    const player = interaction.client.lavalink?.getPlayer(interaction.guildId);
    const musicStatus = player && player.queue.current 
      ? `� Tocando: ${player.queue.current.info.title.substring(0, 30)}${player.queue.current.info.title.length > 30 ? '...' : ''}` 
      : '💤 Nenhuma música tocando';

    const embed = new EmbedBuilder()
      .setTitle('�🏓 Pong! Status do Bot')
      .setColor(wsLatency < 100 ? 'Green' : wsLatency < 200 ? 'Yellow' : wsLatency < 500 ? 'Orange' : 'Red')
      .addFields(
        { 
          name: '📡 Latência WebSocket', 
          value: `${wsLatency}ms ${latencyStatus}`, 
          inline: true 
        },
        { 
          name: '⏱️ Round-trip', 
          value: `${roundTrip}ms`, 
          inline: true 
        },
        { 
          name: '⏰ Tempo Online', 
          value: uptimeString, 
          inline: true 
        },
        { 
          name: '🏠 Servidores', 
          value: guildCount.toString(), 
          inline: true 
        },
        { 
          name: '👥 Usuários', 
          value: userCount.toLocaleString(), 
          inline: true 
        },
        { 
          name: '💾 Uso de RAM', 
          value: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`, 
          inline: true 
        },
        { 
          name: '🎶 Status Musical', 
          value: musicStatus, 
          inline: false 
        }
      )
      .setTimestamp()
      .setFooter({ 
        text: `Node.js ${process.version} • Discord.js v${require('discord.js').version}`,
        iconURL: interaction.client.user.displayAvatarURL()
      });

    await interaction.editReply({ content: null, embeds: [embed] });
  },
};
