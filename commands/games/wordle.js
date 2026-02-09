const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType, ButtonBuilder, ButtonStyle } = require('discord.js');
const { updateGameScore, GAME_POINTS } = require('./_gameUtils');

// Carrega palavras
const wordData = require('../../data/word-games.json');
const WORDS = wordData.wordle['5_letters'];

// Jogos ativos
const activeGames = new Map();

// Cores para feedback
const LETTER_COLORS = {
  correct: '🟩',   // Letra correta no lugar certo
  present: '🟨',   // Letra existe mas no lugar errado
  absent: '⬛'     // Letra não existe
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wordle')
    .setDescription('🟩 Adivinhe a palavra em 6 tentativas!'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const gameKey = `${interaction.guild.id}_${userId}`;
    
    if (activeGames.has(gameKey)) {
      return interaction.reply({ content: '❌ Você já tem um Wordle em andamento! Use o botão para continuar ou aguarde.', ephemeral: true });
    }
    
    // Escolhe palavra aleatória
    const word = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
    
    const game = {
      word,
      attempts: [],
      maxAttempts: 6,
      keyboard: createKeyboard()
    };
    
    activeGames.set(gameKey, game);
    
    const embed = createWordleEmbed(game, 'playing');
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('wordle_guess')
          .setLabel('📝 Tentar palavra')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('wordle_hint')
          .setLabel('💡 Dica (-10 pts)')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('wordle_give_up')
          .setLabel('🏳️ Desistir')
          .setStyle(ButtonStyle.Danger)
      );
    
    await interaction.reply({ embeds: [embed], components: [row] });
    
    const message = await interaction.fetchReply();
    
    const collector = message.createMessageComponentCollector({
      time: 300000, // 5 minutos
      filter: (i) => i.user.id === userId
    });
    
    collector.on('collect', async (i) => {
      const game = activeGames.get(gameKey);
      if (!game) {
        collector.stop('ended');
        return;
      }
      
      if (i.customId === 'wordle_guess') {
        // Modal para entrada de palavra
        const modal = new ModalBuilder()
          .setCustomId('wordle_modal')
          .setTitle('Wordle - Sua tentativa');
        
        const input = new TextInputBuilder()
          .setCustomId('wordle_input')
          .setLabel('Digite uma palavra de 5 letras')
          .setStyle(TextInputStyle.Short)
          .setMinLength(5)
          .setMaxLength(5)
          .setRequired(true)
          .setPlaceholder('EXEMPLO');
        
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        
        await i.showModal(modal);
        
        try {
          const modalResponse = await i.awaitModalSubmit({
            time: 60000,
            filter: (m) => m.customId === 'wordle_modal' && m.user.id === userId
          });
          
          const guess = modalResponse.fields.getTextInputValue('wordle_input').toUpperCase();
          
          // Valida tentativa
          if (!/^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ]+$/i.test(guess)) {
            await modalResponse.reply({ content: '❌ Use apenas letras!', ephemeral: true });
            return;
          }
          
          // Processa tentativa
          const result = processGuess(guess, game.word);
          game.attempts.push({ guess, result });
          
          // Atualiza teclado
          updateKeyboard(game.keyboard, guess, result);
          
          // Verifica vitória
          if (guess === game.word) {
            activeGames.delete(gameKey);
            
            const bonus = Math.max(0, (7 - game.attempts.length) * 5); // Bonus por menos tentativas
            const points = GAME_POINTS.WORDLE_WIN + bonus;
            
            await updateGameScore(interaction.guild.id, userId, points, true);
            
            const embed = createWordleEmbed(game, 'win');
            embed.setDescription(`🎉 **Parabéns!** Você acertou em ${game.attempts.length} tentativa(s)!\n+${points} pontos (${bonus > 0 ? `+${bonus} bônus` : ''})`);
            
            await modalResponse.update({ embeds: [embed], components: [] });
            collector.stop('won');
          } else if (game.attempts.length >= game.maxAttempts) {
            // Perdeu
            activeGames.delete(gameKey);
            
            await updateGameScore(interaction.guild.id, userId, GAME_POINTS.WORDLE_LOSE, false);
            
            const embed = createWordleEmbed(game, 'lose');
            embed.setDescription(`😢 **Fim de jogo!** A palavra era: **${game.word}**\n+${GAME_POINTS.WORDLE_LOSE} pontos de participação`);
            
            await modalResponse.update({ embeds: [embed], components: [] });
            collector.stop('lost');
          } else {
            // Continua jogando
            const embed = createWordleEmbed(game, 'playing');
            const newRow = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('wordle_guess')
                  .setLabel('📝 Tentar palavra')
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId('wordle_hint')
                  .setLabel('💡 Dica (-10 pts)')
                  .setStyle(ButtonStyle.Secondary)
                  .setDisabled(game.hintUsed),
                new ButtonBuilder()
                  .setCustomId('wordle_give_up')
                  .setLabel('🏳️ Desistir')
                  .setStyle(ButtonStyle.Danger)
              );
            
            await modalResponse.update({ embeds: [embed], components: [newRow] });
          }
        } catch (err) {
          // Timeout do modal - ignora
        }
      } else if (i.customId === 'wordle_hint') {
        if (game.hintUsed) {
          await i.reply({ content: '❌ Você já usou a dica!', ephemeral: true });
          return;
        }
        
        game.hintUsed = true;
        
        // Revela uma letra aleatória
        const unrevealed = [];
        for (let i = 0; i < game.word.length; i++) {
          const letter = game.word[i];
          const alreadyRevealed = game.attempts.some(a => 
            a.result[i] === 'correct'
          );
          if (!alreadyRevealed) unrevealed.push(i);
        }
        
        if (unrevealed.length > 0) {
          const hintIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
          const hintLetter = game.word[hintIndex];
          
          await i.reply({ 
            content: `💡 **Dica:** A letra na posição ${hintIndex + 1} é **${hintLetter}**\n*(-10 pontos do prêmio final)*`, 
            ephemeral: true 
          });
        } else {
          await i.reply({ content: '💡 Você já revelou todas as letras!', ephemeral: true });
        }
      } else if (i.customId === 'wordle_give_up') {
        activeGames.delete(gameKey);
        
        await updateGameScore(interaction.guild.id, userId, GAME_POINTS.WORDLE_LOSE, false);
        
        const embed = createWordleEmbed(game, 'give_up');
        embed.setDescription(`🏳️ Você desistiu! A palavra era: **${game.word}**\n+${GAME_POINTS.WORDLE_LOSE} pontos de participação`);
        
        await i.update({ embeds: [embed], components: [] });
        collector.stop('gave_up');
      }
    });
    
    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        activeGames.delete(gameKey);
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('🟩 Wordle - Tempo Esgotado')
          .setDescription('⏰ O jogo foi cancelado por inatividade.');
        
        interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      }
    });
  }
};

