const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserPlaylist = require('../models/UserPlaylist');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('myplaylists')
    .setDescription('Gerencie suas playlists pessoais')
    .addSubcommand(sub => 
      sub.setName('create')
        .setDescription('Cria uma nova playlist')
        .addStringOption(opt => 
          opt.setName('nome')
            .setDescription('Nome da playlist')
            .setRequired(true)
            .setMaxLength(50)))
    .addSubcommand(sub => 
      sub.setName('add')
        .setDescription('Adiciona a música atual a uma playlist')
        .addStringOption(opt => 
          opt.setName('playlist')
            .setDescription('Nome da playlist')
            .setRequired(true)
            .setAutocomplete(true)))
    .addSubcommand(sub => 
      sub.setName('list')
        .setDescription('Lista suas playlists'))
    .addSubcommand(sub => 
      sub.setName('view')
        .setDescription('Mostra músicas de uma playlist')
        .addStringOption(opt => 
          opt.setName('playlist')
            .setDescription('Nome da playlist')
            .setRequired(true)
            .setAutocomplete(true)))
    .addSubcommand(sub => 
      sub.setName('play')
        .setDescription('Toca uma playlist')
        .addStringOption(opt => 
          opt.setName('playlist')
            .setDescription('Nome da playlist')
            .setRequired(true)
            .setAutocomplete(true))
        .addBooleanOption(opt =>
          opt.setName('shuffle')
            .setDescription('Embaralhar a playlist?')
            .setRequired(false)))
    .addSubcommand(sub => 
      sub.setName('delete')
        .setDescription('Deleta uma playlist')
        .addStringOption(opt => 
          opt.setName('playlist')
            .setDescription('Nome da playlist')
            .setRequired(true)
            .setAutocomplete(true)))
    .addSubcommand(sub => 
      sub.setName('remove')
        .setDescription('Remove uma música de uma playlist')
        .addStringOption(opt => 
          opt.setName('playlist')
            .setDescription('Nome da playlist')
            .setRequired(true)
            .setAutocomplete(true))
        .addIntegerOption(opt => 
          opt.setName('posição')
            .setDescription('Posição da música')
            .setRequired(true)
            .setMinValue(1))),

  // Autocomplete para nomes de playlists
  async autocomplete(i) {
    const focused = i.options.getFocused();
    const userId = i.user.id;
    
    const playlists = await UserPlaylist.find({ userId }).select('name');
    const choices = playlists
      .map(p => p.name)
      .filter(name => name.toLowerCase().includes(focused.toLowerCase()))
      .slice(0, 25);
    
    await i.respond(choices.map(name => ({ name, value: name })));
  },

  async execute(i) {
    const sub = i.options.getSubcommand();
    const userId = i.user.id;

    // ========== CREATE ==========
    if (sub === 'create') {
      const name = i.options.getString('nome');
      
      // Verificar limite de playlists
      const count = await UserPlaylist.countDocuments({ userId });
      if (count >= 25) {
        return i.reply({ content: '❌ Limite de 25 playlists atingido!', ephemeral: true });
      }
      
      // Verificar se já existe
      const exists = await UserPlaylist.findOne({ userId, name });
      if (exists) {
        return i.reply({ content: '❌ Você já tem uma playlist com esse nome!', ephemeral: true });
      }
      
      // Criar playlist
      await UserPlaylist.create({ userId, name, tracks: [] });
      
      const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('📁 Playlist Criada')
        .setDescription(`**${name}**`)
        .setFooter({ text: `Use /myplaylists add para adicionar músicas` });
      
      return i.reply({ embeds: [embed] });
    }

    // ========== ADD ==========
    if (sub === 'add') {
      const playlistName = i.options.getString('playlist');
      const player = i.client.lavalink.getPlayer(i.guild.id);
      
      if (!player || !player.queue.current) {
        return i.reply({ content: '❌ Nenhuma música tocando para adicionar!', ephemeral: true });
      }
      
      const playlist = await UserPlaylist.findOne({ userId, name: playlistName });
      if (!playlist) {
        return i.reply({ content: '❌ Playlist não encontrada!', ephemeral: true });
      }
      
      // Verificar limite
      if (playlist.tracks.length >= 200) {
        return i.reply({ content: '❌ Limite de 200 músicas por playlist atingido!', ephemeral: true });
      }
      
      const track = player.queue.current;
      
      // Verificar se já existe
      const exists = playlist.tracks.some(t => t.uri === track.info.uri);
      if (exists) {
        return i.reply({ content: '⚠️ Esta música já está nessa playlist!', ephemeral: true });
      }
      
      // Adicionar
      playlist.tracks.push({
        title: track.info.title,
        author: track.info.author,
        uri: track.info.uri,
        identifier: track.info.identifier,
        duration: track.info.length || track.info.duration,
        thumbnail: track.info.artworkUrl || `https://img.youtube.com/vi/${track.info.identifier}/mqdefault.jpg`
      });
      
      await playlist.save();
      
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📁 Adicionado à ${playlistName}`)
        .setDescription(`**[${track.info.title}](${track.info.uri})**`)
        .setThumbnail(track.info.artworkUrl || null)
        .setFooter({ text: `Total na playlist: ${playlist.tracks.length}/200` });
      
      return i.reply({ embeds: [embed] });
    }

    // ========== LIST ==========
    if (sub === 'list') {
      const playlists = await UserPlaylist.find({ userId });
      
      if (playlists.length === 0) {
        return i.reply({ 
          content: '❌ Você não tem playlists!\nUse `/myplaylists create` para criar uma.', 
          ephemeral: true 
        });
      }
      
      const list = playlists.map((p, idx) => 
        `\`${idx + 1}.\` **${p.name}** - ${p.tracks.length} músicas`
      ).join('\n');
      
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📁 Suas Playlists (${playlists.length}/25)`)
        .setDescription(list)
        .setFooter({ text: 'Use /myplaylists play <nome> para tocar' });
      
      return i.reply({ embeds: [embed] });
    }

    // ========== VIEW ==========
    if (sub === 'view') {
      const playlistName = i.options.getString('playlist');
      const playlist = await UserPlaylist.findOne({ userId, name: playlistName });
      
      if (!playlist) {
        return i.reply({ content: '❌ Playlist não encontrada!', ephemeral: true });
      }
      
      if (playlist.tracks.length === 0) {
        return i.reply({ content: `❌ A playlist **${playlistName}** está vazia!`, ephemeral: true });
      }
      
      const list = playlist.tracks.slice(0, 15).map((t, idx) => {
        const duration = formatDuration(t.duration);
        return `\`${idx + 1}.\` **${t.title.slice(0, 40)}${t.title.length > 40 ? '...' : ''}** - ${duration}`;
      }).join('\n');
      
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📁 ${playlistName}`)
        .setDescription(list)
        .setFooter({ text: `${playlist.tracks.length} músicas • /myplaylists play ${playlistName}` });
      
      if (playlist.tracks.length > 15) {
        embed.addFields({ 
          name: '📋 Mais músicas', 
          value: `...e mais ${playlist.tracks.length - 15} músicas` 
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
      
      const playlistName = i.options.getString('playlist');
      const shuffle = i.options.getBoolean('shuffle') || false;
      
      const playlist = await UserPlaylist.findOne({ userId, name: playlistName });
      
      if (!playlist) {
        return i.reply({ content: '❌ Playlist não encontrada!', ephemeral: true });
      }
      
      if (playlist.tracks.length === 0) {
        return i.reply({ content: `❌ A playlist **${playlistName}** está vazia!`, ephemeral: true });
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
      
      // Preparar tracks (shuffle se necessário)
      let tracks = [...playlist.tracks];
      if (shuffle) {
        for (let j = tracks.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [tracks[j], tracks[k]] = [tracks[k], tracks[j]];
        }
      }
      
      let added = 0;
      let failed = 0;
      
      // Adicionar músicas
      for (const track of tracks) {
        try {
          const res = await player.search({ query: track.uri }, i.user);
          
          if (res.tracks.length > 0) {
            await player.queue.add(res.tracks[0]);
            added++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }
      
      if (!player.playing && !player.paused) {
        await player.play();
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`📁 Tocando ${playlistName}`)
        .setDescription(`Adicionadas **${added}** músicas${shuffle ? ' (embaralhadas)' : ''}${failed > 0 ? ` (${failed} falharam)` : ''}`)
        .setFooter({ text: `Total na fila: ${player.queue.tracks.length + 1} músicas` });
      
      return i.editReply({ embeds: [embed] });
    }

    // ========== DELETE ==========
    if (sub === 'delete') {
      const playlistName = i.options.getString('playlist');
      
      const result = await UserPlaylist.findOneAndDelete({ userId, name: playlistName });
      
      if (!result) {
        return i.reply({ content: '❌ Playlist não encontrada!', ephemeral: true });
      }
      
      return i.reply({ 
        content: `🗑️ Playlist **${playlistName}** deletada (tinha ${result.tracks.length} músicas)!`,
        ephemeral: true 
      });
    }

    // ========== REMOVE ==========
    if (sub === 'remove') {
      const playlistName = i.options.getString('playlist');
      const position = i.options.getInteger('posição');
      
      const playlist = await UserPlaylist.findOne({ userId, name: playlistName });
      
      if (!playlist) {
        return i.reply({ content: '❌ Playlist não encontrada!', ephemeral: true });
      }
      
      if (position > playlist.tracks.length) {
        return i.reply({ content: `❌ Posição inválida! A playlist tem ${playlist.tracks.length} músicas.`, ephemeral: true });
      }
      
      const removed = playlist.tracks.splice(position - 1, 1)[0];
      await playlist.save();
      
      return i.reply({ 
        content: `🗑️ Removido de **${playlistName}**: ${removed.title}`,
        ephemeral: true 
      });
    }
  }
};

function formatDuration(ms) {
  if (!ms || ms <= 0) return 'Live';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
