const { SlashCommandBuilder } = require('discord.js');
const Leaderboard = require('../../models/Leaderboard');

// Map compartilhado para tracking de tempo
const trackStartTimes = global.trackStartTimes || new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausa ou retoma a música que está tocando'),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.guild) return interaction.editReply('Somente em servidores.');

    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    if (!player || !player.queue.current) {
      return interaction.editReply('❗ Nada está tocando!');
    }

    const currentTrack = player.queue.current;
    const guildId = interaction.guild.id;
    
    if (player.paused) {
      // === RETOMAR - reinicia o contador de tempo ===
      if (currentTrack?.requester?.id) {
        const trackKey = `${guildId}_${currentTrack.requester.id}`;
        trackStartTimes.set(trackKey, Date.now());
      }
      
      await player.resume();
      return interaction.editReply('▶️ Música retomada!');
    } else {
      // === PAUSAR - salva o tempo até agora ===
      if (currentTrack?.requester?.id) {
        const trackKey = `${guildId}_${currentTrack.requester.id}`;
        const startTime = trackStartTimes.get(trackKey);
        
        if (startTime) {
          const timeListened = Date.now() - startTime;
          await updateLeaderboard(guildId, currentTrack.requester.id, 'time', timeListened);
          trackStartTimes.delete(trackKey);
        }
      }
      
      await player.pause();
      return interaction.editReply('⏸️ Música pausada!');
    }
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
