const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { updateGameScore, GAME_POINTS } = require('./_gameUtils');

// Constantes do jogo
const ROWS = 6;
const COLS = 7;
const EMPTY = '⚫';
const PLAYER_COLORS = {
  1: '🔴',
  2: '🟡'
};

// Jogos ativos
const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('connect4')
    .setDescription('🔴 Conecte 4!')
    .addUserOption(option =>
      option.setName('oponente')
        .setDescription('Desafie outro usuário')
        .setRequired(true)
    ),

  async execute(interaction) {
    const opponent = interaction.options.getUser('oponente');
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    
    // Validações
    if (opponent.id === userId) {
      return interaction.reply({ content: '❌ Você não pode jogar contra si mesmo!', ephemeral: true });
    }
    
    if (opponent.bot) {
      return interaction.reply({ content: '❌ Você não pode jogar contra um bot! (Em breve...)', ephemeral: true });
    }
    
    const gameKey = `c4_${guildId}_${Math.min(parseInt(userId), parseInt(opponent.id))}_${Math.max(parseInt(userId), parseInt(opponent.id))}`;
    
    if (activeGames.has(gameKey)) {
      return interaction.reply({ content: '❌ Já existe um jogo entre vocês!', ephemeral: true });
    }
    
    // Randomiza quem começa
    const starterIsChallenger = Math.random() < 0.5;
    
    const game = {
      board: Array(ROWS).fill(null).map(() => Array(COLS).fill(0)),
      player1: { 
        id: starterIsChallenger ? userId : opponent.id, 
        color: 1, 
        username: starterIsChallenger ? interaction.user.username : opponent.username 
      },
      player2: { 
        id: starterIsChallenger ? opponent.id : userId, 
        color: 2, 
        username: starterIsChallenger ? opponent.username : interaction.user.username 
      },
      currentTurn: 1 // Jogador 1 sempre começa
    };
    
    activeGames.set(gameKey, game);
    
    const embed = createBoardEmbed(game, 'playing');
    const components = createColumnButtons(game.board);
    
    await interaction.reply({ 
      content: `${opponent}, você foi desafiado para Connect 4!`,
      embeds: [embed], 
      components 
    });
    
    const message = await interaction.fetchReply();
    
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000, // 5 minutos
      filter: (i) => {
        if (!i.customId.startsWith('c4_')) return false;
        const game = activeGames.get(gameKey);
        if (!game) return false;
        
        const currentPlayer = game.currentTurn === 1 ? game.player1 : game.player2;
        return i.user.id === currentPlayer.id;
      }
    });
    
    collector.on('collect', async (i) => {
      try {
        // Evita double-click
        if (i.replied || i.deferred) return;
        
        const game = activeGames.get(gameKey);
        if (!game) {
          collector.stop('ended');
          return;
        }
      
      const col = parseInt(i.customId.replace('c4_', ''));
      
      // Encontra a linha disponível na coluna
      let row = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (game.board[r][col] === 0) {
          row = r;
          break;
        }
      }
      
      if (row === -1) {
        await i.reply({ content: '❌ Essa coluna está cheia!', ephemeral: true });
        return;
      }
      
      // Faz a jogada
      const currentPlayer = game.currentTurn === 1 ? game.player1 : game.player2;
      game.board[row][col] = game.currentTurn;
      
      // Verifica vitória
      const winner = checkWinner(game.board, row, col, game.currentTurn);
      const isDraw = !winner && game.board[0].every((_, c) => isColumnFull(game.board, c));
      
      if (winner) {
        activeGames.delete(gameKey);
        
        const loserPlayer = game.currentTurn === 1 ? game.player2 : game.player1;
        
        await updateGameScore(guildId, currentPlayer.id, GAME_POINTS.CONNECT4_WIN, true);
        await updateGameScore(guildId, loserPlayer.id, GAME_POINTS.CONNECT4_LOSE, false);
        
        const embed = createBoardEmbed(game, 'win', currentPlayer);
        
        await i.update({ embeds: [embed], components: [] });
        collector.stop('won');
      } else if (isDraw) {
        activeGames.delete(gameKey);
        
        await updateGameScore(guildId, game.player1.id, 15, false);
        await updateGameScore(guildId, game.player2.id, 15, false);
        
        const embed = createBoardEmbed(game, 'draw');
        
        await i.update({ embeds: [embed], components: [] });
        collector.stop('draw');
      } else {
        // Próximo turno
        game.currentTurn = game.currentTurn === 1 ? 2 : 1;
        
        const embed = createBoardEmbed(game, 'playing');
        const components = createColumnButtons(game.board);
        
        await i.update({ embeds: [embed], components });
      }
      } catch (error) {
        if (error.code !== 40060) console.error('Erro no Connect4:', error);
      }
    });
    
    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        activeGames.delete(gameKey);
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('🔴 Connect 4 - Tempo Esgotado')
          .setDescription('⏰ O jogo foi cancelado por inatividade.');
        
        interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      }
    });
  }
};

