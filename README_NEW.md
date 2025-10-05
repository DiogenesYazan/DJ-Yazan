# 🎵 DJ Yazan - Bot de Música Discord

Bot de música para Discord com suporte a **Lavalink v4**, desenvolvido com **Discord.js v14** e **lavalink-client v2.5.6**.

![Bot Status](https://img.shields.io/badge/status-online-brightgreen)
![Node Version](https://img.shields.io/badge/node-v22.11.0-blue)
![Discord.js](https://img.shields.io/badge/discord.js-v14.20.0-blue)
![Lavalink](https://img.shields.io/badge/lavalink-v4-orange)

## 🚀 Recursos

- ✅ **Lavalink v4** - Streaming de áudio de alta qualidade
- 🎶 **Fila de Músicas** - Sistema completo de gerenciamento de fila
- 🔁 **Sistema de Loop** - Loop de música única ou fila completa
- 📊 **Barra de Progresso** - Visualização em tempo real com timestamps
- 🎨 **Embeds Bonitos** - Interface visual atraente
- 🔊 **Controle de Volume** - Ajuste de 0% a 200%
- ⏯️ **Controles Completos** - Play, pause, skip, stop
- 📝 **Sistema de Ajuda** - Documentação integrada de comandos
- 🌐 **Multi-Servidor** - Suporte a múltiplos servidores Discord
- 🔄 **Auto-Reconnect** - Reconexão automática ao Lavalink

## 📋 Comandos

| Comando | Descrição | Uso |
|---------|-----------|-----|
| `/play <música>` | Toca uma música ou adiciona à fila | `/play never gonna give you up` |
| `/pause` | Pausa a música atual | `/pause` |
| `/skip` | Pula para a próxima música | `/skip` |
| `/stop` | Para a música e limpa a fila | `/stop` |
| `/queue` | Mostra as músicas na fila | `/queue` |
| `/nowplayed` | Exibe a música atual com barra de progresso | `/nowplayed` |
| `/loop <mode>` | Define o modo de loop | `/loop track` ou `/loop queue` ou `/loop off` |
| `/volume <0-200>` | Ajusta o volume | `/volume 80` |
| `/playlist <url>` | Adiciona uma playlist do YouTube | `/playlist https://youtube.com/playlist?list=...` |
| `/help [comando]` | Mostra ajuda geral ou específica | `/help play` |
| `/ping` | Verifica a latência do bot | `/ping` |

## 🛠️ Tecnologias

- **Node.js** v22.11.0+
- **Discord.js** v14.20.0
- **lavalink-client** v2.5.6 (compatível com Lavalink v4)
- **yt-search** v2.13.1
- **dotenv** v16.5.0

## 📦 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/DiogenesYazan/DJ-Yazan.git
cd DJ-Yazan
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Discord Bot Token
TOKEN=seu_token_do_discord
CLIENT_ID=seu_client_id

# Lavalink Server v4 Configuration
LAVA_HOST=lava-v4.ajieblogs.eu.org
LAVA_PORT=443
LAVA_PASSWORD=https://dsc.gg/ajidevserver
LAVA_SECURE=true
```

> **Nota:** O servidor Lavalink configurado por padrão é público e gratuito. Para produção, considere usar seu próprio servidor.

### 4. Registre os comandos slash
```bash
npm run deploy
```

### 5. Inicie o bot
```bash
npm start
```

## 🎛️ Configuração do Lavalink

### Servidor Público Recomendado

O bot está configurado por padrão para usar um servidor Lavalink v4 público e confiável:

- **Host:** lava-v4.ajieblogs.eu.org
- **Port:** 443
- **Password:** https://dsc.gg/ajidevserver
- **Secure:** true (SSL/TLS)
- **Version:** Lavalink v4.x

**Fonte:** https://lavalink-list.darrennathanael.com/SSL/Lavalink-SSL/

### Servidores Alternativos

Você pode encontrar mais servidores públicos em:
- https://lavalink-list.darrennathanael.com/
- https://lavalink.darrenofficial.com/

### Configurar Servidor Local

Para usar seu próprio servidor Lavalink:

1. **Baixe o Lavalink v4:**
   ```bash
   wget https://github.com/lavalink-devs/Lavalink/releases/download/4.0.0/Lavalink.jar
   ```

2. **Configure o `application.yml`:**
   ```yaml
   server:
     port: 2333
     address: 0.0.0.0
   lavalink:
     server:
       password: "youshallnotpass"
   ```

3. **Execute:**
   ```bash
   java -jar Lavalink.jar
   ```

4. **Atualize o `.env`:**
   ```env
   LAVA_HOST=localhost
   LAVA_PORT=2333
   LAVA_PASSWORD=youshallnotpass
   LAVA_SECURE=false
   ```

## 🔧 Estrutura do Projeto

```
DJ-Yazan/
├── commands/              # Comandos slash do bot
│   ├── help.js           # Sistema de ajuda completo
│   ├── loop.js           # Controle de loop (off/track/queue)
│   ├── nowPlayed.js      # Exibe música atual com progresso
│   ├── pause.js          # Pausar/retomar música
│   ├── ping.js           # Verificar latência
│   ├── play.js           # Tocar música (YouTube)
│   ├── playlist.js       # Adicionar playlist inteira
│   ├── queue.js          # Visualizar fila de músicas
│   ├── skip.js           # Pular para próxima
│   ├── stop.js           # Parar e limpar fila
│   └── volume.js         # Ajustar volume (0-200%)
├── index.js              # Arquivo principal do bot
├── deploy-commands.js    # Script de registro de comandos
├── package.json          # Dependências do projeto
├── .env                  # Variáveis de ambiente (não versionado)
├── Procfile             # Configuração para Heroku
└── README.md            # Documentação
```

## 📱 Deploy no Heroku

### Passo a Passo

1. **Crie uma aplicação Heroku:**
   ```bash
   heroku create dj-yazan-bot
   ```

2. **Configure as variáveis de ambiente:**
   ```bash
   heroku config:set TOKEN=seu_token_aqui
   heroku config:set CLIENT_ID=seu_client_id
   heroku config:set LAVA_HOST=lava-v4.ajieblogs.eu.org
   heroku config:set LAVA_PORT=443
   heroku config:set LAVA_PASSWORD="https://dsc.gg/ajidevserver"
   heroku config:set LAVA_SECURE=true
   ```

3. **Deploy:**
   ```bash
   git push heroku main
   ```

4. **Escale o worker:**
   ```bash
   heroku ps:scale worker=1
   ```

5. **Verifique os logs:**
   ```bash
   heroku logs --tail
   ```

### Configuração Alternativa (Interface Web)

1. Acesse o [Dashboard do Heroku](https://dashboard.heroku.com/)
2. Selecione sua aplicação
3. Vá em **Settings** → **Config Vars**
4. Adicione as variáveis de ambiente
5. Em **Resources**, ative o worker `worker: node index.js`

## 🔍 Solução de Problemas

### ❌ Bot não conecta ao Lavalink

**Sintomas:**
```
⏳ Tentando conectar aos servidores Lavalink...
⚠️ Conexão demorou mais que o esperado...
```

**Soluções:**
1. Verifique se as credenciais no `.env` estão corretas
2. Confirme se o servidor Lavalink está online: https://lavalink-list.darrennathanael.com/
3. Teste outro servidor Lavalink da lista
4. Verifique se a porta não está bloqueada por firewall
5. Veja os logs completos: `heroku logs --tail` (Heroku) ou console local

### 🎵 Música não toca

**Sintomas:**
- Bot entra no canal mas não reproduz áudio
- Mensagem de "Tocando agora" aparece mas sem som

**Soluções:**
1. Confirme que o Lavalink está conectado (veja logs: `✅ Conectado ao Lavalink`)
2. Verifique se você está em um canal de voz
3. Teste com músicas diferentes (algumas podem estar restritas por região)
4. Use `/nowplayed` para verificar se a música está carregada
5. Tente usar links diretos do YouTube ao invés de pesquisas

### 🔒 Erro de permissões

**Sintomas:**
```
❌ Erro: Missing Permissions
```

**Soluções:**

Certifique-se de que o bot tem as seguintes permissões no servidor:

**Permissões de Canal de Voz:**
- ✅ Conectar
- ✅ Falar
- ✅ Ver canal de voz

**Permissões de Canal de Texto:**
- ✅ Enviar mensagens
- ✅ Embedar links
- ✅ Adicionar reações
- ✅ Ver mensagens

**Como conceder permissões:**
1. Configurações do Servidor → Papéis
2. Selecione o papel do bot
3. Ative as permissões necessárias
4. Ou vá em Configurações do Canal → Permissões → Adicione o bot

### 📊 Barra de progresso não atualiza

**Soluções:**
1. A barra atualiza a cada 5 segundos automaticamente
2. Verifique se a mensagem não foi deletada
3. Use `/nowplayed` para ver informações atualizadas manualmente

### 🔁 Loop não funciona

**Soluções:**
1. Use `/loop track` para loop da música atual
2. Use `/loop queue` para loop da fila completa
3. Use `/loop off` para desativar
4. O modo atual aparece quando a fila termina

## 🎓 Como Usar

### Exemplo Básico

```
1. Entre em um canal de voz
2. /play never gonna give you up
3. Bot entra no canal e começa a tocar
4. /nowplayed para ver a barra de progresso
5. /queue para ver músicas na fila
```

### Exemplo com Playlist

```
1. /playlist https://youtube.com/playlist?list=...
2. Bot adiciona até 25 músicas da playlist
3. /queue para visualizar todas
4. /loop queue para repetir a playlist
```

### Controles Durante Reprodução

```
⏸️ /pause           - Pausar
▶️ /pause (novamente) - Retomar
⏭️ /skip            - Próxima música
🔊 /volume 150      - Aumentar volume
🔁 /loop track      - Repetir música atual
🛑 /stop            - Parar tudo
```

## 🤝 Contribuindo

Contribuições são muito bem-vindas! 

### Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch para sua feature:
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```
3. **Commit** suas mudanças:
   ```bash
   git commit -m 'Adiciona MinhaNovaFeature'
   ```
4. **Push** para a branch:
   ```bash
   git push origin feature/MinhaNovaFeature
   ```
5. **Abra** um Pull Request

### Diretrizes

- Mantenha o código limpo e bem comentado
- Siga o estilo de código existente
- Teste suas mudanças antes de enviar
- Atualize a documentação se necessário

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

**Diogenes Yazan**

- 🐙 GitHub: [@DiogenesYazan](https://github.com/DiogenesYazan)
- 📧 Email: contato@exemplo.com

## 🙏 Agradecimentos

- [Discord.js](https://discord.js.org/) - Biblioteca Discord para Node.js
- [Lavalink](https://github.com/lavalink-devs/Lavalink) - Servidor de streaming de áudio standalone
- [lavalink-client](https://github.com/tomato6966/lavalink-client) - Cliente Lavalink v4 para Node.js
- [yt-search](https://github.com/talmobi/yt-search) - Busca de vídeos do YouTube
- [lavalink-list.darrennathanael.com](https://lavalink-list.darrennathanael.com/) - Lista de servidores Lavalink públicos

## 🌟 Apoie o Projeto

Se este projeto foi útil para você, considere:

- ⭐ Dar uma estrela no GitHub
- 🐛 Reportar bugs e sugerir features
- 💬 Compartilhar com outros desenvolvedores
- 🤝 Contribuir com código

---

**Desenvolvido com ❤️ por Diogenes Yazan**

**Última atualização:** Outubro 2025
