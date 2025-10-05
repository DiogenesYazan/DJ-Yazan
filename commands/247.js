const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Map para armazenar servidores em modo 24/7
const mode247 = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('247')
    .setDescription('🔒 Ativa/desativa modo 24/7 (bot permanece no canal)')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const current = mode247.get(guildId) || false;
    const newMode = !current;
    
    mode247.set(guildId, newMode);
    
    // Torna o Map acessível globalmente
    if (!interaction.client.mode247) {
      interaction.client.mode247 = mode247;
    }
    
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
  },
  
  // Exporta o Map para ser usado em outros arquivos
  mode247
};