function isColumnFull(board, col) {
  return board[0][col] !== 0;
}

function checkWinner(board, row, col, player) {
  const directions = [
    [0, 1],   // Horizontal
    [1, 0],   // Vertical
    [1, 1],   // Diagonal \
    [1, -1]   // Diagonal /
  ];
  
  for (const [dr, dc] of directions) {
    let count = 1;
    
    // Conta em uma direção
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
      } else {
        break;
      }
    }
    
    // Conta na direção oposta
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
      } else {
        break;
      }
    }
    
    if (count >= 4) return true;
  }
  
  return false;
}

function createBoardEmbed(game, status, winner = null) {
  let color, description;
  
  switch (status) {
    case 'playing':
      color = 0x5865F2;
      const currentPlayer = game.currentTurn === 1 ? game.player1 : game.player2;
      description = `🎮 Vez de **${currentPlayer.username}** (${PLAYER_COLORS[currentPlayer.color]})`;
      break;
    case 'win':
      color = 0x57F287;
      description = `🏆 **${winner.username}** venceu conectando 4! (+${GAME_POINTS.CONNECT4_WIN} pontos)`;
      break;
    case 'draw':
      color = 0xFEE75C;
      description = `🤝 **Empate!** O tabuleiro está cheio! (+15 pontos cada)`;
      break;
  }
  
  // Renderiza o tabuleiro
  let boardStr = '1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣\n';
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = game.board[row][col];
      boardStr += cell === 0 ? EMPTY : PLAYER_COLORS[cell];
    }
    boardStr += '\n';
  }
  
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle('🔴 Connect 4')
    .setDescription(description + '\n\n' + boardStr)
    .addFields(
      { name: `${PLAYER_COLORS[1]} ${game.player1.username}`, value: 'Jogador 1', inline: true },
      { name: 'VS', value: '⚔️', inline: true },
      { name: `${PLAYER_COLORS[2]} ${game.player2.username}`, value: 'Jogador 2', inline: true }
    )
    .setFooter({ text: 'Conecte 4 peças para vencer!' })
    .setTimestamp();
  
  return embed;
}

function createColumnButtons(board) {
  const rows = [];
  
  // Primeira linha: colunas 1-5
  const row1 = new ActionRowBuilder();
  for (let col = 0; col < 5; col++) {
    const isFull = isColumnFull(board, col);
    
    row1.addComponents(
      new ButtonBuilder()
        .setCustomId(`c4_${col}`)
        .setLabel(`${col + 1}`)
        .setStyle(isFull ? ButtonStyle.Secondary : ButtonStyle.Primary)
        .setDisabled(isFull)
    );
  }
  rows.push(row1);
  
  // Segunda linha: colunas 6-7
  const row2 = new ActionRowBuilder();
  for (let col = 5; col < COLS; col++) {
    const isFull = isColumnFull(board, col);
    
    row2.addComponents(
      new ButtonBuilder()
        .setCustomId(`c4_${col}`)
        .setLabel(`${col + 1}`)
        .setStyle(isFull ? ButtonStyle.Secondary : ButtonStyle.Primary)
        .setDisabled(isFull)
    );
  }
  rows.push(row2);
  
  return rows;
}
