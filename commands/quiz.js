const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Leaderboard = require('../models/Leaderboard');
const yts = require('yt-search');
const COUNTDOWN_URL = 'https://www.youtube.com/watch?v=6nJR1Bj3_l8';

// Armazena o estado do jogo por servidor
const games = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('🎮 Jogo de Adivinhe a Música (Music Quiz)')
    .addSubcommand(sub => 
      sub.setName('start')
        .setDescription('Inicia um novo jogo')
        .addIntegerOption(opt => opt.setName('rounds').setDescription('Número de rodadas').setMinValue(3).setMaxValue(20).setRequired(true))
        .addStringOption(opt => opt.setName('playlist').setDescription('Link da playlist (opcional)'))
    )
    .addSubcommand(sub =>
      sub.setName('stop')
        .setDescription('Para o jogo atual')
    ),

  async execute(interaction) {
    if (!interaction.guild) return interaction.reply('❌ Somente em servidores!');
    const guildId = interaction.guild.id;

    // === STOP COMMAND ===
    if (interaction.options.getSubcommand() === 'stop') {
      const game = games.get(guildId);
      if (game) {
        clearInterval(game.timer); // Garante que timers parem
        player = interaction.client.lavalink.getPlayer(guildId);
        if (player) player.stopPlaying();
        games.delete(guildId);
        return interaction.reply('🛑 Jogo parado!');
      } else {
        return interaction.reply('❌ Nenhum jogo acontecendo no momento.');
      }
    }

    // === START COMMAND ===
    await interaction.deferReply();

    // 1. Verificações
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.voice.channel) return interaction.editReply('🎤 Entre em um canal de voz!');
    
    if (games.has(guildId)) return interaction.editReply('⚠️ Já existe um jogo em andamento!');

    // 2. Setup do Player
    let player = interaction.client.lavalink.getPlayer(guildId);
    if (!player) {
      player = await interaction.client.lavalink.createPlayer({
        guildId,
        voiceChannelId: member.voice.channel.id,
        textChannelId: interaction.channel.id,
        selfDeaf: true
      });
    }
    if (!player.connected) await player.connect();

    // 3. Carregar Músicas e Countdown
    const rounds = interaction.options.getInteger('rounds');
    const playlistUrl = interaction.options.getString('playlist') || 'https://www.youtube.com/playlist?list=PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI'; // Top 100 Hits default

    await interaction.editReply(`🔄 Carregando músicas e preparando contagem...`);

    let tracks = [];
    let countdownTrack = null;

    try {
      // Carrega Countdown
      const countdownRes = await player.search({ query: COUNTDOWN_URL, source: 'youtube' }, interaction.user);
      if (countdownRes.tracks.length > 0) {
        countdownTrack = countdownRes.tracks[0];
      }

      // Carrega Playlist
      // Verifica se é URL direta ou busca
      const isUrl = playlistUrl.startsWith('http');
      const search = isUrl ? playlistUrl : `ytsearch:${playlistUrl}`;
      
      const res = await player.search({ query: search, source: isUrl ? 'youtube' : 'ytsearch' }, interaction.user);
      
      tracks = res.tracks;
      
      // Fallback
      if (!tracks || tracks.length === 0) {
        const fallbackRes = await player.search({ query: 'https://www.youtube.com/playlist?list=PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI', source: 'youtube' }, interaction.user);
        tracks = fallbackRes.tracks;
      }

    } catch (e) {
      console.error(e);
      return interaction.editReply('❌ Erro ao carregar playlist. Tente outro link.');
    }

    if (tracks.length < rounds) {
      return interaction.editReply(`❌ Playlist insuficiente! Encontrei apenas ${tracks.length} músicas (preciso de ${rounds}).`);
    }

    // Embaralhar e pegar N músicas
    tracks = tracks.sort(() => Math.random() - 0.5).slice(0, rounds);

    // 4. Iniciar Estado do Jogo
    const game = {
      round: 0,
      maxRounds: rounds,
      scores: {}, // userId: points
      currentTrack: null,
      countdownTrack: countdownTrack,
      active: true,
      channel: interaction.channel,
      timer: null
    };
    games.set(guildId, game);

    await interaction.followUp(`🎮 **Quiz Iniciado!** Serão ${rounds} rodadas.\nA música começa em instantes...`);

    // Iniciar loop do jogo
    startGameLoop(interaction, player, tracks, guildId);
  }
};

