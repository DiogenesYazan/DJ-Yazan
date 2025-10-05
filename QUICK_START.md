# 🚀 Guia Rápido - DJ Yazan Bot

## Início Rápido (5 minutos)

### 1️⃣ Clonar e Instalar

```bash
git clone https://github.com/DiogenesYazan/DJ-Yazan.git
cd DJ-Yazan
npm install
```

### 2️⃣ Configurar `.env`

Crie um arquivo `.env` com:

```env
TOKEN=SEU_TOKEN_DISCORD
CLIENT_ID=SEU_CLIENT_ID
LAVA_HOST=lava-v4.ajieblogs.eu.org
LAVA_PORT=443
LAVA_PASSWORD=https://dsc.gg/ajidevserver
LAVA_SECURE=true
```

### 3️⃣ Registrar Comandos

```bash
npm run deploy
```

### 4️⃣ Iniciar o Bot

```bash
npm start
```

Você verá:
```
✅ Online: Seu Bot#1234
🎵 Inicializando Lavalink Manager...
📡 Servidor: lava-v4.ajieblogs.eu.org:443
🔐 Secure: SSL/TLS
✅ Conectado ao Lavalink: main_lavalink
```

## 🎮 Uso Básico

### Tocar uma Música

```
1. Entre em um canal de voz
2. /play <nome da música ou link>
3. Bot começa a tocar!
```

**Exemplo:**
```
/play never gonna give you up
/play https://youtube.com/watch?v=dQw4w9WgXcQ
```

### Comandos Essenciais

| Comando | O que faz |
|---------|-----------|
| `/play <música>` | Toca ou adiciona à fila |
| `/nowplayed` | Mostra música atual |
| `/queue` | Lista próximas músicas |
| `/skip` | Pula música |
| `/pause` | Pausa/retoma |
| `/stop` | Para tudo |
| `/volume 100` | Ajusta volume |
| `/loop track` | Repete música |
| `/help` | Ajuda completa |

## 🎯 Cenários Comuns

### 📝 Criar uma Fila de Músicas

```
/play primeira música
/play segunda música
/play terceira música
/queue  # Ver todas
```

### 🔁 Repetir uma Música Favorita

```
/play sua música favorita
/loop track
# A música tocará infinitamente
/loop off  # Para desativar
```

### 📀 Tocar uma Playlist Inteira

```
/playlist https://youtube.com/playlist?list=PLxxxx
# Adiciona até 25 músicas
/queue  # Verificar
/loop queue  # Repetir playlist
```

### 🎚️ Ajustar Áudio

```
/volume 50   # Volume baixo
/volume 100  # Volume normal
/volume 150  # Volume alto
/volume 200  # Volume máximo
```

## 🔧 Deploy Rápido no Heroku

### Opção 1: Via CLI

```bash
# Login
heroku login

# Criar app
heroku create seu-bot-nome

# Configurar variáveis
heroku config:set TOKEN=seu_token
heroku config:set CLIENT_ID=seu_id
heroku config:set LAVA_HOST=lava-v4.ajieblogs.eu.org
heroku config:set LAVA_PORT=443
heroku config:set LAVA_PASSWORD="https://dsc.gg/ajidevserver"
heroku config:set LAVA_SECURE=true

# Deploy
git push heroku main

# Ativar worker
heroku ps:scale worker=1

# Ver logs
heroku logs --tail
```

### Opção 2: Via Interface Web

1. Acesse https://dashboard.heroku.com/
2. New → Create new app
3. Settings → Config Vars → Adicione as variáveis do `.env`
4. Deploy → GitHub → Conecte seu repositório
5. Deploy Branch
6. Resources → Ative o worker

## 🆘 Problemas Comuns

### ❌ "Bot não conecta ao Lavalink"

**Solução Rápida:**
1. Verifique se `.env` está configurado corretamente
2. Teste outro servidor: https://lavalink-list.darrennathanael.com/
3. Veja logs com `heroku logs --tail` ou console local

### ❌ "Música não toca"

**Checklist:**
- [ ] Bot conectado ao Lavalink? (veja logs: ✅ Conectado...)
- [ ] Você está em um canal de voz?
- [ ] Bot tem permissões de Conectar e Falar?
- [ ] Tentou outra música?

### ❌ "Missing Permissions"

**Permissões Necessárias:**
- Conectar (canal de voz)
- Falar (canal de voz)
- Enviar Mensagens (canal de texto)
- Embedar Links (canal de texto)

## 💡 Dicas Pro

### 1. Use Links Diretos
```
/play https://youtube.com/watch?v=xxx
# Mais rápido que pesquisar
```

### 2. Crie Playlists Temáticas
```
/playlist [URL da playlist chill]
/loop queue
# Música ambiente infinita!
```

### 3. Combine com Volume Baixo
```
/volume 30
/loop queue
# Perfeito para trabalhar/estudar
```

### 4. Use /nowplayed para Descobrir
```
# Alguém tocou uma música legal
/nowplayed
# Veja título e artista!
```

### 5. Monitore com /queue
```
/queue
# Sempre saiba o que vem a seguir
```

## 📊 Status do Servidor

Verifique se o Lavalink está online:
- https://lavalink-list.darrennathanael.com/

Se offline, use outro servidor do `.env.example`

## 🔗 Links Úteis

- **Documentação Completa:** [README.md](README.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)
- **Issues:** https://github.com/DiogenesYazan/DJ-Yazan/issues
- **Discord.js Docs:** https://discord.js.org/
- **Lavalink Servers:** https://lavalink-list.darrennathanael.com/

## 🎓 Próximos Passos

1. ✅ Bot funcionando? Parabéns!
2. 📖 Leia o [README completo](README.md) para recursos avançados
3. 🎨 Personalize os status do bot em `index.js`
4. 🚀 Faça deploy em produção
5. 🤝 Contribua com melhorias!

---

**Precisa de ajuda?**
- Abra uma [Issue](https://github.com/DiogenesYazan/DJ-Yazan/issues)
- Consulte a documentação completa
- Verifique os logs para mais informações

**Divirta-se! 🎵**
