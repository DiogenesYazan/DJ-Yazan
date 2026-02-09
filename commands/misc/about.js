const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('ℹ️ Informações sobre o bot'),
  
  async execute(interaction) {
    const client = interaction.client;
    
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('ℹ️ Sobre o DJ Yazan')
      .setDescription('DJ Yazan é um bot de música profissional para Discord, desenvolvido com as melhores tecnologias disponíveis.\n\nOferecemos uma experiência de alta qualidade com recursos avançados e interface intuitiva.')
      .addFields(
        {
          name: '✨ Recursos Principais',
          value: 
            '🎵 Reprodução de música em alta qualidade\n' +
            '🎛️ Painel de controle interativo\n' +
            '🔍 Busca avançada com seleção\n' +
            '📋 10+ filtros de áudio profissionais\n' +
            '🔀 Embaralhar e organizar fila\n' +
            '🎚️ Sistema de loop (música/fila)\n' +
            '🔒 Modo 24/7\n' +
            '📊 Estatísticas detalhadas',
          inline: false
        },
        {
          name: '🛠️ Tecnologias',
          value: 
            '✅ Discord.js: v14.20.0\n' +
            '✅ Lavalink Client: v2.5.6\n' +
            '✅ Node.js: v22.11.0\n' +
            '✅ Database: Quick.db v9.1.7',
          inline: false
        },
        {
          name: '� Estatísticas',
          value: 
            `Servidores: ${client.guilds.cache.size}\n` +
            `Usuários: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}\n` +
            `Comandos: 23\n` +
            `Ping: ${client.ws.ping}ms`,
          inline: false
        },
        {
          name: '� Diferenciais',
          value: 
            '✅ Interface profissional e moderna\n' +
            '✅ Botões e menus interativos\n' +
            '✅ Suporte a playlists do YouTube\n' +
            '✅ Filtros de áudio avançados\n' +
            '✅ Sistema de progresso em tempo real\n' +
            '✅ Atualizações constantes',
          inline: false
        }
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({ text: 'Desenvolvido com ❤️ | Versão 2.0.0 • Hoje às 04:35' })
      .setTimestamp();
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Comandos')
          .setStyle(ButtonStyle.Primary)
          .setCustomId('about_commands'),
        new ButtonBuilder()
          .setLabel('Servidor de Suporte')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/ZfF4dK2'),
        new ButtonBuilder()
          .setLabel('📘 GitHub')
          .setStyle(ButtonStyle.Link)
          .setURL('https://github.com/DiogenesYazan/DJ-Yazan')
      );
    
    await interaction.reply({ 
      embeds: [embed],
      components: [row]
    });
  }
};
