const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📚 Mostra todos os comandos disponíveis e como usá-los')
    .addStringOption(option =>
      option.setName('comando')
        .setDescription('Comando específico para obter ajuda detalhada')
        .setRequired(false)
        .addChoices(
          { name: '🎵 play', value: 'play' },
          { name: '📜 playlist', value: 'playlist' },
          { name: '⏭️ skip', value: 'skip' },
          { name: '🛑 stop', value: 'stop' },
          { name: '⏸️ pause', value: 'pause' },
          { name: '🔊 volume', value: 'volume' },
          { name: '🔁 loop', value: 'loop' },
          { name: '📋 queue', value: 'queue' },
          { name: '🎵 nowplayed', value: 'nowplayed' },
          { name: '🏓 ping', value: 'ping' }
        )
    ),

  async execute(interaction) {
    const comando = interaction.options.getString('comando');

    if (comando) {
      // Ajuda detalhada para comando específico
      const helpDetails = {
        play: {
          title: '🎵 Comando Play',
          description: 'Adiciona música à fila e inicia reprodução',
          usage: '`/play <nome ou link>`',
          examples: [
            '`/play Imagine Dragons Believer`',
            '`/play https://youtube.com/watch?v=...`',
            '`/play música relaxante`'
          ],
          notes: '• Se já houver música tocando, adiciona à fila\n• Suporta links do YouTube\n• Busca automática por nome'
        },
        playlist: {
          title: '📜 Comando Playlist',
          description: 'Toca até 25 músicas mais populares de um artista',
          usage: '`/playlist <nome do artista>`',
          examples: [
            '`/playlist Imagine Dragons`',
            '`/playlist Taylor Swift`',
            '`/playlist Queen`'
          ],
          notes: '• Busca automaticamente no YouTube\n• Adiciona 25 faixas mais populares\n• Inicia reprodução imediatamente'
        },
        skip: {
          title: '⏭️ Comando Skip',
          description: 'Pula para a próxima música na fila',
          usage: '`/skip`',
          examples: ['`/skip`'],
          notes: '• Requer música na fila\n• Pula apenas 1 faixa por vez\n• Funciona com modo loop ativo'
        },
        stop: {
          title: '🛑 Comando Stop',
          description: 'Para a reprodução e limpa toda a fila',
          usage: '`/stop`',
          examples: ['`/stop`'],
          notes: '• Remove todas as músicas da fila\n• Para completamente a reprodução\n• Bot permanece no canal de voz'
        },
        pause: {
          title: '⏸️ Comando Pause',
          description: 'Pausa a música que está tocando',
          usage: '`/pause`',
          examples: ['`/pause`'],
          notes: '• Pausa temporariamente\n• Use novamente para retomar\n• Mantém posição da música'
        },
        volume: {
          title: '🔊 Comando Volume',
          description: 'Ajusta o volume da reprodução',
          usage: '`/volume <1-200>`',
          examples: [
            '`/volume 50`',
            '`/volume 100`',
            '`/volume 150`'
          ],
          notes: '• Volume entre 1% e 200%\n• Padrão é 100%\n• Afeta todas as músicas'
        },
        loop: {
          title: '🔁 Comando Loop',
          description: 'Controla o modo de repetição',
          usage: '`/loop <off|queue|track>`',
          examples: [
            '`/loop off` - Desativa loop',
            '`/loop queue` - Repete a fila',
            '`/loop track` - Repete música atual'
          ],
          notes: '• **Off**: Reprodução normal\n• **Queue**: Repete fila completa\n• **Track**: Repete música atual'
        },
        queue: {
          title: '📋 Comando Queue',
          description: 'Mostra todas as músicas na fila',
          usage: '`/queue`',
          examples: ['`/queue`'],
          notes: '• Lista numerada das músicas\n• Mostra total de faixas\n• Não inclui música atual'
        },
        nowplayed: {
          title: '🎵 Comando Now Playing',
          description: 'Mostra informações da música atual',
          usage: '`/nowplayed`',
          examples: ['`/nowplayed`'],
          notes: '• Barra de progresso visual\n• Tempo atual e total\n• Volume e thumbnail\n• Link da música'
        },
        ping: {
          title: '🏓 Comando Ping',
          description: 'Verifica latência e status do bot',
          usage: '`/ping`',
          examples: ['`/ping`'],
          notes: '• Latência WebSocket\n• Tempo de resposta\n• Status do sistema\n• Informações técnicas'
        }
      };

      const detail = helpDetails[comando];
      const embed = new EmbedBuilder()
        .setTitle(detail.title)
        .setDescription(detail.description)
        .addFields(
          { name: '📝 Como usar', value: detail.usage, inline: false },
          { name: '💡 Exemplos', value: detail.examples.join('\n'), inline: false },
          { name: '📌 Observações', value: detail.notes, inline: false }
        )
        .setColor('Blue')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    // Ajuda geral com todos os comandos
    const embed = new EmbedBuilder()
      .setTitle('🎧 DJ-Yazan - Comandos de Música')
      .setDescription('**Bot de música completo para Discord!**\n\n*Use `/help <comando>` para ajuda detalhada*')
      .addFields(
        {
          name: '🎵 **Reprodução**',
          value: [
            '`/play <música>` - Adiciona música à fila',
            '`/playlist <artista>` - Toca 25 músicas do artista',
            '`/nowplayed` - Mostra música atual com progresso'
          ].join('\n'),
          inline: false
        },
        {
          name: '⚡ **Controles**',
          value: [
            '`/pause` - Pausa/retoma a reprodução',
            '`/skip` - Pula para próxima música',
            '`/stop` - Para tudo e limpa a fila',
            '`/volume <1-200>` - Ajusta volume'
          ].join('\n'),
          inline: false
        },
        {
          name: '🔄 **Organização**',
          value: [
            '`/queue` - Mostra fila de músicas',
            '`/loop <modo>` - Loop off/queue/track'
          ].join('\n'),
          inline: false
        },
        {
          name: '🛠️ **Utilidades**',
          value: [
            '`/ping` - Verifica latência e status',
            '`/help [comando]` - Mostra esta ajuda'
          ].join('\n'),
          inline: false
        }
      )
      .setColor('Purple')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ 
        text: `${interaction.client.guilds.cache.size} servidores • ${interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString()} usuários`,
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
