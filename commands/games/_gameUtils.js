/**
 * Utilitários compartilhados para todos os jogos
 * Este arquivo NÃO é um comando - é usado pelos outros jogos
 */

const Leaderboard = require('../../models/Leaderboard');

/**
 * Atualiza a pontuação de jogos no leaderboard
 * @param {string} guildId - ID do servidor
 * @param {string} userId - ID do usuário
 * @param {number} points - Pontos a adicionar
 * @param {boolean} won - Se o usuário venceu o jogo
 */
async function updateGameScore(guildId, userId, points, won = false) {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const update = {
      $inc: {
        gamePoints: points,
        gamesPlayed: 1
      },
      $set: { lastPlayed: new Date() }
    };
    
    if (won) {
      update.$inc.gamesWon = 1;
    }
    
    await Leaderboard.findOneAndUpdate(
      { guildId, userId, month: monthKey },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar pontuação de jogo:', error);
    return false;
  }
}

/**
 * Busca estatísticas de jogos de um usuário
 * @param {string} guildId - ID do servidor
 * @param {string} userId - ID do usuário
 */
async function getGameStats(guildId, userId) {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;
    
    const stats = await Leaderboard.findOne({ guildId, userId, month: monthKey });
    
    return {
      gamePoints: stats?.gamePoints || 0,
      gamesPlayed: stats?.gamesPlayed || 0,
      gamesWon: stats?.gamesWon || 0,
      winRate: stats?.gamesPlayed > 0 
        ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) 
        : 0
    };
  } catch (error) {
    console.error('Erro ao buscar stats de jogos:', error);
    return { gamePoints: 0, gamesPlayed: 0, gamesWon: 0, winRate: 0 };
  }
}

// Pontuação padrão para cada jogo
const GAME_POINTS = {
  TRIVIA_CORRECT: 10,
  EIGHTBALL: 5,
  COINFLIP_WIN: 10,
  COINFLIP_LOSE: 2,
  RPS_WIN: 20,
  RPS_TIE: 5,
  RPS_LOSE: 2,
  SLOTS_SMALL: 15,
  SLOTS_MEDIUM: 50,
  SLOTS_JACKPOT: 200,
  SLOTS_LOSE: 2,
  BLACKJACK_WIN: 30,
  BLACKJACK_BLACKJACK: 50,
  BLACKJACK_TIE: 10,
  BLACKJACK_LOSE: 5,
  WORDLE_WIN: 40,
  WORDLE_LOSE: 5,
  HANGMAN_WIN: 35,
  HANGMAN_LOSE: 5,
  TICTACTOE_WIN: 25,
  TICTACTOE_TIE: 10,
  TICTACTOE_LOSE: 5,
  CONNECT4_WIN: 30,
  CONNECT4_LOSE: 5,
  REACTION_WIN: 20,
  REACTION_FAST: 10, // Bonus por tempo rápido
  REACTION_LOSE: 5
};

module.exports = {
  updateGameScore,
  getGameStats,
  GAME_POINTS
};
