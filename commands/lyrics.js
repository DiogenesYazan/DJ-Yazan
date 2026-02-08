const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// APIs de letras (em ordem de prioridade)
const LYRICS_APIS = [
  {
    name: 'LyricsOVH',
    search: async (artist, title) => {
      const res = await fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.lyrics || null;
    }
  },
  {
    name: 'Lrclib',
    search: async (artist, title) => {
      const query = `${artist} ${title}`.trim();
      const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.length > 0) {
        // Pega a primeira que tem letra
        const track = data.find(t => t.plainLyrics) || data[0];
        return track?.plainLyrics || null;
      }
      return null;
    }
  },
  {
    name: 'LyricsFinder',
    search: async (artist, title) => {
      // API alternativa
      const query = `${artist} ${title}`.trim();
      const res = await fetch(`https://some-random-api.com/lyrics?title=${encodeURIComponent(query)}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.lyrics || null;
    }
  }
];

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
      artist = cleanArtist(artist);
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
    
    try {
      let lyrics = null;
      let source = null;
      
      // Tenta cada API até encontrar
      for (const api of LYRICS_APIS) {
        try {
          lyrics = await api.search(artist, title);
          if (lyrics) {
            source = api.name;
            break;
          }
        } catch (err) {
          console.log(`[Lyrics] ${api.name} falhou:`, err.message);
        }
      }
      
      // Se não encontrou e tem artista, tenta só com título
      if (!lyrics && artist) {
        for (const api of LYRICS_APIS) {
          try {
            lyrics = await api.search('', title);
            if (lyrics) {
              source = api.name;
              break;
            }
          } catch (err) {
            // Ignora
          }
        }
      }
      
      if (!lyrics) {
        return i.editReply({ 
          content: `❌ Letra não encontrada para **${title}**${artist ? ` - ${artist}` : ''}\n\n` +
                   `💡 **Dicas:**\n` +
                   `• Tente: \`/lyrics <artista> - <música>\`\n` +
                   `• Use o nome em inglês se for música internacional\n` +
                   `• Verifique a ortografia`
        });
      }
      
      // Limpa a letra
      lyrics = lyrics.trim();
      
      // Dividir letra em partes se muito longa
      const maxLength = 4000;
      
      if (lyrics.length <= maxLength) {
        const embed = new EmbedBuilder()
          .setColor(0x1DB954) // Verde Spotify
          .setTitle(`🎤 ${title}`)
          .setDescription(lyrics)
          .setFooter({ text: `${artist ? `${artist} • ` : ''}Fonte: ${source}` });
        
        return i.editReply({ embeds: [embed] });
      } else {
        // Letra muito longa - divide em partes
        const parts = splitLyrics(lyrics, 3900);
        
        const embed = new EmbedBuilder()
          .setColor(0x1DB954)
          .setTitle(`🎤 ${title}`)
          .setDescription(parts[0] + '\n\n*[Continua...]*')
          .setFooter({ text: `Parte 1/${parts.length} • ${artist ? `${artist} • ` : ''}Fonte: ${source}` });
        
        await i.editReply({ embeds: [embed] });
        
        // Envia partes restantes como follow-up
        for (let idx = 1; idx < Math.min(parts.length, 3); idx++) {
          const partEmbed = new EmbedBuilder()
            .setColor(0x1DB954)
            .setDescription(parts[idx])
            .setFooter({ text: `Parte ${idx + 1}/${parts.length}` });
          
          await i.followUp({ embeds: [partEmbed] });
        }
        
        if (parts.length > 3) {
          await i.followUp({ content: `⚠️ Letra muito longa. Mostrando 3 de ${parts.length} partes.` });
        }
      }
      
    } catch (error) {
      console.error('Erro ao buscar letra:', error);
      return i.editReply({ content: `❌ Erro ao buscar letra. Tente novamente mais tarde.` });
    }
  }
};

// Limpar título de coisas comuns
function cleanTitle(title) {
  return title
    // Remove (Official Video), [Official Audio], etc.
    .replace(/[\[\(].*?(official|video|audio|lyric|lyrics|hd|hq|4k|remaster|live|remix|version).*?[\]\)]/gi, '')
    // Remove feat., ft., etc.
    .replace(/\s*(feat\.|ft\.|featuring|prod\.|prod by)\s*.*/gi, '')
    // Remove "- Topic" do YouTube Music
    .replace(/\s*-\s*Topic$/gi, '')
    // Remove "VEVO" e similares
    .replace(/\s*vevo$/gi, '')
    // Remove espaços extras
    .replace(/\s+/g, ' ')
    .trim();
}

// Limpar nome do artista
function cleanArtist(artist) {
  return artist
    // Remove "- Topic" do YouTube Music
    .replace(/\s*-\s*Topic$/gi, '')
    // Remove "VEVO"
    .replace(/\s*vevo$/gi, '')
    // Remove "Official"
    .replace(/\s*official$/gi, '')
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
