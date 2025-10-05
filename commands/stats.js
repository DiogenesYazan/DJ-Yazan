const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('📊 Estatísticas detalhadas do bot'),
  
  async execute(interaction) {
    const client = interaction.client;
    
    // Uptime
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    
    // Memória
    const memoryUsage = process.memoryUsage();
    const memoryMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);
    const memoryTotal = (memoryUsage.heapTotal / 1024 / 1024).toFixed(2);
    
    // Players ativos
    const players = Array.from(client.lavalink.players.values());
    const playingPlayers = players.filter(p => p.playing).length;
    
    // Nós Lavalink
    const nodes = Array.from(client.lavalink.nodeManager.nodes.values());
    const connectedNodes = nodes.filter(n => n.connected).length;
    
    // CPU
    const cpuUsage = process.cpuUsage();
    const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2);
    
    // Sistema
    const platform = os.platform();
    const arch = os.arch();
    const nodeVersion = process.version;
    
    const embed = new EmbedBuilder()
      .setColor('#0099FF')
      .setTitle('📊 Estatísticas do Bot')
      .setDescription('Informações detalhadas sobre o desempenho e uso do bot')
      .addFields(
        { 
          name: '🤖 Bot', 
          value: `\`\`\`
Uptime: ${uptimeStr}
Ping: ${client.ws.ping}ms
Comandos: ${client.commands.size}
\`\`\``, 
          inline: false 
        },
        { 
          name: '📡 Discord', 
          value: `\`\`\`
Servidores: ${client.guilds.cache.size}
Usuários: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}
Canais: ${client.channels.cache.size}
\`\`\``, 
          inline: false 
        },
        { 
          name: '🎵 Música', 
          value: `\`\`\`
Players Ativos: ${players.length}
Tocando Agora: ${playingPlayers}
Nós Lavalink: ${connectedNodes}/${nodes.length}
\`\`\``, 
          inline: false 
        },
        { 
          name: '💻 Sistema', 
          value: `\`\`\`
OS: ${platform} ${arch}
Node.js: ${nodeVersion}
Memória: ${memoryMB}MB / ${memoryTotal}MB
CPU: ${cpuPercent}ms
\`\`\``, 
          inline: false 
        }
      )
      .setFooter({ text: `DJ Yazan v2.0 | Sistema: ${platform}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
