# 🏆 Sistema de Leaderboard - DJ Yazan

## 📋 Visão Geral

O sistema de leaderboard do DJ Yazan é um recurso exclusivo que cria competição saudável entre os membros do servidor, incentivando o uso do bot através de rankings mensais.

## ✨ Características Principais

### 🎯 Tracking Automático
- **Músicas Pedidas**: Cada vez que um usuário adiciona uma música à fila
- **Tempo Ouvido**: Registra o tempo total que cada usuário ouviu música
- **Por Servidor**: Estatísticas separadas por servidor (não mistura dados)
- **Reset Mensal**: Automaticamente zera as estatísticas todo início de mês

### 📊 Comandos Disponíveis

#### `/leaderboard` - Ranking do Servidor
Mostra o Top 10 do servidor com 3 modos de visualização:

1. **🎵 Músicas Pedidas** (`/leaderboard tipo:songs`)
   - Ranking por quantidade de músicas adicionadas
   - Ideal para ver quem mais contribui com a fila

2. **⏱️ Tempo Ouvido** (`/leaderboard tipo:time`)
   - Ranking por tempo total de audição
   - Mostra quem mais ouve música

3. **🏆 Geral** (`/leaderboard tipo:general`) [PADRÃO]
   - Ranking combinado com pontuação:
     - 10 pontos por música adicionada
     - 1 ponto por minuto ouvido
   - O ranking mais completo e balanceado

**Informações Exibidas:**
- 🥇 Top 3 com destaque (medalhas de ouro, prata e bronze)
- 📋 Posições 4-10 em lista
- 📊 Estatísticas gerais do servidor
- 🎯 Sua posição atual no ranking

#### `/mystats` - Estatísticas Pessoais
Mostra estatísticas detalhadas de um usuário específico:

**Dados Exibidos:**
- 🏆 **Ranking**: Posição atual, percentil e pontuação
- 🎵 **Músicas**: Total, média diária e projeção para fim do mês
- ⏱️ **Tempo**: Total ouvido, média diária e projeção
- 📅 **Período**: Mês atual, dia do mês, última música
- 💬 **Motivação**: Mensagem personalizada baseada na posição

**Uso:**
- `/mystats` - Ver suas próprias estatísticas
- `/mystats usuário:@fulano` - Ver estatísticas de outro usuário

## 🔧 Como Funciona (Técnico)

### Banco de Dados (Quick.db)
```javascript
Estrutura de dados:
leaderboard_{guildId}_lastMonth: "2025-4" // Controle de reset
leaderboard_{guildId}_2025-4: {
  "userId1": {
    songs: 150,
    time: 7200000, // milissegundos
    lastPlayed: "2025-04-15T10:30:00.000Z"
  },
  "userId2": { ... }
}
```

### Tracking de Eventos

**Evento `trackStart` (index.js)**:
- Registra início da reprodução
- Incrementa contador de músicas (+1)
- Salva timestamp para cálculo de tempo

**Evento `trackEnd` (index.js)**:
- Calcula tempo ouvido (fim - início)
- Adiciona ao total de tempo do usuário
- Limpa timestamp temporário

### Reset Automático
- **Verificação**: A cada comando `/leaderboard` ou `/mystats`
- **Condição**: Se o mês atual é diferente do último salvo
- **Ação**: Cria nova tabela para o mês atual
- **Dados Antigos**: Mantidos no banco (podem ser acessados manualmente)

## 🎨 Design do Embed

### Leaderboard (Ranking Geral)
```
🏆 Top 10 - Ranking Geral
Os maiores ouvintes do mês

🥇 1º Lugar - Username
**150** músicas • **25h 30m** ouvido
Pontuação: **3030** pts

🥈 2º Lugar - Username2
...

📋 Restante do Top 10
**4º** Username - 80 músicas • 15h 20m
...

📊 Estatísticas do Servidor
🎵 Total de músicas: **1,250**
⏱️ Tempo total: **350h 45m**
👥 Participantes: **45**
📅 Mês: **Outubro**

🎯 Sua Posição
**7º lugar** • 65 músicas • 12h 15m • 1385 pts

Footer: Outubro 2025 • 45 participantes
```

### MyStats (Estatísticas Pessoais)
```
🎵 Estatísticas Musicais - Username
Estatísticas de Outubro 2025

🏆 Ranking               🎵 Músicas              ⏱️ Tempo
Posição: #7 de 45        Total: 65 músicas       Total: 12h 15m
Percentil: Top 84%       Média/dia: 4.3 músicas  Média/dia: 49m
Pontuação: 1385 pts      Projeção: 98 músicas    Projeção: 18h 30m

📅 Período
Mês: Outubro 2025
Dia atual: 15/31
Última música: 15/10/2025

💬 Motivação
⭐ **Top 10!** Continue assim!

Footer: 65 músicas • 12h 15m • #7/45
```

## 🎯 Benefícios para o Servidor

### Engajamento
- ✅ Cria competição saudável entre membros
- ✅ Incentiva uso regular do bot
- ✅ Membros verificam ranking frequentemente

### Gamificação
- ✅ Sistema de pontuação claro e justo
- ✅ Mensagens motivacionais personalizadas
- ✅ Medalhas visuais (🥇🥈🥉)
- ✅ Percentis e projeções

### Social
- ✅ Membros compartilham suas posições
- ✅ Competição amigável entre amigos
- ✅ Reconhecimento dos maiores ouvintes

## 🚀 Próximas Melhorias Possíveis

- [ ] Comando `/history` - Ver estatísticas de meses anteriores
- [ ] Badges/Emblemas especiais para top 3
- [ ] Notificações quando alguém passa você no ranking
- [ ] Conquistas especiais (100 músicas, 50h ouvido, etc.)
- [ ] Gráficos de evolução ao longo do mês
- [ ] Ranking global (todos os servidores)
- [ ] Categorias por gênero musical
- [ ] Streak de dias consecutivos ouvindo

## 📝 Notas de Implementação

### Dependências
- `quick.db@9.1.7` - Banco de dados NoSQL
- `better-sqlite3` - Driver SQLite (dep. do quick.db)

### Performance
- ✅ Operações de leitura muito rápidas
- ✅ Escritas assíncronas não bloqueiam
- ✅ Dados organizados por servidor (escalável)
- ✅ Reset mensal mantém banco leve

### Segurança
- ✅ Dados separados por servidor (privacidade)
- ✅ Não expõe informações pessoais
- ✅ Apenas estatísticas de uso do bot

## 🎉 Conclusão

O sistema de leaderboard transforma o DJ Yazan de um simples bot de música em uma experiência social e competitiva, aumentando significativamente o engajamento dos usuários e criando uma comunidade ativa ao redor da música!
