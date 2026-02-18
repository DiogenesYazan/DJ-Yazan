const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('ℹ️ Informações sobre o bot'),
  
  async execute(interaction) {
    const client = interaction.client;
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('🎧 DJ Yazan — O Bot Musical Definitivo!')
      .setURL('https://dj-yazan-841149114742.herokuapp.com/')
      .setThumbnail('https://i.imgur.com/4t8XUT5.jpeg')
      .setDescription('DJ Yazan é um bot de música para Discord com recursos avançados, interface moderna e sistema de failover automático de servidores Lavalink — a festa nunca para!\n\nAcesse o site para adicionar o bot ao seu servidor e ver todos os comandos: [dj-yazan-841149114742.herokuapp.com](https://dj-yazan-841149114742.herokuapp.com/)')
      .addFields(
        {
          name: '✨ Destaques',
          value:
            '🎵 Música 24/7 com troca automática de servidor Lavalink se cair\n' +
            '🧠 **/quiz**: desafie seus amigos com perguntas de cultura pop, animes, games e mais!\n' +
            '🎲 Jogos interativos: blackjack, tictactoe, hangman, wordle, reaction, e outros\n' +
            '🎚️ Sistema de loop (faixa/fila)\n' +
            '🎛️ Painel de controle interativo\n' +
            '🔀 Fila dinâmica e embaralhamento\n' +
            '📊 Barra de progresso animada\n' +
            '🎤 Letras de músicas (Genius)\n' +
            '📈 Estatísticas e ranking de usuários',
          inline: false
        },
        {
          name: '🌐 Links Úteis',
          value:
            '[➕ Adicione o bot](https://dj-yazan-841149114742.herokuapp.com/) | [GitHub](https://github.com/DiogenesYazan/DJ-Yazan) | [Imagens do bot](https://i.imgur.com/dMMcU8l.png) [1](https://i.imgur.com/KzpRtBB.png) [2](https://i.imgur.com/ED8oWkr.png) [3](https://i.imgur.com/n3MhLLD.png)',
          inline: false
        },
        {
          name: '📊 Estatísticas',
          value:
            `Servidores: ${client.guilds.cache.size}\n` +
            `Usuários: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}\n` +
            `Comandos: 23+\n` +
            `Ping: ${client.ws.ping}ms`,
          inline: false
        }
      )
      .setImage('https://i.imgur.com/dMMcU8l.png')
      .setFooter({ text: 'Desenvolvido por Yazan | Sempre atualizado!' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Comandos')
          .setStyle(ButtonStyle.Primary)
          .setCustomId('about_commands'),
        new ButtonBuilder()
          .setLabel('Site do Bot')
          .setStyle(ButtonStyle.Link)
          .setURL('https://dj-yazan-841149114742.herokuapp.com/'),
        new ButtonBuilder()
          .setLabel('Imagens')
          .setStyle(ButtonStyle.Link)
          .setURL('https://i.imgur.com/dMMcU8l.png'),
        new ButtonBuilder()
          .setLabel('GitHub')
          .setStyle(ButtonStyle.Link)
          .setURL('https://github.com/DiogenesYazan/DJ-Yazan')
      );

    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};
