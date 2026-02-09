const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { updateGameScore, GAME_POINTS } = require('./_gameUtils');

// Jogos ativos (para evitar spam)
const activePlayers = new Map();

// Emojis de animação
const COUNTDOWN_EMOJIS = ['🔴', '🟡', '🟢'];
const WAIT_MESSAGES = [
  '⏳ Aguarde...',
  '👀 Prepare-se...',
  '⚡ Fique atento...',
  '🎯 Concentre-se...',
  '⏰ Quase lá...'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reaction')
    .setDescription('⚡ Teste sua velocidade de reação!')
    .addSubcommand(subcommand =>
      subcommand.setName('solo')
        .setDescription('Jogue sozinho e tente seu melhor tempo')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('duel')
        .setDescription('Desafie outro jogador')
        .addUserOption(option =>
          option.setName('oponente')
            .setDescription('Quem você quer desafiar')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    
    // Anti-spam
    if (activePlayers.has(userId)) {
      return interaction.reply({ content: '⏳ Aguarde seu jogo atual terminar!', ephemeral: true });
    }
    
    if (subcommand === 'solo') {
      await playSolo(interaction, guildId, userId);
    } else {
      await playDuel(interaction, guildId, userId);
    }
  }
};

async function playSolo(interaction, guildId, userId) {
  activePlayers.set(userId, true);
  
  const waitEmbed = new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle('⚡ Teste de Reação')
    .setDescription(WAIT_MESSAGES[Math.floor(Math.random() * WAIT_MESSAGES.length)])
    .addFields({ name: '📋 Regras', value: 'Clique no botão **assim que** ele ficar 🟢 verde!' })
    .setFooter({ text: 'Não clique antes!' });
  
  const waitButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('reaction_wait')
      .setLabel('⏳ Aguarde...')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );
  
  await interaction.reply({ embeds: [waitEmbed], components: [waitButton] });
  const message = await interaction.fetchReply();
  
  // Tempo aleatório entre 2-6 segundos
  const randomDelay = 2000 + Math.floor(Math.random() * 4000);
  
  // Detecta clique antecipado
  let clickedEarly = false;
  const earlyCollector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === userId,
    time: randomDelay
  });
  
  earlyCollector.on('collect', async (i) => {
    clickedEarly = true;
    activePlayers.delete(userId);
    
    const failEmbed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('⚡ Teste de Reação - Falha!')
      .setDescription('❌ **Você clicou cedo demais!**\n\nVocê precisa esperar o botão ficar verde!')
      .setFooter({ text: 'Tente novamente com /reaction solo' });
    
    await i.update({ embeds: [failEmbed], components: [] });
  });
  
  await new Promise(resolve => setTimeout(resolve, randomDelay));
  earlyCollector.stop();
  
  if (clickedEarly) return;
  
  // Hora de clicar!
  const startTime = Date.now();
  
  const goEmbed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('⚡ AGORA!')
    .setDescription('🟢 **CLIQUE AGORA!**')
    .setTimestamp();
  
  const goButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('reaction_go')
      .setLabel('🟢 CLIQUE!')
      .setStyle(ButtonStyle.Success)
  );
  
  await interaction.editReply({ embeds: [goEmbed], components: [goButton] });
  
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === userId && i.customId === 'reaction_go',
    time: 10000,
    max: 1
  });
  
  collector.on('collect', async (i) => {
    activePlayers.delete(userId);
    
    const reactionTime = Date.now() - startTime;
    
    let rating, color, points;
    if (reactionTime < 200) {
      rating = '🏆 INCRÍVEL!';
      color = 0x57F287;
      points = GAME_POINTS.REACTION_WIN + GAME_POINTS.REACTION_FAST;
    } else if (reactionTime < 300) {
      rating = '⚡ Muito Rápido!';
      color = 0x57F287;
      points = GAME_POINTS.REACTION_WIN;
    } else if (reactionTime < 500) {
      rating = '✅ Bom!';
      color = 0xFEE75C;
      points = GAME_POINTS.REACTION_FAST;
    } else {
      rating = '🐌 Lento...';
      color = 0xED4245;
      points = GAME_POINTS.REACTION_LOSE;
    }
    
    await updateGameScore(guildId, userId, points, reactionTime < 500);
    
    const resultEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle('⚡ Resultado')
      .setDescription(`${rating}\n\n⏱️ Tempo de reação: **${reactionTime}ms**`)
      .addFields({ name: '🎮 Pontos', value: `+${points}`, inline: true })
      .setFooter({ text: 'Use /reaction solo para tentar novamente!' });
    
    await i.update({ embeds: [resultEmbed], components: [] });
  });
  
  collector.on('end', (collected, reason) => {
    activePlayers.delete(userId);
    
    if (collected.size === 0) {
      const timeoutEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('⚡ Teste de Reação - Tempo Esgotado')
        .setDescription('⏰ Você demorou demais para reagir!');
      
      interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
    }
  });
}

