const { SlashCommandBuilder } = require('discord.js');
const QuizSession = require('../models/QuizSession');
const Leaderboard = require('../models/Leaderboard');

// Map compartilhado para tracking de tempo (referência do index.js)
const trackStartTimes = global.trackStartTimes || new Map();

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
      // === REGISTRAR TEMPO ANTES DE PARAR ===
      const currentTrack = player.queue.current;
      if (currentTrack?.requester?.id) {
        const trackKey = `${guildId}_${currentTrack.requester.id}`;
        const startTime = trackStartTimes.get(trackKey);
        
        if (startTime) {
          const timeListened = Date.now() - startTime;
          await updateLeaderboard(guildId, currentTrack.requester.id, 'time', timeListened);
          trackStartTimes.delete(trackKey);
        }
      }
      
      // Para reprodução e desconecta (destrói o player)
      await player.destroy();
      msg.push('👋 Desconectado e player destruído.');
    } else {
        if (msg.length === 0) {
            return interaction.editReply('🤷‍♂️ Não estou tocando nada nem em jogo.');
        }
    }

    return interaction.editReply(msg.join('\n') || '🛑 Parado com sucesso!');
  }
};

// Função auxiliar para atualizar leaderboard
async function updateLeaderboard(guildId, userId, type, value = 1) {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const update = { $set: { lastPlayed: new Date() } };
    
    if (type === 'song') {
      update.$inc = { songs: 1 };
    } else if (type === 'time') {
      update.$inc = { time: value };
    }
    
    await Leaderboard.findOneAndUpdate(
      { guildId, userId, month: monthKey },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.error('Erro ao atualizar leaderboard:', error);
  }
}
