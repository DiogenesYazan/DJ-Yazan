const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Leaderboard = require('../../models/Leaderboard');
const QuizSession = require('../../models/QuizSession'); // [NEW] Importar o model
const COUNTDOWN_URL = 'https://www.youtube.com/watch?v=6nJR1Bj3_l8';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('🎮 Jogo de Adivinhe a Música (Music Quiz)')
    .addSubcommand(sub => 
      sub.setName('start')
        .setDescription('Inicia um novo jogo')
        .addIntegerOption(opt => opt.setName('rounds').setDescription('Número de rodadas').setMinValue(3).setMaxValue(50).setRequired(true))
        .addStringOption(opt => opt.setName('playlist').setDescription('Link da playlist (opcional)'))
    ),

  async execute(interaction) {
    if (!interaction.guild) return interaction.reply('❌ Somente em servidores!');
    const guildId = interaction.guild.id;

    // === START COMMAND ===
    // (Lógica direta, já que só tem start agora, mas vamos manter o check do subcomando se quiser expandir dps, ou simplificar)
    // Para simplificar e manter compatibilidade, verificamos se é start (única opção)
    
    await interaction.deferReply();

    // 1. Verificações
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.voice.channel) return interaction.editReply('🎤 Entre em um canal de voz!');
    
    // Verifica se já tem sessão no DB ou memória
    const existingSession = await QuizSession.findOne({ guildId, active: true });
    if (existingSession) {
        // Opção: Poderíamos perguntar se quer retomar, mas por simplicidade vamos pedir para parar
        return interaction.editReply('⚠️ Já existe um jogo registrado neste servidor! Use `/quiz stop` para encerrar o anterior.');
    }

    if (interaction.client.quizStates.has(guildId)) return interaction.editReply('⚠️ Já existe um jogo em andamento (memória)!');

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
    const playlistUrl = interaction.options.getString('playlist') || 'https://www.youtube.com/playlist?list=PL4fGSI1pDJn6O1LS0XSdF3RyO0Rq_LDeI';

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

    // Flag tracks as Quiz
    tracks.forEach(t => { t.userData = { quiz: true }; });
    if (countdownTrack) countdownTrack.userData = { quiz: true };

    // 4. Salvar Sessão no MongoDB
    const newSession = new QuizSession({
        guildId,
        channelId: interaction.channel.id,
        voiceChannelId: member.voice.channel.id,
        currentRound: 0,
        maxRounds: rounds,
        playlistUrl: playlistUrl,
        active: true
    });
    await newSession.save();

    // 5. Iniciar Estado do Jogo em Memória
    const game = {
      round: 0,
      maxRounds: rounds,
      scores: {}, 
      currentTrack: null,
      countdownTrack: countdownTrack,
      active: true,
      channel: interaction.channel,
      timer: null,
      voiceChannelId: member.voice.channel.id // Importante para reconexão
    };
    interaction.client.quizStates.set(guildId, game);

    // MEE6-style Start Embed
    const startEmbed = new EmbedBuilder()
      .setTitle('🎵 O Quiz de Música vai começar em breve!')
      .setDescription(`Este jogo terá **${rounds} músicas**, 30 segundos por música.\nVocê terá que adivinhar o **nome do artista** e o **nome da música**.`)
      .addFields({ 
        name: 'Pontuação', 
        value: '```diff\n+ 1 ponto por nome de artista\n+ 2 pontos pelo nome da música\n```\nVocê pode digitar **!pass** para pular a música.'
      })
      .setColor('#3b88c3') 
      .setFooter({ text: 'Sente e relaxe, o Quiz vai começar em 5 segundos!' });

    await interaction.followUp({ embeds: [startEmbed] });

    setTimeout(() => {
        startGameLoop(interaction, player, tracks, guildId);
    }, 5000);
  }
};