async function playDuel(interaction, guildId, userId) {
  const opponent = interaction.options.getUser('oponente');
  
  if (opponent.id === userId) {
    return interaction.reply({ content: '❌ Você não pode desafiar a si mesmo!', ephemeral: true });
  }
  
  if (opponent.bot) {
    return interaction.reply({ content: '❌ Você não pode desafiar um bot!', ephemeral: true });
  }
  
  if (activePlayers.has(opponent.id)) {
    return interaction.reply({ content: '❌ Esse jogador já está em um jogo!', ephemeral: true });
  }
  
  activePlayers.set(userId, true);
  activePlayers.set(opponent.id, true);
  
  const challengeEmbed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('⚡ Duelo de Reação')
    .setDescription(`${interaction.user} desafiou ${opponent} para um duelo de reação!\n\n⏳ **Aguardem o sinal verde...**`)
    .addFields({ name: '📋 Regras', value: 'O primeiro a clicar quando o botão ficar 🟢 verde vence!' });
  
  const waitButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('duel_wait')
      .setLabel('⏳ Aguardando...')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true)
  );
  
  await interaction.reply({ embeds: [challengeEmbed], components: [waitButton] });
  const message = await interaction.fetchReply();
  
  // Tempo aleatório entre 3-7 segundos
  const randomDelay = 3000 + Math.floor(Math.random() * 4000);
  
  // Detecta clique antecipado
  const participants = new Set([userId, opponent.id]);
  let earlyClicker = null;
  
  const earlyCollector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => participants.has(i.user.id),
    time: randomDelay
  });
  
  earlyCollector.on('collect', async (i) => {
    earlyClicker = i.user;
    activePlayers.delete(userId);
    activePlayers.delete(opponent.id);
    
    const winner = i.user.id === userId ? opponent : interaction.user;
    
    await updateGameScore(guildId, winner.id, GAME_POINTS.REACTION_WIN, true);
    await updateGameScore(guildId, i.user.id, 0, false);
    
    const failEmbed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('⚡ Duelo de Reação - Fim!')
      .setDescription(`❌ **${i.user.username}** clicou cedo demais!\n\n🏆 **${winner.username}** vence por W.O.!`)
      .addFields({ name: '🎮 Prêmio', value: `${winner} ganhou +${GAME_POINTS.REACTION_WIN} pontos!` });
    
    await i.update({ embeds: [failEmbed], components: [] });
  });
  
  await new Promise(resolve => setTimeout(resolve, randomDelay));
  earlyCollector.stop();
  
  if (earlyClicker) return;
  
  // Hora de clicar!
  const startTime = Date.now();
  const reactions = new Map();
  
  const goEmbed = new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle('⚡ AGORA!')
    .setDescription('🟢 **QUEM VAI CLICAR PRIMEIRO?**')
    .setTimestamp();
  
  const goButton = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('duel_go')
      .setLabel('🟢 CLIQUE!')
      .setStyle(ButtonStyle.Success)
  );
  
  await interaction.editReply({ embeds: [goEmbed], components: [goButton] });
  
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => participants.has(i.user.id) && i.customId === 'duel_go',
    time: 10000
  });
  
  collector.on('collect', async (i) => {
    const reactionTime = Date.now() - startTime;
    
    if (!reactions.has(i.user.id)) {
      reactions.set(i.user.id, { user: i.user, time: reactionTime });
      await i.deferUpdate();
      
      // Se ambos clicaram, determina o vencedor
      if (reactions.size === 2) {
        collector.stop('completed');
      }
    }
  });
  
  collector.on('end', async () => {
    activePlayers.delete(userId);
    activePlayers.delete(opponent.id);
    
    if (reactions.size === 0) {
      const timeoutEmbed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('⚡ Duelo de Reação - Cancelado')
        .setDescription('⏰ Ninguém reagiu a tempo!');
      
      await interaction.editReply({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
      return;
    }
    
    const players = Array.from(reactions.values()).sort((a, b) => a.time - b.time);
    const winner = players[0];
    const loser = players[1];
    
    await updateGameScore(guildId, winner.user.id, GAME_POINTS.REACTION_WIN, true);
    if (loser) {
      await updateGameScore(guildId, loser.user.id, GAME_POINTS.REACTION_LOSE, false);
    }
    
    let description = `🏆 **${winner.user.username}** venceu com **${winner.time}ms**!\n`;
    if (loser) {
      description += `🥈 **${loser.user.username}** reagiu em **${loser.time}ms**`;
      description += `\n\n⏱️ Diferença: **${loser.time - winner.time}ms**`;
    } else {
      const otherPlayer = winner.user.id === userId ? opponent : interaction.user;
      description += `\n❌ **${otherPlayer.username}** não reagiu!`;
    }
    
    const resultEmbed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle('⚡ Duelo de Reação - Resultado')
      .setDescription(description)
      .addFields({ name: '🎮 Pontos', value: `${winner.user} ganhou +${GAME_POINTS.REACTION_WIN} pontos!` })
      .setFooter({ text: 'Use /reaction duel para outro duelo!' });
    
    await interaction.editReply({ embeds: [resultEmbed], components: [] }).catch(() => {});
  });
}
