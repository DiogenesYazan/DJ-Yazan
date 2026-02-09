const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { updateGameScore, GAME_POINTS } = require('./_gameUtils');

// Emojis para slots
const SLOT_EMOJIS = ['🍒', '🍋', '🍊', '🍇', '🍉', '💎', '7️⃣', '🎰'];

// Multiplicadores de prêmio
const REWARDS = {
  '7️⃣7️⃣7️⃣': { name: 'MEGA JACKPOT!', multiplier: 10, points: GAME_POINTS.SLOTS_JACKPOT },
  '💎💎💎': { name: 'JACKPOT DIAMANTE!', multiplier: 7, points: GAME_POINTS.SLOTS_JACKPOT },
  '🎰🎰🎰': { name: 'JACKPOT!', multiplier: 5, points: GAME_POINTS.SLOTS_MEDIUM },
  'triple': { name: 'TRIPLO!', multiplier: 3, points: GAME_POINTS.SLOTS_MEDIUM },
  'double': { name: 'DUPLA!', multiplier: 1.5, points: GAME_POINTS.SLOTS_SMALL },
  'lose': { name: 'Tente novamente!', multiplier: 0, points: GAME_POINTS.SLOTS_LOSE }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('🎰 Jogue no caça-níquel!'),

  async execute(interaction) {
    // Gera resultado
    const result = [
      SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)],
      SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)],
      SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]
    ];
    
    // Animação de spin
    const spinFrames = [
      ['🔄', '🔄', '🔄'],
      [result[0], '🔄', '🔄'],
      [result[0], result[1], '🔄'],
      result
    ];
    
    const spinEmbed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🎰 Caça-Níquel')
      .setDescription(`
╔═══════════════╗
║  ${spinFrames[0].join(' │ ')}  ║
╚═══════════════╝
      `)
      .setFooter({ text: 'Girando...' });
    
    await interaction.reply({ embeds: [spinEmbed] });
    
    // Animação progressiva
    for (let i = 1; i < spinFrames.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const frameEmbed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🎰 Caça-Níquel')
        .setDescription(`
╔═══════════════╗
║  ${spinFrames[i].join(' │ ')}  ║
╚═══════════════╝
        `)
        .setFooter({ text: i < spinFrames.length - 1 ? 'Girando...' : 'Resultado!' });
      
      await interaction.editReply({ embeds: [frameEmbed] });
    }
    
    // Calcula resultado
    const resultKey = result.join('');
    let reward;
    let won = false;
    
    if (REWARDS[resultKey]) {
      // Jackpot específico (777, 💎💎💎, 🎰🎰🎰)
      reward = REWARDS[resultKey];
      won = true;
    } else if (result[0] === result[1] && result[1] === result[2]) {
      // Triplo genérico
      reward = REWARDS['triple'];
      won = true;
    } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
      // Dupla
      reward = REWARDS['double'];
      won = true;
    } else {
      // Perdeu
      reward = REWARDS['lose'];
    }
    
    await updateGameScore(
      interaction.guild.id,
      interaction.user.id,
      reward.points,
      won
    );
    
    // Determina cor
    let color;
    if (reward.points >= GAME_POINTS.SLOTS_JACKPOT) {
      color = 0xFFD700; // Dourado para jackpot
    } else if (reward.points >= GAME_POINTS.SLOTS_MEDIUM) {
      color = 0x57F287; // Verde para médio
    } else if (reward.points >= GAME_POINTS.SLOTS_SMALL) {
      color = 0x5865F2; // Azul para pequeno
    } else {
      color = 0x99AAB5; // Cinza para perda
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const finalEmbed = new EmbedBuilder()
      .setColor(color)
      .setTitle('🎰 Caça-Níquel')
      .setDescription(`
╔═══════════════╗
║  ${result.join(' │ ')}  ║
╚═══════════════╝

${won ? '🎉' : '😢'} **${reward.name}**
      `)
      .addFields(
        { name: '🏆 Pontos', value: `+${reward.points}`, inline: true }
      )
      .setFooter({ text: `${interaction.user.username}` })
      .setTimestamp();
    
    // Efeito especial para jackpot
    if (reward.points >= GAME_POINTS.SLOTS_JACKPOT) {
      finalEmbed.setDescription(`
╔═══════════════╗
║  ${result.join(' │ ')}  ║
╚═══════════════╝

🎊🎉 **${reward.name}** 🎉🎊
✨ PARABÉNS! ✨
      `);
    }
    
    // Botão para jogar novamente
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('slots_spin')
          .setLabel('🎰 Girar novamente!')
          .setStyle(ButtonStyle.Success)
      );
    
    await interaction.editReply({ embeds: [finalEmbed], components: [row] });
    
    // Collector para replay
    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId === 'slots_spin' && i.user.id === interaction.user.id,
      time: 30000,
      max: 1
    });
    
    collector.on('collect', async (i) => {
      try {
        // Evita double-click
        if (i.replied || i.deferred) return;
        
        // Novo spin
        const newResult = [
          SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)],
          SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)],
          SLOT_EMOJIS[Math.floor(Math.random() * SLOT_EMOJIS.length)]
        ];
        
        // Calcular novo resultado
        const newResultKey = newResult.join('');
        let newReward;
        let newWon = false;
        
        if (REWARDS[newResultKey]) {
          newReward = REWARDS[newResultKey];
          newWon = true;
        } else if (newResult[0] === newResult[1] && newResult[1] === newResult[2]) {
          newReward = REWARDS['triple'];
          newWon = true;
        } else if (newResult[0] === newResult[1] || newResult[1] === newResult[2] || newResult[0] === newResult[2]) {
          newReward = REWARDS['double'];
          newWon = true;
        } else {
          newReward = REWARDS['lose'];
        }
        
        await updateGameScore(i.guild.id, i.user.id, newReward.points, newWon);
        
        let newColor;
        if (newReward.points >= GAME_POINTS.SLOTS_JACKPOT) {
          newColor = 0xFFD700;
        } else if (newReward.points >= GAME_POINTS.SLOTS_MEDIUM) {
          newColor = 0x57F287;
        } else if (newReward.points >= GAME_POINTS.SLOTS_SMALL) {
          newColor = 0x5865F2;
        } else {
          newColor = 0x99AAB5;
        }
        
        const newEmbed = new EmbedBuilder()
          .setColor(newColor)
          .setTitle('🎰 Caça-Níquel')
          .setDescription(`
╔═══════════════╗
║  ${newResult.join(' │ ')}  ║
╚═══════════════╝

${newWon ? '🎉' : '😢'} **${newReward.name}**
          `)
          .addFields({ name: '🏆 Pontos', value: `+${newReward.points}`, inline: true })
          .setFooter({ text: i.user.username })
          .setTimestamp();
        
        await i.update({ embeds: [newEmbed], components: [] });
      } catch (error) {
        // Ignora erros de interação já processada
        if (error.code !== 40060) console.error('Erro no Slots:', error);
      }
    });
    
    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        interaction.editReply({ components: [] }).catch(() => {});
      }
    });
  }
};
