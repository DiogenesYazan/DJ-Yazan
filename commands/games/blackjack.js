const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { updateGameScore, GAME_POINTS } = require('./_gameUtils');

// Baralho
const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value, display: `${value}${suit}` });
    }
  }
  return shuffle(deck);
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getCardValue(card) {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11; // Tratamos Ás como 11 inicialmente
  return parseInt(card.value);
}

function calculateHand(hand) {
  let total = 0;
  let aces = 0;
  
  for (const card of hand) {
    const value = getCardValue(card);
    total += value;
    if (card.value === 'A') aces++;
  }
  
  // Ajusta Ases de 11 para 1 se necessário
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  
  return total;
}

function formatHand(hand, hideSecond = false) {
  if (hideSecond && hand.length >= 2) {
    return `${hand[0].display} 🂠`;
  }
  return hand.map(c => c.display).join(' ');
}

function getHandEmoji(total) {
  if (total === 21) return '🎯';
  if (total > 21) return '💥';
  if (total >= 17) return '👍';
  return '🎴';
}

// Armazena jogos ativos
const activeGames = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('🃏 Jogue Blackjack (21) contra o dealer!'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const gameKey = `${interaction.guild.id}_${userId}`;
    
    if (activeGames.has(gameKey)) {
      return interaction.reply({ content: '❌ Você já tem um jogo de Blackjack em andamento!', ephemeral: true });
    }
    
    // Cria jogo
    const deck = createDeck();
    const playerHand = [deck.pop(), deck.pop()];
    const dealerHand = [deck.pop(), deck.pop()];
    
    const game = {
      deck,
      playerHand,
      dealerHand,
      status: 'playing'
    };
    
    activeGames.set(gameKey, game);
    
    const playerTotal = calculateHand(playerHand);
    const dealerVisible = getCardValue(dealerHand[0]);
    
    // Verifica Blackjack natural
    if (playerTotal === 21) {
      game.status = 'blackjack';
      activeGames.delete(gameKey);
      
      const dealerTotal = calculateHand(dealerHand);
      
      if (dealerTotal === 21) {
        // Empate com Blackjack
        await updateGameScore(interaction.guild.id, userId, GAME_POINTS.BLACKJACK_TIE, false);
        
        const embed = createGameEmbed(playerHand, dealerHand, false, 'push');
        return interaction.reply({ embeds: [embed] });
      }
      
      // Vitória com Blackjack
      await updateGameScore(interaction.guild.id, userId, GAME_POINTS.BLACKJACK_BLACKJACK, true);
      
      const embed = createGameEmbed(playerHand, dealerHand, false, 'blackjack');
      return interaction.reply({ embeds: [embed] });
    }
    
    // Jogo normal
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('bj_hit')
          .setLabel('🎴 Comprar')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('bj_stand')
          .setLabel('✋ Parar')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('bj_double')
          .setLabel('💰 Dobrar')
          .setStyle(ButtonStyle.Success)
          .setDisabled(playerHand.length !== 2)
      );
    
    const embed = createGameEmbed(playerHand, dealerHand, true, 'playing');
    
    await interaction.reply({ embeds: [embed], components: [row] });
    
    const message = await interaction.fetchReply();
    
    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
      filter: (i) => i.user.id === userId && i.customId.startsWith('bj_')
    });
    
    collector.on('collect', async (i) => {
      try {
        // Evita double-click
        if (i.replied || i.deferred) return;
        
        const game = activeGames.get(gameKey);
        if (!game) return;
      
      if (i.customId === 'bj_hit' || i.customId === 'bj_double') {
        // Comprar carta
        game.playerHand.push(game.deck.pop());
        const playerTotal = calculateHand(game.playerHand);
        
        if (i.customId === 'bj_double') {
          // Dobrou - só pode comprar uma carta e para
          if (playerTotal > 21) {
            // Estourou
            game.status = 'bust';
            activeGames.delete(gameKey);
            
            await updateGameScore(interaction.guild.id, userId, GAME_POINTS.BLACKJACK_LOSE, false);
            
            const embed = createGameEmbed(game.playerHand, game.dealerHand, false, 'bust');
            await i.update({ embeds: [embed], components: [] });
            collector.stop('ended');
          } else {
            // Para automaticamente após dobrar
            await dealerPlay(interaction, i, game, gameKey, userId, collector);
          }
          return;
        }
        
        if (playerTotal > 21) {
          // Estourou
          game.status = 'bust';
          activeGames.delete(gameKey);
          
          await updateGameScore(interaction.guild.id, userId, GAME_POINTS.BLACKJACK_LOSE, false);
          
          const embed = createGameEmbed(game.playerHand, game.dealerHand, false, 'bust');
          await i.update({ embeds: [embed], components: [] });
          collector.stop('ended');
        } else if (playerTotal === 21) {
          // 21! Dealer joga
          await dealerPlay(interaction, i, game, gameKey, userId, collector);
        } else {
          // Continua jogando
          const newRow = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('bj_hit')
                .setLabel('🎴 Comprar')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('bj_stand')
                .setLabel('✋ Parar')
                .setStyle(ButtonStyle.Secondary)
            );
          
          const embed = createGameEmbed(game.playerHand, game.dealerHand, true, 'playing');
          await i.update({ embeds: [embed], components: [newRow] });
        }
      } else if (i.customId === 'bj_stand') {
        // Parar - dealer joga
        await dealerPlay(interaction, i, game, gameKey, userId, collector);
      }
      } catch (error) {
        if (error.code !== 40060) console.error('Erro no Blackjack:', error);
      }
    });
    
    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        activeGames.delete(gameKey);
        const timeoutEmbed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('🃏 Blackjack - Tempo Esgotado')
          .setDescription('⏰ O jogo foi cancelado por inatividade.');
        
        interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      }
    });
  }
};