async function startGameLoop(interaction, player, tracks, guildId) {
  const games = interaction.client.quizStates;
  let game = games.get(guildId);
  
  // Se não estiver em memória, tenta recuperar do DB (Robustez)
  // Nota: Recuperar totalmente do DB exigiria salvar as tracks, o que é complexo. 
  // Assumimos que a memória é volátil mas o DB guarda o estado geral.
  // Se perdeu da memória (crash do bot), infelizmente perde as tracks embaralhadas atuais.
  // Por enquanto, confiamos que se o jogo está no DB, ele deveria estar na memória se o bot não reiniciou.
  
  if (!game || !game.active) {
      // Verifica DB para limpar sujeito
      await QuizSession.deleteOne({ guildId });
      return;
  }

  // Verifica fim do jogo
  if (game.round >= game.maxRounds) {
    finishGame(game, guildId, interaction.client);
    return;
  }

  // === FIX: RECONEXÃO ===
  // Verifica se o player morreu ou desconectou
  player = interaction.client.lavalink.getPlayer(guildId);
  if (!player || !player.connected) {
      console.log(`[QUIZ] Player desconectado no meio do jogo. Tentando reconectar em ${game.voiceChannelId}...`);
      try {
          player = await interaction.client.lavalink.createPlayer({
              guildId,
              voiceChannelId: game.voiceChannelId,
              textChannelId: game.channel.id,
              selfDeaf: true
          });
          await player.connect();
          console.log('[QUIZ] Reconectado com sucesso!');
      } catch (err) {
          console.error('[QUIZ] Falha ao reconectar:', err);
          game.channel.send('❌ Perdi a conexão com o canal de voz e não consegui voltar. O jogo foi encerrado.');
          finishGame(game, guildId, interaction.client, true); // True para forçar fim sem vencedor
          return;
      }
  }
  // ======================

  // Prepara rodada
  game.round++;
  const track = tracks[game.round - 1];
  game.currentTrack = track;

  // Atualiza DB
  try {
      await QuizSession.updateOne(
          { guildId }, 
          { 
              $set: { currentRound: game.round }, 
              $inc: { "scores.roundsPlayed": 1 } // Exemplo de tracking
          }
      );
  } catch(e) { console.error('Erro ao atualizar QuizSession:', e); }

  await game.channel.send(`**🎵 Rodada ${game.round}/${game.maxRounds}**\nOuvindo... Quem adivinha? (30 segundos)`);

  // 1. Toca Countdown (se existir)
  if (game.countdownTrack) {
    try {
      await player.queue.add(game.countdownTrack);
      await player.play(); 
      await new Promise(resolve => setTimeout(resolve, 4000));
    } catch (err) {
      console.error('Error playing countdown:', err);
    }
  }

  // 2. Toca a música do Quiz
  try {
    await player.queue.add(track);
    const duration = Number(track.info.duration) || 0;
    await player.play();
    
    if (duration > 60000) {
        setTimeout(async () => {
             try { await player.seek(30000); } catch(e) {}
        }, 500); 
    }
  } catch (err) {
    console.error('Error playing quiz track:', err);
    await game.channel.send('❌ Erro ao tocar esta música. Pulando...');
    return; // Passa pra proxima (loop recursivo? não, timeout chama o collector end)
    // Na verdade, se falhar o play, o collector vai rodar no silêncio. 
    // Ideal seria pular a rodada.
  }

  // Collector de respostas
  const filter = m => !m.author.bot;
  const collector = game.channel.createMessageCollector({ filter, time: 30000 });

  let roundWinner = null;
  let pointsWon = 0;
  let answerType = '';

  collector.on('collect', m => {
    if (roundWinner) return; 

    const content = cleanString(m.content).toLowerCase();
    
    const cleanTitle = cleanString(track.info.title).toLowerCase();
    const cleanAuthor = cleanString(track.info.author).toLowerCase();

    const possibleAnswers = [];
    possibleAnswers.push({ text: cleanTitle, points: 2, type: 'Título' });
    possibleAnswers.push({ text: cleanAuthor, points: 1, type: 'Artista' });

    if (track.info.title.includes('-')) {
        const parts = track.info.title.split('-').map(p => cleanString(p).toLowerCase());
        if (parts.length >= 2) {
            possibleAnswers.push({ text: parts[0], points: 1, type: 'Artista' });
            possibleAnswers.push({ text: parts[1], points: 2, type: 'Título' });
        }
    }

    const quoteRegex = /["'](.*?)["']/;
    const quoteMatch = track.info.title.match(quoteRegex);
    if (quoteMatch && quoteMatch[1]) {
        possibleAnswers.push({ text: cleanString(quoteMatch[1]).toLowerCase(), points: 2, type: 'Título' });
    }

    if (content.length < 3) return; 

    if (content === '!pass' || content === 'pass') {
        collector.stop('pass');
        return;
    }

    let match = null;
    for (const answer of possibleAnswers) {
        if (answer.text.includes(content)) {
             match = answer;
             break;
        }
    }

    if (match) {
      roundWinner = m.author;
      pointsWon = match.points;
      answerType = match.type === 'Título' ? 'Título da Música' : 'Artista';
      
      m.react('✅').catch(() => {});
      collector.stop('winner');
    } else {
        m.react('❌').catch(() => {});
    }
  });

  collector.on('end', async (collected, reason) => {
    await player.stopPlaying();

    if (reason === 'winner' && roundWinner) {
      // Atualiza Memória
      game.scores[roundWinner.id] = (game.scores[roundWinner.id] || 0) + pointsWon;

      // Atualiza MongoDB Session Score
      try {
          const update = {};
          update[`scores.${roundWinner.id}`] = pointsWon;
          await QuizSession.updateOne({ guildId }, { $inc: update });
      } catch(e) { console.error('Erro ao salvar score parcial:', e); }

      // Atualiza Leaderboard Global
      updateDbScore(guildId, roundWinner.id, pointsWon);

      const winEmbed = new EmbedBuilder()
        .setTitle('🎉 ACERTOU!')
        .setDescription(`**${roundWinner.username}** foi o mais rápido!`)
        .addFields(
          { name: 'Música', value: `[${track.info.title}](${track.info.uri})`, inline: true },
          { name: 'Artista', value: track.info.author, inline: true },
          { name: 'Pontos Ganhos', value: `+${pointsWon} (${answerType})`, inline: false }
        )
        .setThumbnail(track.info.artworkUrl || null)
        .setColor('Green');

      await game.channel.send({ embeds: [winEmbed] });
    } else {
      const loseEmbed = new EmbedBuilder()
        .setTitle('❌ Tempo esgotado!')
        .setDescription('Ninguém acertou a tempo.')
        .addFields(
            { name: 'Música', value: `[${track.info.title}](${track.info.uri})`, inline: true },
            { name: 'Artista', value: track.info.author, inline: true }
        )
        .setThumbnail(track.info.artworkUrl || null)
        .setColor('Red');

      await game.channel.send({ embeds: [loseEmbed] });
    }

    const delay = (reason === 'winner') ? 2000 : 4000;
    setTimeout(() => {
      startGameLoop(interaction, player, tracks, guildId);
    }, delay);
  });
}

async function finishGame(game, guildId, client, forceError = false) {
  const games = client.quizStates;
  
  if (!forceError) {
      const sorted = Object.entries(game.scores).sort((a, b) => b[1] - a[1]);
      let resultMsg = '🏆 **Fim do Jogo!**\n\n';
      if (sorted.length === 0) {
        resultMsg += 'Ninguém pontuou! 😢';
      } else {
        sorted.forEach(([userId, score], i) => {
            resultMsg += `${['🥇','🥈','🥉'][i] || '🏅'} <@${userId}>: **${score}** pontos\n`;
        });
      }
      game.channel.send({ content: resultMsg });
  }

  // Limpa DB
  await QuizSession.deleteOne({ guildId });
  games.delete(guildId);
  client.lavalink.getPlayer(guildId)?.disconnect();
}

function cleanString(str) {
  if (!str) return '';
  return str
    .replace(/\(.*?\)/g, '') 
    .replace(/\[.*?\]/g, '') 
    .replace(/ft\.|feat\.|featuring/gi, '') 
    .replace(/\b(official video|official music video|official audio|official mv|lyric video|visualizer|mv|hd|hq|4k)\b/gi, '') 
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-zA-Z0-9 ]/g, '') 
    .replace(/\s+/g, ' ') 
    .trim();
}

async function updateDbScore(guildId, userId, points) {
  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthKey = `${currentYear}-${currentMonth}`;

    await Leaderboard.findOneAndUpdate(
      { guildId, userId, month: monthKey },
      { $inc: { quizPoints: points } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  } catch (e) {
    console.error('Erro ao salvar quizPoints:', e);
  }
}
