const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { updateGameScore, GAME_POINTS } = require('./_gameUtils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('🪙 Cara ou coroa!')
    .addStringOption(option =>
      option.setName('escolha')
        .setDescription('Escolha cara ou coroa')
        .setRequired(false)
        .addChoices(
          { name: '👑 Cara', value: 'cara' },
          { name: '🦅 Coroa', value: 'coroa' }
        )
    ),

  async execute(interaction) {
    const choice = interaction.options.getString('escolha');
    
    // Se não escolheu, apenas mostra o resultado
    const result = Math.random() < 0.5 ? 'cara' : 'coroa';
    const resultEmoji = result === 'cara' ? '👑' : '🦅';
    const resultText = result === 'cara' ? 'Cara' : 'Coroa';
    
    // Animação de moeda girando
    const spinEmbed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🪙 Jogando a moeda...')
      .setDescription('```\n   🪙\n  ╱   ╲\n ╱     ╲\n╱       ╲\n```')
      .setFooter({ text: 'Girando...' });
    
    await interaction.reply({ embeds: [spinEmbed] });
    
    // Aguarda 1.5s para "animação"
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let points;
    let won;
    let resultDescription;
    let color;
    
    if (choice) {
      // Usuário apostou
      won = choice === result;
      points = won ? GAME_POINTS.COINFLIP_WIN : GAME_POINTS.COINFLIP_LOSE;
      color = won ? 0x57F287 : 0xED4245;
      resultDescription = won 
        ? `✅ Você acertou! Era **${resultText}** ${resultEmoji}`
        : `❌ Você errou! Era **${resultText}** ${resultEmoji}`;
    } else {
      // Apenas jogou sem apostar
      won = false;
      points = GAME_POINTS.COINFLIP_LOSE;
      color = 0x5865F2;
      resultDescription = `A moeda caiu em **${resultText}** ${resultEmoji}`;
    }
    
    await updateGameScore(
      interaction.guild.id,
      interaction.user.id,
      points,
      won
    );
    
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`🪙 Coin Flip - ${resultText}!`)
      .setDescription(resultDescription)
      .setThumbnail(result === 'cara' 
        ? 'https://em-content.zobj.net/thumbs/120/twitter/351/coin_1fa99.png'
        : 'https://em-content.zobj.net/thumbs/120/twitter/351/eagle_1f985.png'
      )
      .addFields(
        { name: '🎯 Resultado', value: `${resultEmoji} ${resultText}`, inline: true },
        { name: '🏆 Pontos', value: `+${points}`, inline: true }
      )
      .setFooter({ text: `${interaction.user.username}` })
      .setTimestamp();
    
    // Botão para jogar novamente
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('coinflip_cara')
          .setLabel('👑 Cara')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('coinflip_coroa')
          .setLabel('🦅 Coroa')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('coinflip_random')
          .setLabel('🎲 Só jogar')
          .setStyle(ButtonStyle.Secondary)
      );
    
    await interaction.editReply({ embeds: [embed], components: [row] });
    
    // Collector para botões (30 segundos)
    const collector = interaction.channel.createMessageComponentCollector({
      filter: i => i.customId.startsWith('coinflip_') && i.user.id === interaction.user.id,
      time: 30000,
      max: 1
    });
    
    collector.on('collect', async (i) => {
      const newResult = Math.random() < 0.5 ? 'cara' : 'coroa';
      const newResultEmoji = newResult === 'cara' ? '👑' : '🦅';
      const newResultText = newResult === 'cara' ? 'Cara' : 'Coroa';
      
      let newChoice = null;
      if (i.customId === 'coinflip_cara') newChoice = 'cara';
      else if (i.customId === 'coinflip_coroa') newChoice = 'coroa';
      
      let newPoints, newWon, newDesc, newColor;
      
      if (newChoice) {
        newWon = newChoice === newResult;
        newPoints = newWon ? GAME_POINTS.COINFLIP_WIN : GAME_POINTS.COINFLIP_LOSE;
        newColor = newWon ? 0x57F287 : 0xED4245;
        newDesc = newWon 
          ? `✅ Você acertou! Era **${newResultText}** ${newResultEmoji}`
          : `❌ Você errou! Era **${newResultText}** ${newResultEmoji}`;
      } else {
        newWon = false;
        newPoints = GAME_POINTS.COINFLIP_LOSE;
        newColor = 0x5865F2;
        newDesc = `A moeda caiu em **${newResultText}** ${newResultEmoji}`;
      }
      
      await updateGameScore(i.guild.id, i.user.id, newPoints, newWon);
      
      const newEmbed = new EmbedBuilder()
        .setColor(newColor)
        .setTitle(`🪙 Coin Flip - ${newResultText}!`)
        .setDescription(newDesc)
        .addFields(
          { name: '🎯 Resultado', value: `${newResultEmoji} ${newResultText}`, inline: true },
          { name: '🏆 Pontos', value: `+${newPoints}`, inline: true }
        )
        .setFooter({ text: `${i.user.username}` })
        .setTimestamp();
      
      await i.update({ embeds: [newEmbed], components: [] });
    });
    
    collector.on('end', (collected, reason) => {
      if (reason === 'time') {
        interaction.editReply({ components: [] }).catch(() => {});
      }
    });
  }
};
