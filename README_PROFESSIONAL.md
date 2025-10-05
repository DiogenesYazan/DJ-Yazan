# 🎵 DJ Yazan - Bot de Música Profissional

[![Discord.js](https://img.shields.io/badge/Discord.js-v14.20.0-blue.svg)](https://discord.js.org)
[![Lavalink](https://img.shields.io/badge/Lavalink-v4-red.svg)](https://lavalink.dev)
[![Node.js](https://img.shields.io/badge/Node.js-v22.11.0-green.svg)](https://nodejs.org)
[![Status](https://img.shields.io/badge/Status-Ativo-success.svg)](https://github.com)

Bot de música profissional para Discord com recursos avançados, interface moderna e alta qualidade de áudio. Desenvolvido com as melhores tecnologias disponíveis.

## ✨ Recursos Principais

### 🎛️ **Painel de Controle Interativo**
- Botões interativos para controle total
- Atualização em tempo real
- Interface moderna e intuitiva
- Suporte a todos os controles principais

### 🎵 **Sistema de Reprodução**
- Alta qualidade de áudio (Lavalink v4)
- Suporte a YouTube e playlists
- Busca avançada com seleção
- Progresso em tempo real
- Sistema de loop (música/fila)

### 🎚️ **10+ Filtros de Áudio**
- 8D Audio
- Bass Boost
- Nightcore
- Vaporwave
- Karaoke
- Soft, Treble, Pop
- Party, Electronic
- E muito mais!

### 📋 **Gerenciamento de Fila**
- Embaralhar músicas
- Remover músicas específicas
- Mover músicas de posição
- Pular para música específica
- Limpar fila completa
- Visualização organizada

### ⚙️ **Configurações Avançadas**
- Modo 24/7 (bot permanece no canal)
- Controle de volume (1-200%)
- Seek (pular para ponto específico)
- Estatísticas detalhadas
- Suporte a múltiplos servidores

## 📋 Lista de Comandos

### 🎵 Reprodução
| Comando | Descrição |
|---------|-----------|
| `/play <música>` | Toca música ou adiciona à fila |
| `/search <música>` | Busca e permite escolher qual música tocar |
| `/playlist <artista>` | Toca playlist completa do artista |
| `/nowplayed` | Mostra música atual com progresso |

### 🎛️ Controle Interativo
| Comando | Descrição |
|---------|-----------|
| `/controller` | Abre painel de controle com botões |
| `/pause` | Pausa ou retoma a reprodução |
| `/skip` | Pula para a próxima música |
| `/jump <posição>` | Pula para música específica da fila |
| `/stop` | Para a reprodução e limpa tudo |

### 📋 Organização da Fila
| Comando | Descrição |
|---------|-----------|
| `/queue` | Mostra todas as músicas na fila |
| `/shuffle` | Embaralha a ordem da fila |
| `/remove <posição>` | Remove música específica |
| `/clear` | Limpa toda a fila |
| `/move <de> <para>` | Move música para outra posição |

### 🎚️ Efeitos e Volume
| Comando | Descrição |
|---------|-----------|
| `/volume <1-200>` | Ajusta o volume da reprodução |
| `/filter <tipo>` | Aplica efeitos de áudio (10+ opções) |
| `/seek <tempo>` | Pula para ponto específico (mm:ss) |
| `/loop <modo>` | Define modo de loop (off/queue/track) |

### ⚙️ Configurações e Utilidades
| Comando | Descrição |
|---------|-----------|
| `/247` | Ativa/desativa modo 24/7 |
| `/stats` | Mostra estatísticas do bot |
| `/about` | Informações sobre o bot |
| `/ping` | Verifica latência e status |
| `/help [comando]` | Mostra ajuda geral ou específica |

## 🚀 Instalação

### Pré-requisitos
- Node.js v18 ou superior
- Conta Discord Developer
- Servidor Lavalink v4 (ou use o público fornecido)

### Passo 1: Clone o Repositório
```bash
git clone https://github.com/seu-usuario/dj-yazan.git
cd dj-yazan
```

### Passo 2: Instale as Dependências
```bash
npm install
```

### Passo 3: Configure o Arquivo .env
```env
TOKEN=seu_token_do_discord_aqui
CLIENT_ID=seu_client_id_aqui
GUILD_ID=seu_guild_id_aqui

# Lavalink (use o servidor público ou configure o seu)
LAVALINK_HOST=lava-v4.ajieblogs.eu.org
LAVALINK_PORT=443
LAVALINK_PASSWORD=https://dsc.gg/ajidevserver
LAVALINK_SECURE=true
```

### Passo 4: Registre os Comandos
```bash
node deploy-commands.js
```

### Passo 5: Inicie o Bot
```bash
node index.js
```

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Discord.js** | v14.20.0 | Framework principal do bot |
| **Lavalink Client** | v2.5.6 | Sistema de áudio |
| **Lavalink Server** | v4 | Servidor de streaming |
| **Quick.db** | v9.1.7 | Database local |
| **Winston** | v3.11.0 | Sistema de logs |
| **Axios** | v1.6.2 | Requisições HTTP |
| **Node.js** | v22.11.0 | Runtime JavaScript |

## 📊 Estatísticas

```
✅ 22+ Comandos Slash
✅ 10+ Filtros de Áudio
✅ Interface 100% Interativa
✅ Suporte a Playlists
✅ Sistema de Loop Avançado
✅ Modo 24/7
✅ Barra de Progresso em Tempo Real
✅ Controle Total via Botões
```

## 🎯 Diferenciais

- ✅ **Interface Profissional**: Design moderno com botões e menus interativos
- ✅ **Alta Qualidade**: Lavalink v4 com SSL/TLS
- ✅ **Filtros Avançados**: 10+ efeitos de áudio profissionais
- ✅ **Organização**: Sistema completo de gerenciamento de fila
- ✅ **Flexibilidade**: Modo 24/7, seek, jump e muito mais
- ✅ **Performance**: Otimizado para múltiplos servidores
- ✅ **Documentação**: Ajuda detalhada para cada comando

## 📸 Screenshots

### Painel de Controle
O comando `/controller` fornece um painel interativo completo com botões para:
- Play/Pause, Skip, Stop
- Shuffle, Volume +/-, Loop
- Atualização em tempo real
- Informações detalhadas da música

### Busca Avançada
O comando `/search` permite:
- Buscar até 10 resultados
- Menu de seleção interativo
- Visualização de duração e autor
- Adição instantânea à fila

### Filtros de Áudio
10+ filtros profissionais:
- 8D Audio (efeito espacial)
- Bass Boost (graves intensos)
- Nightcore (velocidade e pitch)
- Vaporwave (estilo retrô)
- E muito mais!

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para:
1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abrir um Pull Request

## 📝 Changelog

### v2.0.0 - Atualização Profissional (Atual)
- ✅ Migração para Lavalink v4
- ✅ Painel de controle interativo
- ✅ Sistema de busca com menu de seleção
- ✅ 10+ filtros de áudio profissionais
- ✅ Comandos shuffle, remove, clear
- ✅ Comandos move, jump, seek
- ✅ Modo 24/7
- ✅ Comando stats e about
- ✅ Interface completamente renovada
- ✅ Documentação completa

### v1.0.0 - Versão Inicial
- ✅ Comandos básicos de música
- ✅ Sistema de loop manual
- ✅ Suporte a playlists
- ✅ Barra de progresso

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🔗 Links Úteis

- [Discord.js Guia](https://discordjs.guide/)
- [Lavalink Documentation](https://lavalink.dev/)
- [Servidor de Suporte](https://discord.gg/seu-servidor)

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ por **Yazan**

---

⭐ Se você gostou do projeto, considere dar uma estrela!

🐛 Encontrou um bug? [Abra uma issue](https://github.com/seu-usuario/dj-yazan/issues)

💡 Tem uma sugestão? [Contribua!](#-contribuindo)
