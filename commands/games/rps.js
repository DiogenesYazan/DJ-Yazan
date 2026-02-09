const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { updateGameScore, GAME_POINTS } = require('./_gameUtils');

// Emojis e nomes
const CHOICES = {
  rock: { emoji: '🪨', name: 'Pedra', beats: 'scissors' },
  paper: { emoji: '📄', name: 'Papel', beats: 'rock' },
  scissors: { emoji: '✂️', name: 'Tesoura', beats: 'paper' }
};

// Armazena desafios pendentes
const pendingChallenges = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('✂️ Pedra, Papel ou Tesoura!')
    .addUserOption(option =>
      option.setName('oponente')
        .setDescription('Desafie outro usuário (opcional - joga contra o bot)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const opponent = interaction.options.getUser('oponente');
    
    // Validações
    if (opponent?.id === interaction.user.id) {
      return interaction.reply({ content: '❌ Você não pode jogar contra si mesmo!', ephemeral: true });
    }
    
    if (opponent?.bot) {
      return interaction.reply({ content: '❌ Você não pode jogar contra um bot!', ephemeral: true });
    }
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('rps_rock')
          .setLabel('Pedra')
          .setEmoji('🪨')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('rps_paper')
          .setLabel('Papel')
          .setEmoji('📄')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('rps_scissors')
          .setLabel('Tesoura')
          .setEmoji('✂️')
          .setStyle(ButtonStyle.Secondary)
      );
    
    if (opponent) {
      // PvP Mode
      const challengeId = `${interaction.user.id}_${opponent.id}`;
      
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('✂️ Pedra, Papel ou Tesoura - Desafio PvP!')
        .setDescription(`${interaction.user} desafiou ${opponent} para uma partida!\n\n**Ambos devem escolher sua jogada:**`)
        .addFields(
          { name: `${interaction.user.username}`, value: '⏳ Aguardando...', inline: true },
          { name: 'VS', value: '⚔️', inline: true },
          { name: `${opponent.username}`, value: '⏳ Aguardando...', inline: true }
        )
        .setFooter({ text: 'Vocês têm 30 segundos para escolher!' });
      
      await interaction.reply({ embeds: [embed], components: [row] });
      
      const message = await interaction.fetchReply();
      
      // Estado do jogo
      const gameState = {
        player1: { id: interaction.user.id, choice: null, username: interaction.user.username },
        player2: { id: opponent.id, choice: null, username: opponent.username }
      };
      
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
        filter: (i) => i.customId.startsWith('rps_') && 
          (i.user.id === interaction.user.id || i.user.id === opponent.id)
      });
      
      collector.on('collect', async (i) => {
        const choice = i.customId.replace('rps_', '');
        
        if (i.user.id === gameState.player1.id) {
          if (gameState.player1.choice) {
            return i.reply({ content: '❌ Você já escolheu!', ephemeral: true });
          }
          gameState.player1.choice = choice;
          await i.reply({ content: `Você escolheu ${CHOICES[choice].emoji} ${CHOICES[choice].name}!`, ephemeral: true });
        } else if (i.user.id === gameState.player2.id) {
          if (gameState.player2.choice) {
            return i.reply({ content: '❌ Você já escolheu!', ephemeral: true });
          }
          gameState.player2.choice = choice;
          await i.reply({ content: `Você escolheu ${CHOICES[choice].emoji} ${CHOICES[choice].name}!`, ephemeral: true });
        }
        
        // Atualiza embed
        const updatedEmbed = new EmbedBuilder()
          .setColor(0x5865F2)
          .setTitle('✂️ Pedra, Papel ou Tesoura - Desafio PvP!')
          .setDescription(`${interaction.user} vs ${opponent}`)
          .addFields(
            { name: gameState.player1.username, value: gameState.player1.choice ? '✅ Escolheu!' : '⏳ Aguardando...', inline: true },
            { name: 'VS', value: '⚔️', inline: true },
            { name: gameState.player2.username, value: gameState.player2.choice ? '✅ Escolheu!' : '⏳ Aguardando...', inline: true }
          );
        
        await interaction.editReply({ embeds: [updatedEmbed] });
        
        // Ambos escolheram?
        if (gameState.player1.choice && gameState.player2.choice) {
          collector.stop('complete');
        }
      });
      
      collector.on('end', async (collected, reason) => {
        if (reason === 'complete') {
          // Determina vencedor
          const p1 = gameState.player1;
          const p2 = gameState.player2;
          
          let result, winner, loser, color;
          
          if (p1.choice === p2.choice) {
            result = 'tie';
            color = 0xFEE75C;
          } else if (CHOICES[p1.choice].beats === p2.choice) {
            result = 'p1wins';
            winner = p1;
            loser = p2;
            color = 0x57F287;
          } else {
            result = 'p2wins';
            winner = p2;
            loser = p1;
            color = 0x57F287;
          }
          
          // Atualiza pontuações
          if (result === 'tie') {
            await updateGameScore(interaction.guild.id, p1.id, GAME_POINTS.RPS_TIE, false);
            await updateGameScore(interaction.guild.id, p2.id, GAME_POINTS.RPS_TIE, false);
          } else {
            await updateGameScore(interaction.guild.id, winner.id, GAME_POINTS.RPS_WIN, true);
            await updateGameScore(interaction.guild.id, loser.id, GAME_POINTS.RPS_LOSE, false);
          }
          
          const resultEmbed = new EmbedBuilder()
            .setColor(color)
            .setTitle('✂️ Pedra, Papel ou Tesoura - Resultado!')
            .addFields(
              { name: p1.username, value: `${CHOICES[p1.choice].emoji} ${CHOICES[p1.choice].name}`, inline: true },
              { name: 'VS', value: '⚔️', inline: true },
              { name: p2.username, value: `${CHOICES[p2.choice].emoji} ${CHOICES[p2.choice].name}`, inline: true }
            )
            .setDescription(
              result === 'tie' 
                ? `🤝 **Empate!** Ambos ganham +${GAME_POINTS.RPS_TIE} pontos`
                : `🏆 **${winner.username}** venceu! (+${GAME_POINTS.RPS_WIN} pontos)`
            )
            .setTimestamp();
          
          await interaction.editReply({ embeds: [resultEmbed], components: [] });
        } else {
          // Timeout
          const timeoutEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('✂️ Pedra, Papel ou Tesoura - Cancelado')
            .setDescription('⏰ Tempo esgotado! Nem todos os jogadores escolheram.');
          
          await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
        }
      });
      
    } else {
      // VS Bot Mode
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('✂️ Pedra, Papel ou Tesoura')
        .setDescription(`${interaction.user}, escolha sua jogada!\n\n🪨 Pedra | 📄 Papel | ✂️ Tesoura`)
        .setFooter({ text: 'Você tem 15 segundos!' });
      
      await interaction.reply({ embeds: [embed], components: [row] });
      
      const message = await interaction.fetchReply();
      
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15000,
        filter: (i) => i.customId.startsWith('rps_') && i.user.id === interaction.user.id,
        max: 1
      });
      
      collector.on('collect', async (i) => {
        const playerChoice = i.customId.replace('rps_', '');
        const botChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
        
        let result, color, points, won;
        
        if (playerChoice === botChoice) {
          result = `🤝 **Empate!**`;
          color = 0xFEE75C;
          points = GAME_POINTS.RPS_TIE;
          won = false;
        } else if (CHOICES[playerChoice].beats === botChoice) {
          result = `🏆 **Você venceu!**`;
          color = 0x57F287;
          points = GAME_POINTS.RPS_WIN;
          won = true;
        } else {
          result = `😢 **Você perdeu!**`;
          color = 0xED4245;
          points = GAME_POINTS.RPS_LOSE;
          won = false;
        }
        
        await updateGameScore(interaction.guild.id, i.user.id, points, won);
        
        const resultEmbed = new EmbedBuilder()
          .setColor(color)
          .setTitle('✂️ Pedra, Papel ou Tesoura - Resultado!')
          .addFields(
            { name: 'Você', value: `${CHOICES[playerChoice].emoji} ${CHOICES[playerChoice].name}`, inline: true },
            { name: 'VS', value: '⚔️', inline: true },
            { name: 'Bot', value: `${CHOICES[botChoice].emoji} ${CHOICES[botChoice].name}`, inline: true }
          )
          .setDescription(`${result}\n+${points} pontos`)
          .setFooter({ text: interaction.user.username })
          .setTimestamp();
        
        await i.update({ embeds: [resultEmbed], components: [] });
      });
      
      collector.on('end', (collected, reason) => {
        if (reason === 'time') {
          const timeoutEmbed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('✂️ Pedra, Papel ou Tesoura')
            .setDescription('⏰ Tempo esgotado!');
          
          interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
        }
      });
    }
  }
};
