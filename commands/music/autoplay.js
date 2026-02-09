const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('autoplay')
    .setDescription('Ativa/desativa reprodução automática quando a fila acabar'),

  async execute(i) {
    // Verificar permissão de gerenciar servidor
    if (!i.member.permissions.has('ManageGuild')) {
      return i.reply({ 
        content: '❌ Você precisa da permissão "Gerenciar Servidor" para usar este comando!', 
        ephemeral: true 
      });
    }
    
    const guildId = i.guild.id;
    
    // Buscar ou criar configuração
    let config = await GuildConfig.findOne({ guildId });
    
    if (!config) {
      config = new GuildConfig({ guildId });
    }
    
    // Toggle autoplay
    config.autoplay = !config.autoplay;
    await config.save();
    
    const status = config.autoplay;
    
    const embed = new EmbedBuilder()
      .setColor(status ? 0x57F287 : 0xED4245)
      .setTitle(`${status ? '🔄' : '⏹️'} Autoplay ${status ? 'Ativado' : 'Desativado'}`)
      .setDescription(status 
        ? 'Quando a fila terminar, músicas relacionadas serão adicionadas automaticamente.'
        : 'O bot irá parar quando a fila terminar.')
      .setFooter({ text: `Configurado por ${i.user.username}` });
    
    return i.reply({ embeds: [embed] });
  }
};
