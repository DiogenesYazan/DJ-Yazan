const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const path = require('path');

// Carrega perguntas do arquivo JSON
const triviaData = require('../../data/trivia-questions.json');

// Armazena sessões ativas de trivia
const activeSessions = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('🧠 Jogo de perguntas e respostas!')
    .addStringOption(option =>
      option.setName('categoria')
        .setDescription('Escolha uma categoria')
        .setRequired(false)
        .addChoices(
          { name: '🎵 Música', value: 'musica' },
          { name: '🎮 Games', value: 'games' },
          { name: '🎬 Filmes & Séries', value: 'filmes' },
          { name: '🔬 Ciência & Tecnologia', value: 'ciencia' },
          { name: '🇧🇷 Brasil', value: 'brasil' },
          { name: '� Rock & Metal', value: 'musica_rock' },
          { name: '🇧🇷 Música Brasileira', value: 'musica_brasileira' },
          { name: '🎮 Games Modernos', value: 'games_modernos' },
          { name: '🎨 Jogos Indie', value: 'games_indie' },
          { name: '👾 Jogos Clássicos', value: 'games_classicos' },
          { name: '🎧 Música Eletrônica', value: 'musica_eletronica' },
          { name: '🦸 Personagens de Jogos', value: 'games_personagens' },
          { name: '�🎲 Aleatório', value: 'random' }
        )
    )
    .addIntegerOption(option =>
      option.setName('rodadas')
        .setDescription('Número de perguntas (1-10)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10)
    ),

  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const sessionKey = `${guildId}_${userId}`;

    // Verifica se já tem uma sessão ativa
    if (activeSessions.has(sessionKey)) {
      return interaction.reply({
        content: '❌ Você já tem um trivia em andamento! Termine-o primeiro.',
        ephemeral: true
      });
    }

    const category = interaction.options.getString('categoria') || 'random';
    const rounds = interaction.options.getInteger('rodadas') || 5;
    const timeLimit = triviaData.settings.timeLimit * 1000; // 20 segundos

    // Seleciona as perguntas
    let questions = [];
    
    if (category === 'random') {
      // Pega perguntas aleatórias de todas as categorias
      const allQuestions = [];
      for (const [catKey, catData] of Object.entries(triviaData.categories)) {
        for (const q of catData.questions) {
          allQuestions.push({ ...q, category: catKey, emoji: catData.emoji });
        }
      }
      questions = shuffleArray(allQuestions).slice(0, rounds);
    } else {
      const catData = triviaData.categories[category];
      questions = shuffleArray([...catData.questions].map(q => ({
        ...q,
        category,
        emoji: catData.emoji
      }))).slice(0, rounds);
    }

    // Cria sessão
    const session = {
      userId: interaction.user.id,
      questions,
      currentRound: 0,
      score: 0,
      correctAnswers: 0,
      startTime: Date.now()
    };

    activeSessions.set(sessionKey, session);

    // Inicia o jogo
    await interaction.reply({
      embeds: [createStartEmbed(interaction.user, category, rounds)]
    });

    // Aguarda 2 segundos e começa
    setTimeout(() => {
      playRound(interaction, sessionKey);
    }, 2000);
  }
};

