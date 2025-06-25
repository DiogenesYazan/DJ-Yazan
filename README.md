# 🎧 DJ-Yazan-Lavalink Bot

Este projeto é um **bot de música para Discord** escrito em Node.js, que utiliza a arquitetura **Lavalink** para reprodução de áudio ao invés de depender do FFmpeg local.

<img src="https://i.imgur.com/vMKyYzv.png" alt="Exemplo embed com barra de progresso" />

## 🖼️ Descrição

> Bot de música para Discord usando **Lavalink**. Toca músicas do YouTube por nome ou link, com barra de progresso em blocos (▇) atualizada a cada 15 segundos.

## ⚙️ Recursos

* 🎶 **Reproduzir músicas** por nome ou link (YouTube).
* ➕ **Adicionar à fila** sem interromper a música atual.
* 📜 **Playlist**: busca e toca até 25 faixas de um artista em sequência.
* ⏭️ **Skip** e 🛑 **Stop** para gerenciar a reprodução.
* ⏸️ **Pause/Resume** para pausar e retomar a reprodução.
* 🔊 **Controle de volume** (1-200%).
* � **Sistema de loop** (off, faixa única, fila completa).
* �📊 **Visualização da fila** de músicas.
* 🎵 **Now Playing** com barra de progresso detalhada.
* 🏓 **Comando ping** para verificar latência.
* 📊 **Barra de progresso** em blocos (▇) atualizada a cada 15 segundos.
* 📱 **Status dinâmico** com rotação de atividades.
* ❌ **Tratamento de erros** com mensagens claras no canal.
* 💬 **Comandos slash** organizados na pasta `commands/`.

## 📦 Pré-requisitos

* Node.js **v16+**
* Instância de **Lavalink** (self-host ou serviço terceirizado)
* Token de bot do Discord e variáveis em `.env`

## ⚙️ Instalação & Configuração

1. **Clone** o repositório:

   ```bash
   git clone https://github.com/DiogenesYazan/DJ-Yazan.git
   cd DJ-Yazan
   ```
2. **Instale** dependências:

   ```bash
   npm install
   ```
3. **Configure** o arquivo `.env` (baseie-se no `.env.example`):

   ```env
   TOKEN=<seu_token_discord>
   CLIENT_ID=<seu_client_id>
   LAVA_HOST=<host_do_lavalink>
   LAVA_PORT=<porta_do_lavalink>
   LAVA_PASSWORD=<senha_do_lavalink>
   LAVA_SECURE=true
   ```
4. **Registre os comandos** (necessário apenas uma vez):

   ```bash
   node deploy-commands.js
   ```

5. **Inicie** seu bot:

   ```bash
   npm start
   ```

## 🕹️ Uso dos Comandos

| Comando              | Descrição                                                      |
| -------------------- | -------------------------------------------------------------- |
| `/play <query>`      | Adiciona música à fila e inicia a reprodução se necessário     |
| `/playlist <artist>` | Busca 25 músicas mais populares do artista e toca em sequência |
| `/skip`              | Pula para a próxima faixa                                      |
| `/stop`              | Interrompe a reprodução e limpa a fila                         |
| `/pause`             | Pausa a música atual                                           |
| `/volume <1-200>`    | Define o volume da reprodução (1-200%)                        |
| `/loop <mode>`       | Alterna entre modos de loop (off/queue/track)                 |
| `/queue`             | Mostra a fila atual de músicas                                |
| `/nowplayed`         | Exibe informações da música atual com barra de progresso      |
| `/ping`              | Verifica a latência do bot e conexão                          |

## 🔄 Fluxo Interno

1. Bot inicializa e **carrega comandos** automaticamente.
2. **Conecta ao Lavalink** e configura status dinâmico.
3. `/play` ou `/playlist` busca faixas no YouTube.
4. Faixas são **enfileiradas** no player Lavalink.
5. Envia **embed** com barra de blocos (▇) atualizada a cada 15 s.
6. **Sistema de loop** permite repetir faixas ou filas.
7. **Controles de reprodução** (pause, skip, stop, volume).
8. Limpa temporizadores no fim da música/fila.
9. Exibe mensagens de erro e status no canal.

## 📁 Estrutura do Projeto

```
├── commands/          # Comandos slash do bot
│   ├── loop.js        # Sistema de loop (off/queue/track)
│   ├── nowPlayed.js   # Exibe música atual com progresso
│   ├── pause.js       # Pausa a reprodução
│   ├── ping.js        # Verifica latência
│   ├── play.js        # Adiciona música à fila
│   ├── playlist.js    # Toca playlist de artista
│   ├── queue.js       # Mostra fila de músicas
│   ├── skip.js        # Pula para próxima música
│   ├── stop.js        # Para reprodução e limpa fila
│   └── volume.js      # Controla volume (1-200%)
├── deploy-commands.js # Script para registrar comandos slash
├── index.js           # Entry-point do bot
├── package.json       # Dependências e scripts
├── Procfile          # Configuração para deploy (Heroku)
├── .env.example      # Variáveis de ambiente modelo
├── .gitignore        # Arquivos ignorados pelo Git
└── README.md         # Documentação do projeto
```

## 📦 Dependências

O projeto utiliza as seguintes bibliotecas principais:

- **discord.js** v14.20.0 - SDK oficial do Discord para Node.js
- **lavalink-client** v2.5.6 - Cliente para conectar com servidor Lavalink
- **yt-search** v2.13.1 - Busca de vídeos no YouTube
- **ytdl-core** v4.11.5 - Download de informações de vídeos do YouTube
- **string-progressbar** v1.0.4 - Criação de barras de progresso
- **dotenv** v16.5.0 - Carregamento de variáveis de ambiente

## 🤝 Contribuições

1. Faça um **fork** deste repositório.
2. Crie uma branch `feature/nome-da-feature`.
3. Implemente suas mudanças e **commit**.
4. Abra um **Pull Request**.

## 🚀 Deploy

O projeto está configurado para deploy no **Heroku** com o arquivo `Procfile` incluído:

```
worker: node index.js
```

Para fazer deploy:

1. Crie um app no Heroku
2. Configure as variáveis de ambiente no painel do Heroku
3. Conecte seu repositório GitHub
4. Faça o deploy da branch principal

## 🎯 Funcionalidades Avançadas

### Sistema de Loop
- **Off**: Reprodução normal sem repetição
- **Queue**: Repete toda a fila quando terminar
- **Track**: Repete a música atual indefinidamente

### Barra de Progresso Inteligente
- Atualização automática a cada 15 segundos
- Visualização em blocos (▇) para melhor experiência
- Exibição de tempo atual e total da música

### Status Dinâmico
O bot alterna entre diferentes status a cada 30 segundos:
- ♬ tocando música
- 🎵 use /play para ouvir
- 🎶 música é vida
- E muito mais...

---

> Projeto desenvolvido por **Yazan**. 👨‍💻
