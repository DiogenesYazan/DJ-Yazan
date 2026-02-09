const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { updateGameScore, GAME_POINTS } = require('./_gameUtils');

// Carrega palavras
const wordData = require('../../data/word-games.json');

// Partes do boneco da forca
const HANGMAN_STAGES = [
  // 0 erros
  `
  ┌───┐
  │   
  │   
  │   
  │   
  └───
  `,
  // 1 erro - cabeça
  `
  ┌───┐
  │   O
  │   
  │   
  │   
  └───
  `,
  // 2 erros - corpo
  `
  ┌───┐
  │   O
  │   │
  │   
  │   
  └───
  `,
  // 3 erros - braço esquerdo
  `
  ┌───┐
  │   O
  │  /│
  │   
  │   
  └───
  `,
  // 4 erros - braço direito
  `
  ┌───┐
  │   O
  │  /│\\
  │   
  │   
  └───
  `,
  // 5 erros - perna esquerda
  `
  ┌───┐
  │   O
  │  /│\\
  │  / 
  │   
  └───
  `,
  // 6 erros - perna direita (morte)
  `
  ┌───┐
  │   O
  │  /│\\
  │  / \\
  │   
  └───
  `
];

// Jogos ativos
const activeGames = new Map();

// Alfabeto para botões
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hangman')
    .setDescription('🪢 Jogo da Forca!')
    .addStringOption(option =>
      option.setName('dificuldade')
        .setDescription('Escolha a dificuldade')
        .setRequired(false)
        .addChoices(
          { name: '🟢 Fácil', value: 'easy' },
          { name: '🟡 Médio', value: 'medium' },
          { name: '🔴 Difícil', value: 'hard' }
        )
    )
    .addStringOption(option =>
      option.setName('categoria')
        .setDescription('Escolha uma categoria temática (opcional)')
        .setRequired(false)
        .addChoices(
          { name: '🎮 Games', value: 'games' },
          { name: '🎵 Música', value: 'musica' },
          { name: '💻 Tecnologia', value: 'tecnologia' },
          { name: '🍽️ Comida Brasileira', value: 'comida_brasileira' },
          { name: '🎬 Cultura Pop', value: 'cultura_pop' },
          { name: '🇧🇷 Brasil', value: 'brasil' },
          { name: '🧠 Palavras Difíceis', value: 'dificeis' }
        )
    ),

  async execute(interaction) {
    const difficulty = interaction.options.getString('dificuldade') || 'medium';
    const category = interaction.options.getString('categoria');
    const userId = interaction.user.id;
    const gameKey = `${interaction.guild.id}_${userId}`;
    
    if (activeGames.has(gameKey)) {
      return interaction.reply({ content: '❌ Você já tem um jogo da forca em andamento!', ephemeral: true });
    }
    
    // Escolhe palavra baseada na categoria (se especificada) ou dificuldade
    let words;
    let usedCategory = null;
    
    if (category && wordData.hangman[category]) {
      words = wordData.hangman[category];
      usedCategory = category;
    } else {
      words = wordData.hangman[difficulty];
    }
    
    const word = words[Math.floor(Math.random() * words.length)].toUpperCase();
    
    const game = {
      word,
      difficulty,
      category: usedCategory,
      guessedLetters: new Set(),
      wrongGuesses: 0,
      maxWrong: 6,
      revealed: word.split('').map(c => c === ' ' ? ' ' : '_')
    };
    
    activeGames.set(gameKey, game);
    
    const embed = createHangmanEmbed(game, 'playing', interaction.user);
    const components = createAlphabetButtons(game.guessedLetters);
    
    await interaction.reply({ embeds: [embed], components });
    
    const message = await interaction.fetchReply();
    
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000, // 5 minutos
      filter: (i) => i.user.id === userId && i.customId.startsWith('hm_')
    });
    
    collector.on('collect', async (i) => {
      const game = activeGames.get(gameKey);
      if (!game) {
        collector.stop('ended');
        return;
      }
      
      const letter = i.customId.replace('hm_', '');
      
      if (game.guessedLetters.has(letter)) {
        await i.reply({ content: '❌ Você já tentou essa letra!', ephemeral: true });
        return;
      }
      
      game.guessedLetters.add(letter);
      
      // Verifica se a letra está na palavra
      let found = false;
      for (let j = 0; j < game.word.length; j++) {
        if (game.word[j] === letter) {
          game.revealed[j] = letter;
          found = true;
        }
      }
      
      if (!found) {
        game.wrongGuesses++;
      }
      
      // Verifica condições de fim
      const won = !game.revealed.includes('_');
      const lost = game.wrongGuesses >= game.maxWrong;
      
      if (won) {
        activeGames.delete(gameKey);
        
        // Bônus baseado na dificuldade ou categoria
        let bonus = 0;
        if (game.category) {
          // Categorias temáticas têm bônus fixo de 15 pontos
          bonus = game.category === 'dificeis' ? 25 : 15;
        } else {
          bonus = { easy: 0, medium: 10, hard: 20 }[game.difficulty];
        }
        const points = GAME_POINTS.HANGMAN_WIN + bonus;
        
        await updateGameScore(interaction.guild.id, userId, points, true);
        
        const embed = createHangmanEmbed(game, 'win', interaction.user);
        embed.setDescription(`🎉 **Parabéns!** Você adivinhou a palavra!\n**${game.word}**\n+${points} pontos`);
        
        await i.update({ embeds: [embed], components: [] });
        collector.stop('won');
      } else if (lost) {
        activeGames.delete(gameKey);
        
        await updateGameScore(interaction.guild.id, userId, GAME_POINTS.HANGMAN_LOSE, false);
        
        const embed = createHangmanEmbed(game, 'lose', interaction.user);
        embed.setDescription(`💀 **Você foi enforcado!**\nA palavra era: **${game.word}**\n+${GAME_POINTS.HANGMAN_LOSE} pontos de participação`);
        
        await i.update({ embeds: [embed], components: [] });
        collector.stop('lost');
      } else {
        // Continua jogando
        const embed = createHangmanEmbed(game, 'playing', interaction.user);
        const components = createAlphabetButtons(game.guessedLetters);
        
        await i.update({ embeds: [embed], components });
      }
    });
    
    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        activeGames.delete(gameKey);
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('🪢 Forca - Tempo Esgotado')
          .setDescription('⏰ O jogo foi cancelado por inatividade.');
        
        interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      }
    });
  }
};