async function playRound(interaction, sessionKey) {
  const session = activeSessions.get(sessionKey);
  if (!session) return;

  const question = session.questions[session.currentRound];
  const timeLimit = triviaData.settings.timeLimit * 1000;

  // Cria embed da pergunta
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setAuthor({ name: `Rodada ${session.currentRound + 1}/${session.questions.length}` })
    .setTitle(`${question.emoji} ${question.question}`)
    .setDescription(`⏱️ Você tem **${triviaData.settings.timeLimit} segundos** para responder!`)
    .addFields(
      { name: '📊 Pontuação atual', value: `${session.score} pontos`, inline: true },
      { name: '✅ Acertos', value: `${session.correctAnswers}/${session.currentRound}`, inline: true }
    )
    .setFooter({ text: `Categoria: ${triviaData.categories[question.category]?.name || 'Aleatório'}` })
    .setTimestamp();

  // Cria botões para as opções
  const shuffledOptions = question.options.map((opt, idx) => ({ text: opt, originalIndex: idx }));
  // Mantém as opções na ordem original para facilidade
  
  const row = new ActionRowBuilder()
    .addComponents(
      question.options.map((opt, idx) => 
        new ButtonBuilder()
          .setCustomId(`trivia_${idx}`)
          .setLabel(`${['A', 'B', 'C', 'D'][idx]}) ${opt.slice(0, 70)}`)
          .setStyle(ButtonStyle.Secondary)
      )
    );

  const message = await interaction.followUp({
    embeds: [embed],
    components: [row]
  });

  // Collector para resposta
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: timeLimit,
    filter: (i) => i.user.id === session.userId
  });

  let answered = false;

  collector.on('collect', async (buttonInteraction) => {
    answered = true;
    collector.stop('answered');

    const selectedIndex = parseInt(buttonInteraction.customId.split('_')[1]);
    const isCorrect = selectedIndex === question.correct;

    if (isCorrect) {
      session.score += triviaData.settings.pointsCorrect;
      session.correctAnswers++;
    }

    // Atualiza botões mostrando resposta correta
    const updatedRow = new ActionRowBuilder()
      .addComponents(
        question.options.map((opt, idx) => 
          new ButtonBuilder()
            .setCustomId(`trivia_${idx}`)
            .setLabel(`${['A', 'B', 'C', 'D'][idx]}) ${opt.slice(0, 70)}`)
            .setStyle(
              idx === question.correct ? ButtonStyle.Success :
              idx === selectedIndex && !isCorrect ? ButtonStyle.Danger :
              ButtonStyle.Secondary
            )
            .setDisabled(true)
        )
      );

    const resultEmbed = new EmbedBuilder()
      .setColor(isCorrect ? 0x57F287 : 0xED4245)
      .setAuthor({ name: `Rodada ${session.currentRound + 1}/${session.questions.length}` })
      .setTitle(`${question.emoji} ${question.question}`)
      .setDescription(
        isCorrect 
          ? `✅ **Correto!** +${triviaData.settings.pointsCorrect} pontos`
          : `❌ **Errado!** A resposta era: **${question.options[question.correct]}**`
      )
      .addFields(
        { name: '📊 Pontuação', value: `${session.score} pontos`, inline: true },
        { name: '✅ Acertos', value: `${session.correctAnswers}/${session.currentRound + 1}`, inline: true }
      )
      .setTimestamp();

    await buttonInteraction.update({
      embeds: [resultEmbed],
      components: [updatedRow]
    });

    // Próxima rodada ou fim
    session.currentRound++;
    
    if (session.currentRound < session.questions.length) {
      setTimeout(() => {
        playRound(interaction, sessionKey);
      }, 2500);
    } else {
      setTimeout(() => {
        endGame(interaction, sessionKey);
      }, 2500);
    }
  });

  collector.on('end', async (collected, reason) => {
    if (reason === 'time' && !answered) {
      // Tempo esgotado
      const timeoutRow = new ActionRowBuilder()
        .addComponents(
          question.options.map((opt, idx) => 
            new ButtonBuilder()
              .setCustomId(`trivia_${idx}`)
              .setLabel(`${['A', 'B', 'C', 'D'][idx]}) ${opt.slice(0, 70)}`)
              .setStyle(idx === question.correct ? ButtonStyle.Success : ButtonStyle.Secondary)
              .setDisabled(true)
          )
        );

      const timeoutEmbed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setAuthor({ name: `Rodada ${session.currentRound + 1}/${session.questions.length}` })
        .setTitle(`${question.emoji} ${question.question}`)
        .setDescription(`⏰ **Tempo esgotado!** A resposta era: **${question.options[question.correct]}**`)
        .addFields(
          { name: '📊 Pontuação', value: `${session.score} pontos`, inline: true },
          { name: '✅ Acertos', value: `${session.correctAnswers}/${session.currentRound + 1}`, inline: true }
        )
        .setTimestamp();

      try {
        await message.edit({
          embeds: [timeoutEmbed],
          components: [timeoutRow]
        });
      } catch (e) {}

      session.currentRound++;
      
      if (session.currentRound < session.questions.length) {
        setTimeout(() => {
          playRound(interaction, sessionKey);
        }, 2500);
      } else {
        setTimeout(() => {
          endGame(interaction, sessionKey);
        }, 2500);
      }
    }
  });
}

async function endGame(interaction, sessionKey) {
  const session = activeSessions.get(sessionKey);
  if (!session) return;

  const totalTime = Math.floor((Date.now() - session.startTime) / 1000);
  const percentage = Math.round((session.correctAnswers / session.questions.length) * 100);
  
  // Determina medalha
  let medal, title, color;
  if (percentage >= 80) {
    medal = '🥇';
    title = 'Excelente!';
    color = 0xFFD700;
  } else if (percentage >= 60) {
    medal = '🥈';
    title = 'Muito Bem!';
    color = 0xC0C0C0;
  } else if (percentage >= 40) {
    medal = '🥉';
    title = 'Bom Trabalho!';
    color = 0xCD7F32;
  } else {
    medal = '📚';
    title = 'Continue Tentando!';
    color = 0x5865F2;
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${medal} Trivia Finalizado - ${title}`)
    .setDescription(`<@${session.userId}> completou o trivia!`)
    .addFields(
      { name: '📊 Pontuação Final', value: `**${session.score}** pontos`, inline: true },
      { name: '✅ Acertos', value: `**${session.correctAnswers}/${session.questions.length}** (${percentage}%)`, inline: true },
      { name: '⏱️ Tempo Total', value: `${totalTime} segundos`, inline: true }
    )
    .setFooter({ text: 'Use /trivia para jogar novamente!' })
    .setTimestamp();

  await interaction.followUp({ embeds: [embed] });

  // Remove sessão
  activeSessions.delete(sessionKey);
}

function createStartEmbed(user, category, rounds) {
  const catInfo = category === 'random' 
    ? { emoji: '🎲', name: 'Aleatório' }
    : triviaData.categories[category];

  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('🧠 Trivia - Iniciando!')
    .setDescription(`
${catInfo.emoji} **Categoria:** ${catInfo.name}
📝 **Rodadas:** ${rounds}
⏱️ **Tempo por pergunta:** ${triviaData.settings.timeLimit}s
🎯 **Pontos por acerto:** ${triviaData.settings.pointsCorrect}

Prepare-se, <@${user.id}>! O jogo começa em **2 segundos**...
    `)
    .setFooter({ text: 'Clique no botão correto para responder!' })
    .setTimestamp();
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
