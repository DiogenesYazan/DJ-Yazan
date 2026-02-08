const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLyrics, searchSong } = require('genius-lyrics-api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lyrics')
    .setDescription('Mostra a letra da música atual ou de uma busca')
    .addStringOption(opt => 
      opt.setName('busca')
        .setDescription('Nome da música (deixe vazio para a música atual)')
        .setRequired(false)),

  async execute(i) {
    await i.deferReply();
    
    const searchQuery = i.options.getString('busca');
    let title, artist;
    
    // Se não forneceu busca, usa a música atual
    if (!searchQuery) {
      const player = i.client.lavalink.getPlayer(i.guild.id);
      
      if (!player || !player.queue.current) {
        return i.editReply({ content: '❌ Nenhuma música tocando! Use `/lyrics <nome da música>` para buscar.' });
      }
      
      const track = player.queue.current;
      // Tenta separar título e artista
      title = track.info.title;
      artist = track.info.author;
      
      // Limpa título de coisas comuns
      title = cleanTitle(title);
    } else {
      // Usa a busca fornecida
      const parts = searchQuery.split(' - ');
      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      } else {
        title = searchQuery;
        artist = '';
      }
    }
    
    // Verificar se tem API key
    const apiKey = process.env.GENIUS_ACCESS_TOKEN;
    if (!apiKey) {
      return i.editReply({ content: '❌ API do Genius não configurada. Contate o administrador.' });
    }
    
    try {
      // Buscar letra
      const options = {
        apiKey: apiKey,
        title: title,
        artist: artist,
        optimizeQuery: true
      };
      
      const lyrics = await getLyrics(options);
      
      if (!lyrics) {
        // Tentar buscar música primeiro
        const songs = await searchSong({
          apiKey: apiKey,
          title: title,
          optimizeQuery: true
        });
        
        if (songs && songs.length > 0) {
          return i.editReply({ 
            content: `❌ Letra não encontrada para **${title}**\n\nMúsicas encontradas:\n${songs.slice(0, 5).map((s, idx) => `${idx + 1}. ${s.title} - ${s.artist.name}`).join('\n')}\n\nTente: \`/lyrics <artista> - <música>\``
          });
        }
        
        return i.editReply({ content: `❌ Letra não encontrada para **${title}**. Tente ser mais específico.` });
      }
      
      // Dividir letra em partes se muito longa
      const maxLength = 4000; // Limite do embed
      
      if (lyrics.length <= maxLength) {
        const embed = new EmbedBuilder()
          .setColor(0xFFFF64) // Amarelo do Genius
          .setTitle(`🎤 ${title}`)
          .setDescription(lyrics)
          .setFooter({ text: `${artist ? `Artista: ${artist} • ` : ''}Powered by Genius` });
        
        return i.editReply({ embeds: [embed] });
      } else {
        // Letra muito longa - divide em partes
        const parts = splitLyrics(lyrics, 3900);
        
        const embed = new EmbedBuilder()
          .setColor(0xFFFF64)
          .setTitle(`🎤 ${title}`)
          .setDescription(parts[0] + '\n\n*[Continua...]*')
          .setFooter({ text: `Parte 1/${parts.length} • ${artist ? `${artist} • ` : ''}Powered by Genius` });
        
        await i.editReply({ embeds: [embed] });
        
        // Envia partes restantes como follow-up
        for (let idx = 1; idx < Math.min(parts.length, 3); idx++) {
          const partEmbed = new EmbedBuilder()
            .setColor(0xFFFF64)
            .setDescription(parts[idx])
            .setFooter({ text: `Parte ${idx + 1}/${parts.length}` });
          
          await i.followUp({ embeds: [partEmbed] });
        }
        
        if (parts.length > 3) {
          await i.followUp({ content: `⚠️ Letra muito longa. Mostrando ${3} de ${parts.length} partes.` });
        }
      }
      
    } catch (error) {
      console.error('Erro ao buscar letra:', error);
      return i.editReply({ content: `❌ Erro ao buscar letra: ${error.message}` });
    }
  }
};

// Limpar título de coisas comuns
function cleanTitle(title) {
  return title
    // Remove (Official Video), [Official Audio], etc.
    .replace(/[\[\(].*?(official|video|audio|lyric|lyrics|hd|hq|4k|remaster).*?[\]\)]/gi, '')
    // Remove feat., ft., etc.
    .replace(/\s*(feat\.|ft\.|featuring)\s*.*/gi, '')
    // Remove "- Topic" do YouTube Music
    .replace(/\s*-\s*Topic$/gi, '')
    // Remove espaços extras
    .replace(/\s+/g, ' ')
    .trim();
}

// Dividir letra em partes
function splitLyrics(lyrics, maxLength) {
  const parts = [];
  let current = '';
  
  const lines = lyrics.split('\n');
  
  for (const line of lines) {
    if ((current + '\n' + line).length > maxLength) {
      parts.push(current.trim());
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }
  
  return parts;
}