function createHangmanEmbed(game, status, user) {
  let color;
  switch (status) {
    case 'win': color = 0x57F287; break;
    case 'lose': color = 0xED4245; break;
    default: color = 0x5865F2;
  }
  
  const difficultyEmoji = { easy: '🟢', medium: '🟡', hard: '🔴' }[game.difficulty];
  const difficultyName = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }[game.difficulty];
  
  // Nomes das categorias temáticas
  const categoryNames = {
    games: '🎮 Games',
    musica: '🎵 Música',
    tecnologia: '💻 Tecnologia',
    comida_brasileira: '🍽️ Comida Brasileira',
    cultura_pop: '🎬 Cultura Pop',
    brasil: '🇧🇷 Brasil',
    dificeis: '🧠 Palavras Difíceis'
  };
  
  const wordDisplay = game.revealed.join(' ');
  const wrongLetters = [...game.guessedLetters]
    .filter(l => !game.word.includes(l))
    .join(' ') || 'Nenhuma';
  
  // Monta o campo de modo (categoria ou dificuldade)
  const modeText = game.category 
    ? categoryNames[game.category] 
    : `${difficultyEmoji} ${difficultyName}`;
  
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('🪢 Jogo da Forca')
    .addFields(
      { name: '📝 Palavra', value: `\`${wordDisplay}\``, inline: false },
      { name: '🎭 Forca', value: `\`\`\`${HANGMAN_STAGES[game.wrongGuesses]}\`\`\``, inline: true },
      { name: '❌ Erros', value: `${game.wrongGuesses}/${game.maxWrong}\n${wrongLetters}`, inline: true },
      { name: game.category ? '🏷️ Categoria' : '⚙️ Dificuldade', value: modeText, inline: true }
    )
    .setFooter({ text: `${user.username} • ${game.word.length} letras` })
    .setTimestamp();
  
  return embed;
}

function createAlphabetButtons(guessedLetters) {
  const rows = [];
  const alphabetRows = ['ABCDEFGHI', 'JKLMNOPQR', 'STUVWXYZ'];
  
  for (const rowLetters of alphabetRows) {
    const row = new ActionRowBuilder();
    
    for (const letter of rowLetters) {
      const button = new ButtonBuilder()
        .setCustomId(`hm_${letter}`)
        .setLabel(letter)
        .setStyle(guessedLetters.has(letter) ? ButtonStyle.Secondary : ButtonStyle.Primary)
        .setDisabled(guessedLetters.has(letter));
      
      row.addComponents(button);
    }
    
    rows.push(row);
  }
  
  return rows;
}
