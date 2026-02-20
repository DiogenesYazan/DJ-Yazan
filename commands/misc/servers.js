const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// ID do dono do bot - único usuário que pode usar este comando
const OWNER_ID = '413096238142062592';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('servers')
    .setDescription('📡 Lista os servidores do bot'),

  async execute(interaction) {
    // Verifica se o usuário é o dono
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando.',
        ephemeral: true
      });
    }

    const client = interaction.client;
    const guilds = client.guilds.cache;

    // Ordena por número de membros (maior primeiro)
    const sortedGuilds = [...guilds.values()].sort((a, b) => b.memberCount - a.memberCount);

    // Monta a lista de servidores (pagina se for muito grande)
    const totalMembers = sortedGuilds.reduce((acc, g) => acc + g.memberCount, 0);
    const pageSize = 15;
    const pages = [];

    for (let i = 0; i < sortedGuilds.length; i += pageSize) {
      const page = sortedGuilds.slice(i, i + pageSize);
      const list = page.map((g, idx) => {
        const num = i + idx + 1;
        return `**${num}.** ${g.name}\n` +
               `   👥 ${g.memberCount.toLocaleString()} membros • 🆔 \`${g.id}\``;
      }).join('\n\n');
      pages.push(list);
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📡 Servidores do DJ Yazan')
      .setDescription(
        `**Total:** ${guilds.size} servidores • ${totalMembers.toLocaleString()} membros\n\n` +
        pages[0]
      )
      .setFooter({
        text: pages.length > 1
          ? `Página 1/${pages.length} • Comando exclusivo do dono`
          : 'Comando exclusivo do dono'
      })
      .setTimestamp();

    // Resposta ephemeral para que só o dono veja
    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });

    // Se houver mais páginas, envia como follow-ups
    for (let p = 1; p < pages.length; p++) {
      const pageEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setDescription(pages[p])
        .setFooter({ text: `Página ${p + 1}/${pages.length}` });

      await interaction.followUp({
        embeds: [pageEmbed],
        ephemeral: true
      });
    }
  }
};
