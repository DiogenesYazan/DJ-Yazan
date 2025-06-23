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
* 📊 **Barra de progresso** em blocos (▇) simples e funcional.
* ❌ **Tratamento de erros** com mensagens claras no canal.
* 💬 **Comandos slash** organizados na pasta `commands/`.

## 📦 Pré-requisitos

* Node.js **v16+**
* Instância de **Lavalink** (self-host ou serviço terceirizado)
* Token de bot do Discord e variáveis em `.env`

## ⚙️ Instalação & Configuração

1. **Clone** o repositório:

   ```bash
   git clone https://github.com/seu-usuario/dj-yazan-lavalink.git
   cd dj-yazan-lavalink
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
4. **Inicie** seu bot:

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

## 🔄 Fluxo Interno

1. Bot inicializa e **carrega comandos**.
2. `/play` ou `/playlist` busca faixas no YouTube.
3. Faixas são **enfileiradas** no player Lavalink.
4. Envia **embed** com barra de blocos (▇) atualizada a cada 15 s.
5. Limpa temporizadores no fim da música/fila.
6. Exibe mensagens de erro e status no canal.

## 📁 Estrutura do Projeto

```
├── commands/       # Comandos slash (play.js, playlist.js, skip.js, stop.js)
├── index.js        # Entry-point do bot
├── .env.example    # Variáveis de ambiente modelo
├── package.json    # Dependências e scripts
└── README.md       # Documentação desse projeto
```

## 🤝 Contribuições

1. Faça um **fork** deste repositório.
2. Crie uma branch `feature/nome-da-feature`.
3. Implemente suas mudanças e **commit**.
4. Abra um **Pull Request**.

---

> Projeto desenvolvido por **Yazan**. 👨‍💻
