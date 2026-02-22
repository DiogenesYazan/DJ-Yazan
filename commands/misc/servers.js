const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

// ID do dono do bot - único usuário que pode usar este comando
const OWNER_ID = '413096238142062592';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('📡 Lista os servidores do bot'),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando.',
        ephemeral: true
      });
    }

    const guilds = interaction.client.guilds.cache;
    const sortedGuilds = [...guilds.values()].sort((a, b) => b.memberCount - a.memberCount);
    const totalMembers = sortedGuilds.reduce((acc, g) => acc + g.memberCount, 0);
    
    // Configuração de Paginação
    const pageSize = 10;
    const pages = [];

    for (let i = 0; i < sortedGuilds.length; i += pageSize) {
      const pageGuilds = sortedGuilds.slice(i, i + pageSize);
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📡 Servidores do DJ Yazan')
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setDescription(`**Total:** ${guilds.size} servidores • ${totalMembers.toLocaleString()} membros\n\n` + 
          pageGuilds.map((g, idx) => {
            const num = i + idx + 1;
            return `**${num}.** ${g.name}\n` +
                   `   👥 ${g.memberCount.toLocaleString()} membros • 🆔 \`${g.id}\``;
          }).join('\n\n')
        )
        .setFooter({ text: `Página ${Math.floor(i/pageSize) + 1}/${Math.ceil(sortedGuilds.length/pageSize)} • Comando exclusivo do dono` })
        .setTimestamp();
        
      pages.push(embed);
    }

    if (pages.length === 0) {
      return interaction.reply({ content: '❌ Nenhum servidor encontrado.', ephemeral: true });
    }

    let currentPage = 0;

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('prev_page')
          .setLabel('⬅️ Anterior')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0),
        new ButtonBuilder()
           .setCustomId('next_page')
           .setLabel('Próxima ➡️')
           .setStyle(ButtonStyle.Primary)
           .setDisabled(currentPage === pages.length - 1)
      );

    const message = await interaction.reply({
      embeds: [pages[currentPage]],
      components: pages.length > 1 ? [row] : [],
      ephemeral: true,
      fetchReply: true
    });

    if (pages.length <= 1) return;

    // Criar collector (mesmo ephemeral interagindo com ephemeral require timeout)
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000 * 5 // 5 minutos ativos
    });

    collector.on('collect', async i => {
      // Garantir que quem apertou o botão é o dono
      if (i.user.id !== OWNER_ID) return;

      if (i.customId === 'prev_page') {
        currentPage--;
      } else if (i.customId === 'next_page') {
        currentPage++;
      }

      row.components[0].setDisabled(currentPage === 0);
      row.components[1].setDisabled(currentPage === pages.length - 1);

      await i.update({
        embeds: [pages[currentPage]],
        components: [row]
      });
    });

    collector.on('end', async () => {
      row.components.forEach(c => c.setDisabled(true));
      await interaction.editReply({ components: [row] }).catch(() => {});
    });
  }
};
