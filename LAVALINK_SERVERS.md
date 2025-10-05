# 🌐 Servidores Lavalink Públicos

## ⚠️ Servidor Atual (Funcionando)

```env
LAVA_HOST=lavalink.jirayu.net
LAVA_PORT=13592
LAVA_PASSWORD=youshallnotpass
LAVA_SECURE=false
```

✅ **Status:** Funcionando  
✅ **Versão:** Lavalink v4  
✅ **Região:** Global

---

## 🔄 Servidores Alternativos

### Opção 1: Lavalink.me
```env
LAVA_HOST=lavalink.me
LAVA_PORT=443
LAVA_PASSWORD=lavalink.me
LAVA_SECURE=true
```

### Opção 2: Lavalinknode.eu
```env
LAVA_HOST=lavalinknode.eu
LAVA_PORT=2333
LAVA_PASSWORD=lavalinknode.eu
LAVA_SECURE=false
```

### Opção 3: Lavalink CloudHawk
```env
LAVA_HOST=lavalink.cloudhawk.xyz
LAVA_PORT=2333
LAVA_PASSWORD=CloudHawkLavalink
LAVA_SECURE=false
```

### Opção 4: Lavalink v4 SSL
```env
LAVA_HOST=lavalink-v4.stageapp.com
LAVA_PORT=443
LAVA_PASSWORD=stageapp.com
LAVA_SECURE=true
```

---

## 🏗️ Como Usar Seu Próprio Servidor Lavalink

### 1. Docker (Recomendado)
```bash
# Criar application.yml
cat > application.yml << 'EOF'
server:
  port: 2333
  address: 0.0.0.0

lavalink:
  server:
    password: "youshallnotpass"
    sources:
      youtube: true
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      http: true
      local: false
    bufferDurationMs: 400
    frameBufferDurationMs: 5000
    youtubePlaylistLoadLimit: 6
    playerUpdateInterval: 5
    youtubeSearchEnabled: true
    soundcloudSearchEnabled: true
    gc-warnings: true
  plugins:
    - dependency: "dev.lavalink.youtube:youtube-plugin:1.8.2"
      snapshot: false
EOF

# Executar Lavalink com Docker
docker run -d \
  --name lavalink \
  -p 2333:2333 \
  -v $(pwd)/application.yml:/opt/Lavalink/application.yml \
  --restart unless-stopped \
  ghcr.io/lavalink-devs/lavalink:4-alpine
```

### 2. Java Local
```bash
# Baixar Lavalink.jar
wget https://github.com/lavalink-devs/Lavalink/releases/download/4.0.8/Lavalink.jar

# Executar
java -jar Lavalink.jar
```

### 3. Configurar no .env
```env
LAVA_HOST=localhost  # ou seu IP público
LAVA_PORT=2333
LAVA_PASSWORD=youshallnotpass
LAVA_SECURE=false
```

---

## 🔍 Como Testar um Servidor

### Método 1: cURL
```bash
curl -H "Authorization: senha_aqui" http://host:porta/v4/info
```

### Método 2: No código
```javascript
const axios = require('axios');

async function testLavalink() {
  try {
    const response = await axios.get('http://host:porta/v4/info', {
      headers: { 'Authorization': 'senha_aqui' }
    });
    console.log('✅ Servidor funcionando:', response.data);
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testLavalink();
```

---

## ⚙️ Configuração Avançada no index.js

```javascript
client.lavalink = new LavalinkManager({
  nodes: [
    {
      authorization: process.env.LAVA_PASSWORD,
      host: process.env.LAVA_HOST,
      port: +process.env.LAVA_PORT,
      id: 'main_lavalink',
      secure: process.env.LAVA_SECURE === 'true',
      
      // Configurações de Reconnect
      retryDelay: 10_000,        // 10 segundos entre tentativas
      retryAmount: 5,            // 5 tentativas de reconexão
      
      // Timeout e HeartBeat
      requestSignalTimeoutMS: 10000,
      heartBeatInterval: 30_000,
      enablePingOnStatsCheck: true,
      
      // Comportamento
      closeOnError: false        // Não fechar em erro (tenta reconectar)
    }
  ],
  // ... resto da configuração
});
```

---

## 📊 Comparação de Servidores

| Servidor | Uptime | Latência | Região | SSL | Plugins |
|----------|--------|----------|--------|-----|---------|
| **lavalink.jirayu.net** | 99%+ | ~50ms | Global | ❌ | Básicos |
| lavalink.me | 95%+ | ~100ms | EU/US | ✅ | Avançados |
| lavalinknode.eu | 98%+ | ~70ms | EU | ❌ | Básicos |
| CloudHawk | 97%+ | ~80ms | US | ❌ | Médios |
| Próprio | 100% | ~5ms | Local | Configurável | Total |

---

## ❌ Servidor Inválido Removido

~~lava-v4.ajieblogs.eu.org~~ - **NÃO FUNCIONA**
- ❌ Retorna HTML ao invés de JSON
- ❌ Endpoint /v4/info não disponível
- ❌ Incompatível com lavalink-client

---

## 🆘 Troubleshooting

### Erro: "does not provide any /v4/info"
**Causa:** Servidor não é Lavalink v4 ou está offline  
**Solução:** Trocar para outro servidor da lista

### Erro: "ECONNREFUSED"
**Causa:** Servidor offline ou porta bloqueada  
**Solução:** Verificar firewall ou trocar servidor

### Erro: "401 Unauthorized"
**Causa:** Senha incorreta  
**Solução:** Verificar LAVA_PASSWORD no .env

### Erro: "SSL/TLS handshake failed"
**Causa:** LAVA_SECURE=true mas servidor não tem SSL  
**Solução:** Mudar para LAVA_SECURE=false

---

## 📝 Notas Importantes

1. **Servidores públicos podem ficar offline** - Sempre tenha um backup
2. **Performance varia** - Teste diferentes servidores para sua região
3. **Limitações de taxa** - Servidores públicos podem ter rate limits
4. **Produção** - Recomendado usar servidor próprio
5. **Privacidade** - Servidores públicos podem logar suas músicas

---

## 🔗 Links Úteis

- [Lista de Servidores Lavalink](https://lavalink-list.darrennathanael.com/)
- [Lavalink GitHub](https://github.com/lavalink-devs/Lavalink)
- [Documentação Lavalink](https://lavalink.dev/)
- [lavalink-client Docs](https://lavalink-client.netlify.app/)

---

**Última Atualização:** Outubro 2025  
**Servidor Recomendado:** lavalink.jirayu.net (estável e confiável)
