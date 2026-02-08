const { SlashCommandBuilder } = require('discord.js');
const Leaderboard = require('../models/Leaderboard');

// Map compartilhado para tracking de tempo (referência do index.js)
const trackStartTimes = global.trackStartTimes || new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pula para a próxima música na fila'),

  async execute(interaction) {
    await interaction.deferReply();

    if (!interaction.guild) return interaction.editReply('Somente em servidores.');

    const player = interaction.client.lavalink.getPlayer(interaction.guild.id);
    if (!player || !player.queue.current) {
      return interaction.editReply('❗ Nenhuma música tocando para pular!');
    }

    // === REGISTRAR TEMPO ANTES DE PULAR ===
    const currentTrack = player.queue.current;
    if (currentTrack?.requester?.id) {
      const trackKey = `${interaction.guild.id}_${currentTrack.requester.id}`;
      const startTime = trackStartTimes.get(trackKey);
      
      if (startTime) {
        const timeListened = Date.now() - startTime;
        await updateLeaderboard(interaction.guild.id, currentTrack.requester.id, 'time', timeListened);
        trackStartTimes.delete(trackKey);
      }
    }

    const skippedTitle = currentTrack.info.title;
    await player.skip(1, false);

    return interaction.editReply(`⏭️ Pulada: **${skippedTitle}**`);
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
