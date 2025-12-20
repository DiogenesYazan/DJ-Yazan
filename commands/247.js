// commands/247.js
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('247')
    .setDescription('🔒 Ativa/desativa modo 24/7 (bot permanece no canal)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const guildId = interaction.guild.id;
    
    // Busca ou cria a configuração
    let config = await GuildConfig.findOne({ guildId });
    if (!config) {
      config = new GuildConfig({ guildId });
    }
    
    // Alterna o modo
    config.alwaysOn = !config.alwaysOn;
    await config.save();
    
    const newMode = config.alwaysOn;
    
    const embed = new EmbedBuilder()
      .setColor(newMode ? '#00FF00' : '#FF0000')
      .setTitle('🔒 Modo 24/7')
      .setDescription(
        newMode 
          ? '✅ **Modo 24/7 Ativado**\n\nO bot permanecerá no canal de voz mesmo quando a fila terminar.'
          : '❌ **Modo 24/7 Desativado**\n\nO bot sairá do canal quando a fila terminar.'
      )
      .addFields(
        { name: 'Status', value: newMode ? '🟢 Ativo' : '🔴 Inativo', inline: true },
        { name: 'Servidor', value: interaction.guild.name, inline: true }
      )
      .setFooter({ text: 'Requer permissão: Gerenciar Servidor' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