function processGuess(guess, word) {
  const result = [];
  const wordArray = word.split('');
  const guessArray = guess.split('');
  const used = new Array(5).fill(false);
  
  // Primeiro passo: marcar letras corretas
  for (let i = 0; i < 5; i++) {
    if (guessArray[i] === wordArray[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }
  
  // Segundo passo: marcar letras presentes
  for (let i = 0; i < 5; i++) {
    if (result[i]) continue;
    
    let found = false;
    for (let j = 0; j < 5; j++) {
      if (!used[j] && guessArray[i] === wordArray[j]) {
        result[i] = 'present';
        used[j] = true;
        found = true;
        break;
      }
    }
    
    if (!found) {
      result[i] = 'absent';
    }
  }
  
  return result;
}

function createKeyboard() {
  const rows = [
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM'
  ];
  
  const keyboard = {};
  for (const row of rows) {
    for (const letter of row) {
      keyboard[letter] = 'unknown'; // unknown, correct, present, absent
    }
  }
  
  return keyboard;
}

function updateKeyboard(keyboard, guess, result) {
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i];
    const status = result[i];
    
    // Prioridade: correct > present > absent
    if (keyboard[letter] === 'correct') continue;
    if (status === 'correct') {
      keyboard[letter] = 'correct';
    } else if (status === 'present' && keyboard[letter] !== 'correct') {
      keyboard[letter] = 'present';
    } else if (status === 'absent' && keyboard[letter] === 'unknown') {
      keyboard[letter] = 'absent';
    }
  }
}

function formatKeyboard(keyboard) {
  const rows = [
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM'
  ];
  
  const icons = {
    unknown: '⬜',
    correct: '🟩',
    present: '🟨',
    absent: '⬛'
  };
  
  return rows.map(row => 
    row.split('').map(letter => 
      `${icons[keyboard[letter]]}${letter}`
    ).join(' ')
  ).join('\n');
}

function createWordleEmbed(game, status) {
  let color;
  switch (status) {
    case 'win': color = 0x57F287; break;
    case 'lose': 
    case 'give_up': color = 0xED4245; break;
    default: color = 0x5865F2;
  }
  
  // Formata grid de tentativas
  let grid = '';
  for (let i = 0; i < game.maxAttempts; i++) {
    if (game.attempts[i]) {
      const { guess, result } = game.attempts[i];
      const line = result.map((r, idx) => {
        const emoji = LETTER_COLORS[r];
        return `${emoji}`;
      }).join('');
      grid += `${line} ${guess}\n`;
    } else {
      grid += '⬜⬜⬜⬜⬜ _ _ _ _ _\n';
    }
  }
  
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('🟩 Wordle')
    .addFields(
      { name: '📊 Tentativas', value: grid, inline: false },
      { name: '⌨️ Teclado', value: formatKeyboard(game.keyboard), inline: false }
    )
    .setFooter({ text: `Tentativa ${game.attempts.length}/${game.maxAttempts}` })
    .setTimestamp();
  
  return embed;
}
