const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserFavorites = require('../models/UserFavorites');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('favorites')
    .setDescription('Gerencie suas músicas favoritas')
    .addSubcommand(sub => 
      sub.setName('add')
        .setDescription('Adiciona a música atual aos favoritos'))
    .addSubcommand(sub => 
      sub.setName('remove')
        .setDescription('Remove uma música dos favoritos')
        .addIntegerOption(opt => 
          opt.setName('posição')
            .setDescription('Posição da música a remover')
            .setRequired(true)
            .setMinValue(1)))
    .addSubcommand(sub => 
      sub.setName('list')
        .setDescription('Lista todas as suas músicas favoritas'))
    .addSubcommand(sub => 
      sub.setName('play')
        .setDescription('Toca todas as suas músicas favoritas'))
    .addSubcommand(sub => 
      sub.setName('clear')
        .setDescription('Remove todas as músicas favoritas')),

  async execute(i) {
    const sub = i.options.getSubcommand();
    const userId = i.user.id;

    // ========== ADD ==========
    if (sub === 'add') {
      const player = i.client.lavalink.getPlayer(i.guild.id);
      
      if (!player || !player.queue.current) {
        return i.reply({ content: '❌ Nenhuma música tocando para adicionar!', ephemeral: true });
      }
      
      const track = player.queue.current;
      
      // Buscar ou criar documento do usuário
      let userFavs = await UserFavorites.findOne({ userId });
      
      if (!userFavs) {
        userFavs = new UserFavorites({ userId, tracks: [] });
      }
      
      // Verificar se já existe
      const exists = userFavs.tracks.some(t => t.uri === track.info.uri);
      if (exists) {
        return i.reply({ content: '⚠️ Esta música já está nos seus favoritos!', ephemeral: true });
      }
      
      // Verificar limite
      if (userFavs.tracks.length >= 100) {
        return i.reply({ content: '❌ Limite de 100 favoritos atingido! Remova alguns para adicionar mais.', ephemeral: true });
      }
      
      // Adicionar
      userFavs.tracks.push({
        title: track.info.title,
        author: track.info.author,
        uri: track.info.uri,
        identifier: track.info.identifier,
        duration: track.info.length || track.info.duration,
        thumbnail: track.info.artworkUrl || `https://img.youtube.com/vi/${track.info.identifier}/mqdefault.jpg`
      });
      
      await userFavs.save();
      
      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('❤️ Adicionado aos Favoritos')
        .setDescription(`**[${track.info.title}](${track.info.uri})**`)
        .setThumbnail(track.info.artworkUrl || null)
        .setFooter({ text: `Total de favoritos: ${userFavs.tracks.length}/100` });
      
      return i.reply({ embeds: [embed] });
    }

    // ========== REMOVE ==========
    if (sub === 'remove') {
      const position = i.options.getInteger('posição');
      
      const userFavs = await UserFavorites.findOne({ userId });
      
      if (!userFavs || userFavs.tracks.length === 0) {
        return i.reply({ content: '❌ Você não tem nenhum favorito!', ephemeral: true });
      }
      
      if (position > userFavs.tracks.length) {
        return i.reply({ content: `❌ Posição inválida! Você tem ${userFavs.tracks.length} favoritos.`, ephemeral: true });
      }
      
      const removed = userFavs.tracks.splice(position - 1, 1)[0];
      await userFavs.save();
      
      return i.reply({ 
        content: `🗑️ Removido dos favoritos: **${removed.title}**`, 
        ephemeral: true 
      });
    }

    // ========== LIST ==========
    if (sub === 'list') {
      const userFavs = await UserFavorites.findOne({ userId });
      
      if (!userFavs || userFavs.tracks.length === 0) {
        return i.reply({ 
          content: '❌ Você não tem nenhum favorito!\nUse `/favorites add` enquanto uma música toca.', 
          ephemeral: true 
        });
      }
      
      const tracks = userFavs.tracks;
      const pages = Math.ceil(tracks.length / 10);
      
      // Formatar lista (primeira página)
      const list = tracks.slice(0, 10).map((t, idx) => {
        const duration = formatDuration(t.duration);
        return `\`${idx + 1}.\` **[${t.title.slice(0, 45)}${t.title.length > 45 ? '...' : ''}](${t.uri})** - ${duration}`;
      }).join('\n');
      
      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle(`❤️ Seus Favoritos (${tracks.length}/100)`)
        .setDescription(list)
        .setFooter({ text: `Página 1/${pages} • Use /favorites play para tocar todos` });
      
      if (tracks.length > 10) {
        embed.addFields({ 
          name: '📋 Mais músicas', 
          value: `...e mais ${tracks.length - 10} favoritos` 
        });
      }
      
      return i.reply({ embeds: [embed] });
    }

    // ========== PLAY ==========
    if (sub === 'play') {
      const vc = i.member.voice?.channel;
      if (!vc) {
        return i.reply({ content: '❌ Entre em um canal de voz!', ephemeral: true });
      }
      
      const userFavs = await UserFavorites.findOne({ userId });
      
      if (!userFavs || userFavs.tracks.length === 0) {
        return i.reply({ content: '❌ Você não tem favoritos para tocar!', ephemeral: true });
      }
      
      await i.deferReply();
      
      // Criar ou obter player
      let player = i.client.lavalink.getPlayer(i.guild.id) ||
        await i.client.lavalink.createPlayer({
          guildId: i.guild.id,
          voiceChannelId: vc.id,
          textChannelId: i.channel.id
        });
      
      if (!player.connected) await player.connect();
      
      let added = 0;
      let failed = 0;
      
      // Adicionar todas as músicas à fila
      for (const fav of userFavs.tracks) {
        try {
          const res = await player.search({ query: fav.uri }, i.user);
          
          if (res.tracks.length > 0) {
            await player.queue.add(res.tracks[0]);
            added++;
          } else {
            failed++;
          }
        } catch (error) {
          failed++;
        }
      }
      
      // Começar a tocar se não estiver tocando
      if (!player.playing && !player.paused) {
        await player.play();
      }
      
      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('❤️ Tocando Favoritos')
        .setDescription(`Adicionadas **${added}** músicas à fila${failed > 0 ? ` (${failed} falharam)` : ''}`)
        .setFooter({ text: `Total na fila: ${player.queue.tracks.length + 1} músicas` });
      
      return i.editReply({ embeds: [embed] });
    }

    // ========== CLEAR ==========
    if (sub === 'clear') {
      const userFavs = await UserFavorites.findOne({ userId });
      
      if (!userFavs || userFavs.tracks.length === 0) {
        return i.reply({ content: '❌ Você não tem favoritos para limpar!', ephemeral: true });
      }
      
      const count = userFavs.tracks.length;
      userFavs.tracks = [];
      await userFavs.save();
      
      return i.reply({ 
        content: `🗑️ Removidos **${count}** favoritos!`,
        ephemeral: true 
      });
    }
  }
};

// Função auxiliar para formatar duração
function formatDuration(ms) {
  if (!ms || ms <= 0) return 'Live';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