async function dealerPlay(interaction, buttonInteraction, game, gameKey, userId, collector) {
  let dealerTotal = calculateHand(game.dealerHand);
  
  // Dealer compra até ter 17 ou mais
  while (dealerTotal < 17) {
    game.dealerHand.push(game.deck.pop());
    dealerTotal = calculateHand(game.dealerHand);
  }
  
  const playerTotal = calculateHand(game.playerHand);
  
  let result, points, won;
  
  if (dealerTotal > 21) {
    // Dealer estourou
    result = 'dealer_bust';
    points = GAME_POINTS.BLACKJACK_WIN;
    won = true;
  } else if (playerTotal > dealerTotal) {
    // Jogador vence
    result = 'win';
    points = GAME_POINTS.BLACKJACK_WIN;
    won = true;
  } else if (playerTotal < dealerTotal) {
    // Dealer vence
    result = 'lose';
    points = GAME_POINTS.BLACKJACK_LOSE;
    won = false;
  } else {
    // Empate
    result = 'push';
    points = GAME_POINTS.BLACKJACK_TIE;
    won = false;
  }
  
  activeGames.delete(gameKey);
  await updateGameScore(interaction.guild.id, userId, points, won);
  
  const embed = createGameEmbed(game.playerHand, game.dealerHand, false, result);
  await buttonInteraction.update({ embeds: [embed], components: [] });
  collector.stop('ended');
}

function createGameEmbed(playerHand, dealerHand, hideDealer, status) {
  const playerTotal = calculateHand(playerHand);
  const dealerTotal = hideDealer ? getCardValue(dealerHand[0]) : calculateHand(dealerHand);
  
  let color, title, description;
  
  switch (status) {
    case 'playing':
      color = 0x5865F2;
      title = '🃏 Blackjack';
      description = 'Escolha sua ação!';
      break;
    case 'blackjack':
      color = 0xFFD700;
      title = '🃏 BLACKJACK! 🎉';
      description = `✨ **BLACKJACK NATURAL!** +${GAME_POINTS.BLACKJACK_BLACKJACK} pontos!`;
      break;
    case 'win':
      color = 0x57F287;
      title = '🃏 Você Venceu! 🏆';
      description = `**Parabéns!** +${GAME_POINTS.BLACKJACK_WIN} pontos!`;
      break;
    case 'dealer_bust':
      color = 0x57F287;
      title = '🃏 Dealer Estourou! 🏆';
      description = `**O dealer passou de 21!** +${GAME_POINTS.BLACKJACK_WIN} pontos!`;
      break;
    case 'lose':
      color = 0xED4245;
      title = '🃏 Você Perdeu 😢';
      description = `Dealer venceu! +${GAME_POINTS.BLACKJACK_LOSE} pontos de participação.`;
      break;
    case 'bust':
      color = 0xED4245;
      title = '🃏 Estourou! 💥';
      description = `Você passou de 21! +${GAME_POINTS.BLACKJACK_LOSE} pontos de participação.`;
      break;
    case 'push':
      color = 0xFEE75C;
      title = '🃏 Empate! 🤝';
      description = `Mesma pontuação! +${GAME_POINTS.BLACKJACK_TIE} pontos.`;
      break;
    default:
      color = 0x5865F2;
      title = '🃏 Blackjack';
      description = '';
  }
  
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .addFields(
      { 
        name: `🎴 Suas Cartas (${playerTotal}) ${getHandEmoji(playerTotal)}`, 
        value: formatHand(playerHand), 
        inline: false 
      },
      { 
        name: `🎰 Dealer ${hideDealer ? `(${dealerTotal}+?)` : `(${calculateHand(dealerHand)})`} ${hideDealer ? '🂠' : getHandEmoji(calculateHand(dealerHand))}`, 
        value: formatHand(dealerHand, hideDealer), 
        inline: false 
      }
    )
    .setFooter({ text: 'Blackjack paga 3:2 • Dealer para em 17' })
    .setTimestamp();
  
  return embed;
}
