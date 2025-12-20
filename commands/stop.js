const { SlashCommandBuilder } = require('discord.js');
const QuizSession = require('../models/QuizSession');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Para tudo (Música e Quiz) e desconecta o bot'),

  async execute(interaction) {
    if (!interaction.guild) return interaction.reply('Somente em servidores.');
    await interaction.deferReply();

    const guildId = interaction.guild.id;
    let msg = [];

    // 1. Limpeza do Quiz
    const quizGame = interaction.client.quizStates.get(guildId);
    if (quizGame) {
      clearInterval(quizGame.timer); // Para timer se houver
      interaction.client.quizStates.delete(guildId);
      msg.push('🛑 Quiz interrompido.');
    }
    
    // Limpa sessão no DB por garantia
    const deletedSession = await QuizSession.deleteOne({ guildId });
    if (deletedSession.deletedCount > 0 && !quizGame) {
        msg.push('🛑 Sessão de Quiz limpa.');
    }

    // 2. Limpeza do Player (Música)
    const player = interaction.client.lavalink.getPlayer(guildId);
    if (player) {
      // Para reprodução e desconecta (destrói o player)
      await player.destroy();
      // Ou player.disconnect() se quiser manter o player ativo mas sem voz, 
      // mas "sai da call" implica disconnect/destroy.
      msg.push('👋 Desconectado e player destruído.');
    } else {
        if (msg.length === 0) {
            return interaction.editReply('🤷‍♂️ Não estou tocando nada nem em jogo.');
        }
    }

    return interaction.editReply(msg.join('\n') || '🛑 Parado com sucesso!');
  }
};
