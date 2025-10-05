# 📝 Changelog - DJ Yazan Bot

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [2.0.0] - 2025-10-04

### 🎉 Atualização Major - Lavalink v4 + Arquitetura Otimizada

#### ✨ Adicionado

- **Lavalink v4 Completo**
  - Migração completa para Lavalink v4 com `lavalink-client` v2.5.6
  - Suporte a todos os recursos do Lavalink v4
  - Sistema de heartbeat e reconexão automática
  - Configuração otimizada de nodes com SSL/TLS

- **Sistema de Eventos Aprimorado**
  - Eventos do `nodeManager` para melhor monitoramento
  - Logs detalhados de conexão/desconexão
  - Tratamento robusto de erros sem crashar o bot
  - Informações em tempo real sobre status do Lavalink

- **Melhorias na Interface**
  - Barra de progresso com timestamps (mm:ss / mm:ss)
  - Suporte a streams ao vivo (duração infinita)
  - Embeds mais bonitos e informativos
  - Sistema de ajuda completo com `/help`

- **Documentação Completa**
  - README.md totalmente reescrito
  - `.env.example` com múltiplas opções de servidores
  - Guia de solução de problemas
  - Instruções de deploy no Heroku

#### 🔧 Modificado

- **Configuração do LavalinkManager**
  ```javascript
  // Antes
  closeOnError: true
  
  // Agora
  closeOnError: false
  heartBeatInterval: 30_000
  enablePingOnStatsCheck: true
  retryAmount: 5
  retryDelay: 10_000
  ```

- **Inicialização do Lavalink**
  ```javascript
  // Antes
  client.lavalink.init({ id: client.user.id, username: client.user.username });
  
  // Agora
  client.lavalink.init({
    id: client.user.id,
    username: client.user.username
  });
  ```

- **Eventos de Node**
  ```javascript
  // Antes
  client.lavalink.on('nodeConnect', ...)
  client.lavalink.on('nodeError', ...)
  
  // Agora
  client.lavalink.nodeManager.on('connect', ...)
  client.lavalink.nodeManager.on('error', ...)
  ```

- **Servidor Padrão**
  - Mudado de `localhost:2333` para `lava-v4.ajieblogs.eu.org:443`
  - Configuração SSL/TLS habilitada por padrão
  - Credenciais verificadas e funcionando

#### 🐛 Corrigido

- **Problema de Conexão do Lavalink**
  - Resolvido erro de `closeOnError` causando crash
  - Corrigido timeout de conexão infinito
  - Implementado sistema de retry com backoff

- **Barra de Progresso**
  - Corrigido `NaN` em músicas sem duração
  - Adicionado suporte para streams ao vivo
  - Melhor formatação de tempo (00:00 / 00:00)

- **Sistema de Loop**
  - Removido uso de `player.setLoop()` (não existe no lavalink-client)
  - Implementado loop manual via eventos `trackEnd`
  - Loop de fila funcionando corretamente

- **Tratamento de Erros**
  - Bot não crasha mais quando Lavalink desconecta
  - Mensagens de erro mais claras
  - Logs detalhados para debugging

#### 🗑️ Removido

- Tentativas de conexão com servidores Lavalink offline
- Logs de debug verbosos desnecessários
- Código legacy de versões anteriores do lavalink-client
- Dependências não utilizadas

#### 🔒 Segurança

- Variáveis sensíveis movidas para `.env`
- `.env` adicionado ao `.gitignore`
- Token e credenciais não mais expostas no código

#### ⚡ Performance

- Intervalo de atualização da barra otimizado (5s)
- `clientBasedPositionUpdateInterval` ajustado para 100ms
- Sistema de cache de mensagens implementado
- Limpeza automática de intervalos ao parar música

---

## [1.0.0] - 2025-09-XX

### 🎉 Versão Inicial

#### ✨ Recursos

- Comandos básicos de música
- Integração com Lavalink v3
- Sistema de fila
- Controle de volume
- Comandos slash

---

## Legendas

- 🎉 Novo recurso importante
- ✨ Adicionado
- 🔧 Modificado
- 🐛 Corrigido
- 🗑️ Removido
- 🔒 Segurança
- ⚡ Performance
- 📝 Documentação

---

**Formato baseado em [Keep a Changelog](https://keepachangelog.com/)**
