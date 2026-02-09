const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📚 Mostra todos os comandos disponíveis'),
  
  async execute(interaction) {
    // Embed principal
    const mainEmbed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setAuthor({ 
        name: 'DJ Yazan • Central de Ajuda', 
        iconURL: interaction.client.user.displayAvatarURL() 
      })
      .setDescription(
        '**Bem-vindo ao DJ Yazan!** 🎶\n\n' +
        'Sou um bot completo de **música** e **jogos** para Discord.\n' +
        'Use o menu abaixo para navegar pelas categorias ou veja o resumo:\n\n' +
        '```\n' +
        '🎵 22 comandos de música\n' +
        '🎮 12 comandos de jogos\n' +
        '⚙️  6 comandos utilitários\n' +
        '```'
      )
      .addFields(
        {
          name: '🚀 Começar Rápido',
          value: 
            '> `/play <música>` - Toca qualquer música\n' +
            '> `/slots` - Joga no caça-níquel\n' +
            '> `/help` - Esta mensagem',
          inline: false
        }
      )
      .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: `DJ Yazan v2.0 • ${interaction.client.guilds.cache.size} servidores` })
      .setTimestamp();

    // Menu de categorias
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('📂 Escolha uma categoria')
      .addOptions([
        {
          label: 'Música - Reprodução',
          description: 'Play, search, playlist, autoplay...',
          value: 'music_play',
          emoji: '🎵'
        },
        {
          label: 'Música - Controles',
          description: 'Pause, skip, volume, loop, seek...',
          value: 'music_control',
          emoji: '🎛️'
        },
        {
          label: 'Música - Fila',
          description: 'Queue, shuffle, remove, clear...',
          value: 'music_queue',
          emoji: '📋'
        },
        {
          label: 'Jogos - Cassino',
          description: 'Slots, blackjack, coinflip...',
          value: 'games_casino',
          emoji: '🎰'
        },
        {
          label: 'Jogos - Multiplayer',
          description: 'RPS, Connect4, TicTacToe...',
          value: 'games_multi',
          emoji: '🎮'
        },
        {
          label: 'Jogos - Palavras',
          description: 'Wordle, Hangman, Trivia...',
          value: 'games_words',
          emoji: '🔤'
        },
        {
          label: 'Utilitários',
          description: 'Stats, leaderboard, ping...',
          value: 'misc',
          emoji: '⚙️'
        }
      ]);

    const menuRow = new ActionRowBuilder().addComponents(selectMenu);

    // Botões de links
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Adicionar Bot')
          .setStyle(ButtonStyle.Link)
          .setURL(`https://discord.com/api/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot%20applications.commands`)
          .setEmoji('🤖'),
        new ButtonBuilder()
          .setLabel('Suporte')
          .setStyle(ButtonStyle.Link)
          .setURL('https://discord.gg/ZfF4dK2')
          .setEmoji('💬'),
        new ButtonBuilder()
          .setLabel('GitHub')
          .setStyle(ButtonStyle.Link)
          .setURL('https://github.com/DiogenesYazan/DJ-Yazan')
          .setEmoji('📘')
      );

    const message = await interaction.reply({ 
      embeds: [mainEmbed], 
      components: [menuRow, buttonRow],
      fetchReply: true
    });

    // Collector para o menu
    const collector = message.createMessageComponentCollector({
      filter: i => i.customId === 'help_category' && i.user.id === interaction.user.id,
      time: 120000 // 2 minutos
    });

    collector.on('collect', async (i) => {
      let categoryEmbed;

      switch (i.values[0]) {
        case 'music_play':
          categoryEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎵 Música - Reprodução')
            .setDescription('Comandos para tocar e buscar músicas.')
            .addFields(
              { name: '`/play <música>`', value: '▸ Toca música, URL ou playlist', inline: true },
              { name: '`/search <música>`', value: '▸ Pesquisa e escolhe entre resultados', inline: true },
              { name: '`/playlist <artista>`', value: '▸ Toca top músicas de um artista', inline: true },
              { name: '`/lyrics`', value: '▸ Mostra letra da música atual', inline: true },
              { name: '`/nowplayed`', value: '▸ Mostra música tocando agora', inline: true },
              { name: '`/autoplay`', value: '▸ Ativa/desativa autoplay', inline: true },
              { name: '`/favorites`', value: '▸ Gerencia músicas favoritas', inline: true },
              { name: '`/myplaylists`', value: '▸ Suas playlists personalizadas', inline: true },
              { name: '`/controller`', value: '▸ Painel de controle interativo', inline: true }
            );
          break;

        case 'music_control':
          categoryEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎛️ Música - Controles')
            .setDescription('Controle a reprodução de música.')
            .addFields(
              { name: '`/pause`', value: '▸ Pausa ou retoma a música', inline: true },
              { name: '`/skip`', value: '▸ Pula para próxima música', inline: true },
              { name: '`/stop`', value: '▸ Para tudo e desconecta', inline: true },
              { name: '`/volume <0-200>`', value: '▸ Ajusta o volume', inline: true },
              { name: '`/loop <modo>`', value: '▸ Loop: off/track/queue', inline: true },
              { name: '`/seek <mm:ss>`', value: '▸ Pula para tempo específico', inline: true },
              { name: '`/247`', value: '▸ Modo 24/7 (não desconecta)', inline: true }
            );
          break;

        case 'music_queue':
          categoryEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('📋 Música - Fila')
            .setDescription('Gerencie a fila de músicas.')
            .addFields(
              { name: '`/queue`', value: '▸ Mostra a fila atual', inline: true },
              { name: '`/shuffle`', value: '▸ Embaralha a fila', inline: true },
              { name: '`/clear`', value: '▸ Limpa toda a fila', inline: true },
              { name: '`/remove <posição>`', value: '▸ Remove música da fila', inline: true },
              { name: '`/move <de> <para>`', value: '▸ Move música na fila', inline: true },
              { name: '`/jump <posição>`', value: '▸ Pula para posição na fila', inline: true }
            );
          break;

        case 'games_casino':
          categoryEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎰 Jogos - Cassino')
            .setDescription('Jogos de sorte e azar! Ganhe pontos no leaderboard.')
            .addFields(
              { name: '`/slots`', value: '▸ 🎰 Caça-níquel com jackpots', inline: true },
              { name: '`/blackjack`', value: '▸ 🃏 21 contra o dealer', inline: true },
              { name: '`/coinflip`', value: '▸ 🪙 Cara ou coroa', inline: true },
              { name: '`/8ball <pergunta>`', value: '▸ 🎱 Bola 8 mágica', inline: true }
            )
            .setFooter({ text: '💡 Dica: Ganhe pontos e suba no /leaderboard!' });
          break;

        case 'games_multi':
          categoryEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🎮 Jogos - Multiplayer')
            .setDescription('Desafie amigos ou jogue contra o bot!')
            .addFields(
              { name: '`/rps [oponente]`', value: '▸ ✂️ Pedra, Papel, Tesoura', inline: true },
              { name: '`/tictactoe <oponente>`', value: '▸ ⭕ Jogo da Velha', inline: true },
              { name: '`/connect4 <oponente>`', value: '▸ 🔴 Conecte 4', inline: true },
              { name: '`/reaction`', value: '▸ ⚡ Teste de reflexo', inline: true }
            )
            .setFooter({ text: '💡 Dica: Use @usuário para desafiar alguém!' });
          break;

        case 'games_words':
          categoryEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🔤 Jogos - Palavras & Trivia')
            .setDescription('Teste seu conhecimento e vocabulário!')
            .addFields(
              { name: '`/wordle`', value: '▸ 🟩 Adivinhe a palavra em 6 tentativas', inline: true },
              { name: '`/hangman [categoria]`', value: '▸ 🪢 Jogo da Forca', inline: true },
              { name: '`/trivia [categoria]`', value: '▸ 🧠 Perguntas de conhecimento', inline: true },
              { name: '`/quiz start <rounds>`', value: '▸ 🎵 Quiz Musical multiplayer', inline: true }
            )
            .setFooter({ text: '💡 Categorias: games, música, brasil, rock, eletrônica...' });
          break;

        case 'misc':
          categoryEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('⚙️ Utilitários')
            .setDescription('Comandos de estatísticas e informações.')
            .addFields(
              { name: '`/leaderboard`', value: '▸ 🏆 Ranking do servidor', inline: true },
              { name: '`/mystats`', value: '▸ 📊 Suas estatísticas pessoais', inline: true },
              { name: '`/stats`', value: '▸ 📈 Estatísticas do bot', inline: true },
              { name: '`/ping`', value: '▸ 🏓 Latência do bot', inline: true },
              { name: '`/about`', value: '▸ ℹ️ Informações sobre o bot', inline: true },
              { name: '`/help`', value: '▸ 📚 Esta mensagem', inline: true }
            );
          break;
      }

      categoryEmbed
        .setThumbnail(interaction.client.user.displayAvatarURL())
        .setFooter({ text: 'Use o menu para ver outras categorias • DJ Yazan' });

      await i.update({ embeds: [categoryEmbed], components: [menuRow, buttonRow] });
    });

    collector.on('end', () => {
      // Desativa o menu após timeout
      const disabledMenu = StringSelectMenuBuilder.from(selectMenu).setDisabled(true);
      const disabledRow = new ActionRowBuilder().addComponents(disabledMenu);
      interaction.editReply({ components: [disabledRow, buttonRow] }).catch(() => {});
    });
  }
};
