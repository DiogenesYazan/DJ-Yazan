
# <img src="https://i.imgur.com/4t8XUT5.jpeg" alt="Logo DJ Yazan" width="60" style="vertical-align:middle;"/> DJ-Yazan — O Bot Musical Definitivo!

Este projeto é um **bot de música para Discord** escrito em Node.js, com foco em estabilidade, diversão e recursos avançados. Utiliza **Lavalink** para reprodução de áudio e troca automaticamente de servidor caso um caia — a festa nunca para!

<img src="https://i.imgur.com/dMMcU8l.png" alt="DJ Yazan tocando música" />

## 🖼️ Descrição

DJ Yazan é um bot de música para Discord com interface moderna, comandos slash, jogos interativos e sistema de failover automático de servidores Lavalink. Toca músicas do YouTube, playlists, faz quizzes, e muito mais!

<p>
<img src="https://i.imgur.com/KzpRtBB.png" width="350"/>
<img src="https://i.imgur.com/ED8oWkr.png" width="350"/>
<img src="https://i.imgur.com/n3MhLLD.png" width="350"/>
</p>

## ⚙️ Recursos Principais

* 🎵 **Música 24/7** — troca automática de servidor Lavalink se cair
* 🧠 **/quiz** — desafie amigos com perguntas de cultura pop, animes, games e mais!
* 🎲 **Jogos interativos**: blackjack, tictactoe, hangman, wordle, reaction, e outros
* ➕ **Adicionar à fila** sem interromper a música atual
* 📜 **Playlist**: busca e toca até 25 faixas de um artista em sequência
* ⏭️ **Skip** e 🛑 **Stop** para gerenciar a reprodução
* ⏸️ **Pause/Resume** para pausar e retomar a reprodução
* 🔊 **Controle de volume** (1-200%)
* 🔁 **Sistema de loop** (off, faixa única, fila completa)
* 📊 **Barra de progresso animada**
* 📱 **Status dinâmico** com rotação de atividades
* 🎤 **Letras de músicas** (Genius)
* 📈 **Ranking e estatísticas de usuários**
* ❌ **Tratamento de erros** com mensagens claras no canal
* 💬 **Comandos slash** organizados na pasta `commands/`

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

## 🕹️ Comandos em Destaque

| Comando              | Descrição                                                                 |
| -------------------- | ------------------------------------------------------------------------- |
| `/play <query>`      | Adiciona música à fila e inicia a reprodução se necessário                |
| `/playlist <artist>` | Busca 25 músicas mais populares do artista e toca em sequência           |
| `/quiz`              | Jogo de perguntas e respostas com ranking, temas variados e diversão!    |
| `/skip`              | Pula para a próxima faixa                                                |
| `/stop`              | Interrompe a reprodução e limpa a fila                                   |
| `/pause`             | Pausa a música atual                                                    |
| `/volume <1-200>`    | Define o volume da reprodução (1-200%)                                 |
| `/loop <mode>`       | Alterna entre modos de loop (off/queue/track)                          |
| `/queue`             | Mostra a fila atual de músicas                                          |
| `/nowplayed`         | Exibe informações da música atual com barra de progresso               |
| `/about`             | Mostra informações, links e imagens do bot                             |
| `/ping`              | Verifica a latência do bot e conexão                                   |

## 🔄 Como Funciona

1. Bot inicializa e carrega comandos automaticamente.
2. Conecta ao(s) servidor(es) Lavalink. Se um cair, troca automaticamente para outro disponível.
3. `/play`, `/playlist` ou `/quiz` buscam faixas, perguntas e interagem com os usuários.
4. Faixas são enfileiradas no player Lavalink.
5. Barra de progresso animada e atualizada a cada 15s.
6. Sistema de loop, ranking, jogos e quizzes.
7. Mensagens de erro e status sempre claras no canal.

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

## 📦 Principais Tecnologias

- **discord.js** v14.20.0 — SDK oficial do Discord para Node.js
- **lavalink-client** v2.5.6 — Cliente para conectar com servidor Lavalink
- **yt-search** v2.13.1 — Busca de vídeos no YouTube
- **ytdl-core** v4.11.5 — Download de informações de vídeos do YouTube
- **string-progressbar** v1.0.4 — Criação de barras de progresso
- **dotenv** v16.5.0 — Carregamento de variáveis de ambiente
- **MongoDB** — Armazenamento de dados e ranking

## 🤝 Contribuições

1. Faça um **fork** deste repositório.
2. Crie uma branch `feature/nome-da-feature`.
3. Implemente suas mudanças e **commit**.
4. Abra um **Pull Request**.

## 🚀 Deploy

O projeto está pronto para deploy no **Heroku** (Procfile incluso) ou qualquer serviço Node.js.

```
worker: node index.js
```

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

### Quiz Interativo
- Comando `/quiz` com perguntas de cultura pop, animes, games, esportes e mais
- Ranking de acertos por usuário
- Diversão garantida para toda a guilda

### Failover Automático de Lavalink
- Se um servidor cair, o bot troca automaticamente para outro disponível
- A música nunca para!

### Status Dinâmico
O bot alterna entre diferentes status a cada 30 segundos:
- ♬ tocando música
- 🎵 use /play para ouvir
- 🎶 música é vida
- E muito mais...

---

<p align="center">
<b>Site do bot:</b> <a href="https://dj-yazan-841149114742.herokuapp.com/">dj-yazan-841149114742.herokuapp.com</a><br>
<b>Adicione ao seu servidor e veja todos os comandos!</b>
</p>

> Projeto desenvolvido por **Diogenes Yazan**. 👨‍💻
