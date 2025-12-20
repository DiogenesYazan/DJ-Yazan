const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const Leaderboard = require('../models/Leaderboard');
const COUNTDOWN_URL = 'https://www.youtube.com/watch?v=6nJR1Bj3_l8';

// Armazena o estado do jogo por servidor
// Armazena o estado do jogo por servidor
// const games = new Map(); // Removido em favor de client.quizStates
const MAX_ROUNDS = 20; // Constante auxiliar

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
      const games = interaction.client.quizStates;
      const game = games.get(guildId);
      if (game) {
        clearInterval(game.timer); // Garante que timers parem
        const stopPlayer = interaction.client.lavalink.getPlayer(guildId);
        if (stopPlayer) stopPlayer.stopPlaying();
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
    
    const games = interaction.client.quizStates;
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
    // Embaralhar e pegar N músicas
    tracks = tracks.sort(() => Math.random() - 0.5).slice(0, rounds);

    // Flag tracks as Quiz to avoid spoilers
    tracks.forEach(t => { t.userData = { quiz: true }; });
    if (countdownTrack) countdownTrack.userData = { quiz: true };

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

    // MEE6-style Start Embed
    const startEmbed = new EmbedBuilder()
      .setTitle('🎵 O Quiz de Música vai começar em breve!')
      .setDescription(`Este jogo terá **${rounds} músicas**, 30 segundos por música.\nVocê terá que adivinhar o **nome do artista** e o **nome da música**.`)
      .addFields({ 
        name: 'Pontuação', 
        value: '```diff\n+ 1 ponto por nome de artista\n+ 2 pontos pelo nome da música\n```\nVocê pode digitar **!pass** para pular a música.'
      })
      .setColor('#3b88c3') // MEE6 Blueish
      .setFooter({ text: 'Sente e relaxe, o Quiz vai começar em 5 segundos!' });

    await interaction.followUp({ embeds: [startEmbed] });

    // Iniciar loop do jogo
    setTimeout(() => {
        startGameLoop(interaction, player, tracks, guildId);
    }, 5000);
  }
};

async function startGameLoop(interaction, player, tracks, guildId) {
  const games = interaction.client.quizStates;
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
      // Estratégia de Fila: Limpa, Adiciona e Toca
      // player.queue.tracks = []; // Opcional: limpar fila anterior?
      await player.queue.add(game.countdownTrack);
      await player.play(); 
      
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
    // Adiciona à fila (como prioridade ou limpando)
    // Vamos adicionar e forçar o play
    await player.queue.add(track);
    // Calcule posição segura
    const duration = Number(track.info.duration) || 0;
    // Modificação: Toca primeiro, depois faz seek se necessário
    await player.play();
    
    if (duration > 60000) {
        // Aguarda um pequeno delay para garantir que o player iniciou
        // e então faz o seek
        setTimeout(async () => {
             try {
                await player.seek(30000);
             } catch(e) {
                console.error('Error seeking:', e);
             }
        }, 500); 
    }
  } catch (err) {
    console.error('Error playing quiz track:', err);
    await game.channel.send('❌ Erro ao tocar esta música. Pulando...');
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

    // Limpa input do usuário para comparar banana com banana
    const content = cleanString(m.content).toLowerCase();
    const cleanTitle = cleanString(track.info.title).toLowerCase();
    const cleanAuthor = cleanString(track.info.author).toLowerCase();

    // Lógica de Acerto
    let guaranteedWin = false;

    // !pass command
    if (content === '!pass' || content === 'pass') {
        collector.stop('pass');
        return;
    }

    // Título = 2 pts
    if (content.includes(cleanTitle) || (cleanTitle.length > 5 && content.includes(cleanTitle.substring(0, Math.floor(cleanTitle.length * 0.8))))) {
      roundWinner = m.author;
      pointsWon = 2;
      answerType = 'Título da Música';
      guaranteedWin = true;
    } 
    // Artista = 1 pt
    else if (content.includes(cleanAuthor)) {
      roundWinner = m.author;
      pointsWon = 1;
      answerType = 'Artista';
      guaranteedWin = true;
    }

    if (guaranteedWin) {
        m.react('✅').catch(() => {});
        collector.stop('winner');
    } else {
        // Errou: reage com X
        m.react('❌').catch(() => {});
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

      // Embed de Vitória
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
      // Embed de Ninguém Acertou (Opcional, ou texto simples)
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

    // Delay para próxima rodada
    // Se ganhou, é mais rápido (2s). Se ninguém acertou, dá tempo de ler (4s).
    const delay = (reason === 'winner') ? 2000 : 4000;
    setTimeout(() => {
      startGameLoop(interaction, player, tracks, guildId);
    }, delay);
  });
}

function finishGame(game, guildId, client) {
  const games = client.quizStates;
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
  if (!str) return '';
  return str
    .replace(/\(.*?\)/g, '') // Remove tudo entre parenteses
    .replace(/\[.*?\]/g, '') // Remove tudo entre colchetes
    .replace(/ft\.|feat\.|featuring/gi, '') // Remove feats
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, '') // Remove tudo que não for letra numero ou espaço
    .replace(/\s+/g, ' ') // Remove espaços duplicados
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
