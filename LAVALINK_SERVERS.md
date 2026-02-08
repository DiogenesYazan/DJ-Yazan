# 🌐 Servidores Lavalink - Sistema de Fallback Automático

## 🔄 Como Funciona

O bot agora usa um **sistema de fallback automático** com múltiplos servidores Lavalink. Quando o servidor primário cair, o bot automaticamente muda para o próximo servidor disponível na lista.

### Arquivos Importantes:
- **`lavalink-servers.json`** - Lista de servidores com prioridade
- **`index.js`** - Lógica de conexão e fallback

---

## 📋 Configuração Atual (lavalink-servers.json)

```json
{
  "nodes": [
    {
      "id": "primary",
      "name": "Serenetia (Principal)",
      "host": "lavalinkv4.serenetia.com",
      "port": 443,
      "password": "https://dsc.gg/ajidevserver",
      "secure": true,
      "priority": 1
    },
    // ... mais servidores de backup
  ]
}
```

### Campos:
| Campo | Descrição |
|-------|-----------|
| `id` | Identificador único do servidor |
| `name` | Nome amigável para os logs |
| `host` | Endereço do servidor |
| `port` | Porta do servidor |
| `password` | Senha de autenticação |
| `secure` | `true` para SSL/HTTPS, `false` para HTTP |
| `priority` | Ordem de prioridade (1 = mais alta) |

---

## ➕ Como Adicionar um Novo Servidor

1. Abra o arquivo `lavalink-servers.json`
2. Adicione um novo objeto no array `nodes`:

```json
{
  "id": "backup5",
  "name": "Meu Servidor",
  "host": "meu-lavalink.com",
  "port": 2333,
  "password": "minha_senha",
  "secure": false,
  "priority": 6
}
```

3. Ajuste a `priority` conforme a preferência (menor número = maior prioridade)
4. Faça redeploy no Heroku

---

## 🗑️ Como Remover um Servidor

1. Abra o arquivo `lavalink-servers.json`
2. Remova o objeto do servidor desejado
3. Faça redeploy no Heroku

---

## 🔀 Como Funciona o Fallback

```
┌─────────────────────────────────────────────────────────────┐
│  Bot Inicia                                                  │
│      ↓                                                       │
│  Conecta a TODOS os servidores simultaneamente               │
│      ↓                                                       │
│  Usa servidor com menor prioridade (priority: 1) para tocar  │
│      ↓                                                       │
│  Se servidor primário cair:                                  │
│      → Migra players para próximo servidor conectado         │
│      → Continua tocando sem interrupção                      │
│      → Tenta reconectar ao servidor que caiu                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Servidores Configurados Atualmente

| # | Servidor | Host | Porta | SSL | Status |
|---|----------|------|-------|-----|--------|
| 1 | Serenetia (Principal) | lavalinkv4.serenetia.com | 443 | ✅ | Primário |
| 2 | Jirayu.net | lavalink.jirayu.net | 13592 | ❌ | Backup |
| 3 | Lavalink.me | lavalink.me | 443 | ✅ | Backup |
| 4 | StageApp v4 | lavalink-v4.stageapp.com | 443 | ✅ | Backup |
| 5 | Lavalinknode.eu | lavalinknode.eu | 2333 | ❌ | Backup |

---

## 🔍 Como Testar um Servidor

### Método 1: cURL
```bash
curl -H "Authorization: senha_aqui" https://host:porta/v4/info
```

### Método 2: No código
```javascript
const axios = require('axios');

async function testLavalink() {
  try {
    const response = await axios.get('https://host:porta/v4/info', {
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
**Solução:** O sistema de fallback tentará automaticamente o próximo servidor

### Erro: "ECONNREFUSED"
**Causa:** Servidor offline ou porta bloqueada  
**Solução:** O fallback automático cuidará disso

### Erro: "401 Unauthorized"
**Causa:** Senha incorreta  
**Solução:** Verificar password no lavalink-servers.json

### Erro: "SSL/TLS handshake failed"
**Causa:** `secure: true` mas servidor não tem SSL  
**Solução:** Mudar `secure` para `false` no servidor específico

---

## 📝 Notas Importantes

1. **Sistema de fallback automático** - O bot tenta todos os servidores configurados
2. **Migração de players** - Quando um servidor cai, os players são migrados automaticamente
3. **Ordem de prioridade** - Ajuste o campo `priority` para definir preferências
4. **Servidores públicos** - Podem ficar offline, por isso temos múltiplos backups
5. **SSL recomendado** - Servidores com `secure: true` são mais estáveis

---

## 🔗 Links Úteis

- [Lista de Servidores Lavalink](https://lavalink-list.darrennathanael.com/SSL/Lavalink-SSL/)
- [Lavalink GitHub](https://github.com/lavalink-devs/Lavalink)
- [Documentação Lavalink](https://lavalink.dev/)
- [lavalink-client Docs](https://lavalink-client.netlify.app/)

---

**Última Atualização:** Fevereiro 2026  
**Sistema:** Fallback automático com múltiplos servidores