async function startGameLoop(interaction, player, tracks, guildId) {
  const game = games.get(guildId);
  if (!game || !game.active) return;

  // Verifica fim do jogo
  if (game.round >= game.maxRounds) {
    finishGame(game, guildId, interaction.client);
    return;
  }

  // Prepara rodada
  game.round++;
  const track = tracks[game.round - 1];
  game.currentTrack = track;

  // Limpa string (remove (Official Video), ft., etc para facilitar)
  // Mas mantemos a lógica de verificação flexível no collector
  
  await game.channel.send(`**🎵 Rodada ${game.round}/${game.maxRounds}**\nOuvindo... Quem adivinha? (30 segundos)`);

  // 1. Toca Countdown (se existir)
  if (game.countdownTrack) {
    try {
      console.log('Starting countdown track:', game.countdownTrack.info.title);
      await player.play({ track: game.countdownTrack.encoded });
      // Espera ~4 segundos (duração do vídeo de contagem)
      await new Promise(resolve => setTimeout(resolve, 4000));
    } catch (err) {
      console.error('Error playing countdown:', err);
      // Se falhar, segue o jogo
    }
  }

  // 2. Toca a música do Quiz
  console.log('Playing quiz track:', track.info.title);
  try {
    await player.play({
      track: track.encoded,
      // Começa em 30s se possível para evitar introduções longas/silenciosas
      position: track.info.duration > 60000 ? 30000 : 0
    });
  } catch (err) {
    console.error('Error playing quiz track:', err);
    await game.channel.send('❌ Erro ao tocar esta música. Pulando...');
    // Continua para próxima rodada ou encerra
    return; 
  }

  // Collector de respostas
  const filter = m => !m.author.bot;
  const collector = game.channel.createMessageCollector({ filter, time: 30000 });

  let roundWinner = null;
  let pointsWon = 0;
  let answerType = '';

  collector.on('collect', m => {
    if (roundWinner) return; // Já ganharam

    const content = m.content.toLowerCase();
    const cleanTitle = cleanString(track.info.title).toLowerCase();
    const cleanAuthor = cleanString(track.info.author).toLowerCase();

    // Lógica de Acerto
    // Título = 10 pts
    if (content.includes(cleanTitle) || (cleanTitle.length > 5 && content.includes(cleanTitle.substring(0, Math.floor(cleanTitle.length * 0.8))))) {
      roundWinner = m.author;
      pointsWon = 10;
      answerType = 'Título da Música';
      collector.stop('winner');
    } 
    // Artista = 5 pts
    else if (content.includes(cleanAuthor)) {
      roundWinner = m.author;
      pointsWon = 5;
      answerType = 'Artista';
      collector.stop('winner');
    }
  });

  collector.on('end', async (collected, reason) => {
    // Para a música
    await player.stopPlaying();

    if (reason === 'winner' && roundWinner) {
      // Atualiza Score Local
      game.scores[roundWinner.id] = (game.scores[roundWinner.id] || 0) + pointsWon;

      // Salva no Banco (Async para não travar)
      updateDbScore(guildId, roundWinner.id, pointsWon);

      await game.channel.send(`🎉 **${roundWinner.username}** acertou! \nResposta: **${track.info.title}** - ${track.info.author}\nGanhou **${pointsWon}** pontos (${answerType})!`);
    } else {
      await game.channel.send(`❌ Ninguém acertou!\nA música era: **${track.info.title}** - ${track.info.author}`);
    }

    // Delay para próxima rodada
    setTimeout(() => {
      startGameLoop(interaction, player, tracks, guildId);
    }, 4000);
  });
}

function finishGame(game, guildId, client) {
  // Ordena vencedores
  const sorted = Object.entries(game.scores).sort((a, b) => b[1] - a[1]);
  
  let resultMsg = '🏆 **Fim do Jogo!**\n\n';
  if (sorted.length === 0) {
    resultMsg += 'Ninguém pontuou! 😢';
  } else {
    sorted.forEach(([userId, score], i) => {
        // Tenta pegar username do cache, fall back pra ID
        // Como o jogo é rápido, cache deve estar ok
        resultMsg += `${['🥇','🥈','🥉'][i] || '🏅'} <@${userId}>: **${score}** pontos\n`;
    });
  }

  game.channel.send({ content: resultMsg });
  games.delete(guildId);
  client.lavalink.getPlayer(guildId)?.disconnect();
}

function cleanString(str) {
  return str
    .replace(/\(Official Video\)/gi, '')
    .replace(/\(Official Audio\)/gi, '')
    .replace(/\(Lyrics\)/gi, '')
    .replace(/\(Visualizer\)/gi, '')
    .replace(/ft\./gi, '')
    .replace(/feat\./gi, '')
    .replace(/\[.*?\]/g, '') // Remove coisas entre colchetes
    .replace(/[^\w\s]/gi, '') // Remove caracteres especiais
    .trim();
}

// Persistência DB
async function updateDbScore(guildId, userId, points) {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;

    await Leaderboard.findOneAndUpdate(
      { guildId, userId, month: monthKey },
      { $inc: { quizPoints: points } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (e) {
    console.error('Erro ao salvar quizPoints:', e);
  }
}
