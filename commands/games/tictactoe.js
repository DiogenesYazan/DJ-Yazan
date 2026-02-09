const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { updateGameScore, GAME_POINTS } = require('./_gameUtils');

// Símbolos do jogo
const SYMBOLS = {
  empty: '⬜',
  x: '❌',
  o: '⭕'
};

// Jogos ativos
const activeGames = new Map();

// Combinações vencedoras
const WIN_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
  [0, 4, 8], [2, 4, 6]             // Diagonais
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('⭕ Jogo da Velha!')
    .addUserOption(option =>
      option.setName('oponente')
        .setDescription('Desafie outro usuário (opcional - joga contra o bot)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const opponent = interaction.options.getUser('oponente');
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    
    // Validações
    if (opponent?.id === userId) {
      return interaction.reply({ content: '❌ Você não pode jogar contra si mesmo!', ephemeral: true });
    }
    
    if (opponent?.bot && opponent.id !== interaction.client.user.id) {
      return interaction.reply({ content: '❌ Você não pode jogar contra outros bots!', ephemeral: true });
    }
    
    const gameKey = `ttt_${guildId}_${userId}`;
    
    if (activeGames.has(gameKey)) {
      return interaction.reply({ content: '❌ Você já tem um jogo em andamento!', ephemeral: true });
    }
    
    const isVsBot = !opponent || opponent.bot;
    
    const game = {
      board: Array(9).fill(null),
      player1: { id: userId, symbol: 'x', username: interaction.user.username },
      player2: isVsBot 
        ? { id: 'bot', symbol: 'o', username: 'Bot' }
        : { id: opponent.id, symbol: 'o', username: opponent.username },
      currentTurn: userId,
      isVsBot
    };
    
    activeGames.set(gameKey, game);
    
    const embed = createBoardEmbed(game, 'playing');
    const components = createBoardButtons(game.board);
    
    await interaction.reply({ 
      content: isVsBot ? null : `${opponent}, você foi desafiado para um jogo da velha!`,
      embeds: [embed], 
      components 
    });
    
    const message = await interaction.fetchReply();
    
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000, // 2 minutos
      filter: (i) => {
        if (!i.customId.startsWith('ttt_')) return false;
        const game = activeGames.get(gameKey);
        if (!game) return false;
        
        // Verifica se é a vez do jogador
        if (i.user.id === game.currentTurn) return true;
        if (game.isVsBot && i.user.id === game.player1.id) return true;
        
        return false;
      }
    });
    
    collector.on('collect', async (i) => {
      const game = activeGames.get(gameKey);
      if (!game) {
        collector.stop('ended');
        return;
      }
      
      const position = parseInt(i.customId.replace('ttt_', ''));
      
      if (game.board[position] !== null) {
        await i.reply({ content: '❌ Essa posição já está ocupada!', ephemeral: true });
        return;
      }
      
      // Faz a jogada
      const currentPlayer = game.currentTurn === game.player1.id ? game.player1 : game.player2;
      game.board[position] = currentPlayer.symbol;
      
      // Verifica vitória
      const winner = checkWinner(game.board);
      const isDraw = !winner && game.board.every(cell => cell !== null);
      
      if (winner) {
        activeGames.delete(gameKey);
        
        const winnerPlayer = winner === game.player1.symbol ? game.player1 : game.player2;
        const loserPlayer = winner === game.player1.symbol ? game.player2 : game.player1;
        
        // Atualiza pontuações
        if (winnerPlayer.id !== 'bot') {
          await updateGameScore(guildId, winnerPlayer.id, GAME_POINTS.TICTACTOE_WIN, true);
        }
        if (loserPlayer.id !== 'bot') {
          await updateGameScore(guildId, loserPlayer.id, GAME_POINTS.TICTACTOE_LOSE, false);
        }
        
        const embed = createBoardEmbed(game, 'win', winnerPlayer);
        const components = createBoardButtons(game.board, true);
        
        await i.update({ embeds: [embed], components });
        collector.stop('won');
      } else if (isDraw) {
        activeGames.delete(gameKey);
        
        // Ambos ganham pontos de empate
        await updateGameScore(guildId, game.player1.id, GAME_POINTS.TICTACTOE_TIE, false);
        if (game.player2.id !== 'bot') {
          await updateGameScore(guildId, game.player2.id, GAME_POINTS.TICTACTOE_TIE, false);
        }
        
        const embed = createBoardEmbed(game, 'draw');
        const components = createBoardButtons(game.board, true);
        
        await i.update({ embeds: [embed], components });
        collector.stop('draw');
      } else {
        // Próximo turno
        game.currentTurn = game.currentTurn === game.player1.id 
          ? (game.isVsBot ? game.player1.id : game.player2.id)
          : game.player1.id;
        
        // Se for vs bot e é vez do bot
        if (game.isVsBot && game.currentTurn === game.player1.id) {
          // Jogada do bot
          const botMove = getBotMove(game.board);
          if (botMove !== -1) {
            game.board[botMove] = game.player2.symbol;
            
            // Verifica vitória do bot
            const botWinner = checkWinner(game.board);
            const botDraw = !botWinner && game.board.every(cell => cell !== null);
            
            if (botWinner) {
              activeGames.delete(gameKey);
              
              await updateGameScore(guildId, game.player1.id, GAME_POINTS.TICTACTOE_LOSE, false);
              
              const embed = createBoardEmbed(game, 'win', game.player2);
              const components = createBoardButtons(game.board, true);
              
              await i.update({ embeds: [embed], components });
              collector.stop('bot_won');
              return;
            } else if (botDraw) {
              activeGames.delete(gameKey);
              
              await updateGameScore(guildId, game.player1.id, GAME_POINTS.TICTACTOE_TIE, false);
              
              const embed = createBoardEmbed(game, 'draw');
              const components = createBoardButtons(game.board, true);
              
              await i.update({ embeds: [embed], components });
              collector.stop('draw');
              return;
            }
          }
        }
        
        const embed = createBoardEmbed(game, 'playing');
        const components = createBoardButtons(game.board);
        
        await i.update({ embeds: [embed], components });
      }
    });
    
    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        activeGames.delete(gameKey);
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('⭕ Jogo da Velha - Tempo Esgotado')
          .setDescription('⏰ O jogo foi cancelado por inatividade.');
        
        interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      }
    });
  }
};

