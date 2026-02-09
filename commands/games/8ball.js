const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { updateGameScore, GAME_POINTS } = require('./_gameUtils');

// Respostas da bola mágica em português
const RESPONSES = {
  positive: [
    '🟢 Com certeza!',
    '🟢 Sim, definitivamente!',
    '🟢 Pode contar com isso!',
    '🟢 Sem dúvida alguma!',
    '🟢 As estrelas dizem que sim!',
    '🟢 Absolutamente!',
    '🟢 Tudo aponta para sim!',
    '🟢 É muito provável!',
    '🟢 Os sinais são positivos!',
    '🟢 Pode apostar que sim!'
  ],
  neutral: [
    '🟡 Pergunte novamente mais tarde...',
    '🟡 Não consigo prever agora...',
    '🟡 Melhor não te dizer agora...',
    '🟡 Concentre-se e pergunte de novo...',
    '🟡 O destino está incerto...',
    '🟡 As forças cósmicas estão confusas...',
    '🟡 Hmm... difícil dizer...',
    '🟡 Talvez sim, talvez não...'
  ],
  negative: [
    '🔴 Não conte com isso!',
    '🔴 Minha resposta é não.',
    '🔴 As perspectivas não são boas...',
    '🔴 Muito duvidoso...',
    '🔴 Não, definitivamente não!',
    '🔴 Os astros dizem não!',
    '🔴 Improvável...',
    '🔴 Nem pense nisso!',
    '🔴 Esquece, não vai rolar!',
    '🔴 As chances são mínimas...'
  ]
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('🎱 Pergunte algo à bola mágica!')
    .addStringOption(option =>
      option.setName('pergunta')
        .setDescription('Faça sua pergunta')
        .setRequired(true)
        .setMaxLength(200)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('pergunta');
    
    // Escolhe categoria aleatória (40% positivo, 30% neutro, 30% negativo)
    const rand = Math.random();
    let category;
    let color;
    
    if (rand < 0.4) {
      category = RESPONSES.positive;
      color = 0x57F287; // Verde
    } else if (rand < 0.7) {
      category = RESPONSES.neutral;
      color = 0xFEE75C; // Amarelo
    } else {
      category = RESPONSES.negative;
      color = 0xED4245; // Vermelho
    }
    
    const answer = category[Math.floor(Math.random() * category.length)];
    
    // Atualiza pontuação
    await updateGameScore(
      interaction.guild.id,
      interaction.user.id,
      GAME_POINTS.EIGHTBALL,
      false
    );
    
    const embed = new EmbedBuilder()
      .setColor(color)
      .setAuthor({ name: '🎱 Bola Mágica' })
      .setTitle('A bola mágica responde...')
      .addFields(
        { name: '❓ Sua pergunta', value: question },
        { name: '🔮 Resposta', value: `**${answer}**` }
      )
      .setFooter({ text: `+${GAME_POINTS.EIGHTBALL} pontos • ${interaction.user.username}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