function checkWinner(board) {
  for (const combo of WIN_COMBINATIONS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function getBotMove(board) {
  // IA simples: primeiro tenta vencer, depois bloquear, depois joga aleatório
  
  // Tenta vencer
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = 'o';
      if (checkWinner(testBoard) === 'o') return i;
    }
  }
  
  // Bloqueia jogador
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const testBoard = [...board];
      testBoard[i] = 'x';
      if (checkWinner(testBoard) === 'x') return i;
    }
  }
  
  // Centro
  if (board[4] === null) return 4;
  
  // Cantos
  const corners = [0, 2, 6, 8].filter(i => board[i] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }
  
  // Qualquer posição disponível
  const available = board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  
  return -1;
}

function createBoardEmbed(game, status, winner = null) {
  let color, description;
  
  switch (status) {
    case 'playing':
      color = 0x5865F2;
      const currentPlayer = game.currentTurn === game.player1.id ? game.player1 : game.player2;
      description = `🎮 Vez de **${currentPlayer.username}** (${SYMBOLS[currentPlayer.symbol]})`;
      break;
    case 'win':
      color = 0x57F287;
      description = `🏆 **${winner.username}** venceu! (+${GAME_POINTS.TICTACTOE_WIN} pontos)`;
      break;
    case 'draw':
      color = 0xFEE75C;
      description = `🤝 **Empate!** (+${GAME_POINTS.TICTACTOE_TIE} pontos cada)`;
      break;
  }
  
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('⭕ Jogo da Velha')
    .setDescription(description)
    .addFields(
      { name: `${SYMBOLS.x} ${game.player1.username}`, value: 'Jogador 1', inline: true },
      { name: 'VS', value: '⚔️', inline: true },
      { name: `${SYMBOLS.o} ${game.player2.username}`, value: 'Jogador 2', inline: true }
    )
    .setTimestamp();
  
  return embed;
}

function createBoardButtons(board, disabled = false) {
  const rows = [];
  
  for (let row = 0; row < 3; row++) {
    const actionRow = new ActionRowBuilder();
    
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const cell = board[index];
      
      let style, label;
      if (cell === 'x') {
        style = ButtonStyle.Danger;
        label = '❌';
      } else if (cell === 'o') {
        style = ButtonStyle.Primary;
        label = '⭕';
      } else {
        style = ButtonStyle.Secondary;
        label = '⬜';
      }
      
      actionRow.addComponents(
        new ButtonBuilder()
          .setCustomId(`ttt_${index}`)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(disabled || cell !== null)
      );
    }
    
    rows.push(actionRow);
  }
  
  return rows;
}
