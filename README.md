<body>

  <h1>🎧 Discord Music Bot</h1>
  <p>Bot de música para Discord usando <strong>DisTube v5</strong>. Toca músicas do YouTube por nome ou link, com barra de progresso em ASCII — estilo Rythm!</p>

  <h2>🖼️ Visual:</h2>
  <img src="https://i.imgur.com/vMKyYzv.png" alt="Exemplo embed com barra de progresso">

  <h2>⚙️ Recursos</h2>
  <ul>
    <li>🎶 Tocar músicas por nome ou link</li>
    <li>🔁 Barra de progresso atualizada a cada 5 segundos</li>
    <li>➕ Adição à fila com notificações</li>
    <li>✅ Mensagens no início e fim da música/fila</li>
    <li>❌ Tratamento de erros visível no chat</li>
    <li>🔧 Suporte para comandos slash na pasta <code>commands/</code></li>
  </ul>

  <h2>📦 Requisitos</h2>
  <ul>
    <li>Node.js v16+</li>
    <li><code>ffmpeg</code> instalado (ou <code>npm install ffmpeg-static</code>)</li>
    <li>Token do bot em arquivo <code>.env</code>:
      <pre><code>TOKEN=SEU_TOKEN_AQUI</code></pre>
    </li>
  </ul>

  <h2>🛠️ Instalação</h2>
  <ol>
    <li>Clone o repositório e acesse:
      <pre><code>git clone https://github.com/seuusuario/discord-music-bot.git
cd discord-music-bot</code></pre>
    </li>
    <li>Instale dependências:
      <pre><code>npm install</code></pre>
    </li>
    <li>Configure seu token no <code>.env</code></li>
    <li>Garanta que o <code>ffmpeg</code> esteja acessível:
      <pre><code>ffmpeg -version</code></pre>
    </li>
  </ol>

  <h2>🕹️ Uso</h2>
  <ol>
    <li>Inicie o bot:
      <pre><code>node index.js</code></pre>
    </li>
    <li>No Discord, use comandos slash, por exemplo:
      <pre><code>/play Shape of You</code></pre>
    </li>
    <li>O bot tocará e mostrará o embed com a barra:
      <pre class="bar"><code>█████──────────────  
`01:15/04:30`</code></pre>
    </li>
    <li>Outros comandos: <code>/skip</code>, <code>/pause</code>, <code>/queue</code>, etc.</li>
  </ol>

  <h2>📁 Estrutura do projeto</h2>
  <pre><code>/
├── commands/       ← comandos slash (ex: play.js, skip.js)
├── index.js        ← código principal
├── .env            ← token do bot
├── package.json
└── README.html     ← este arquivo</code></pre>

  <h2>✅ Fluxo interno</h2>
  <ul>
    <li>Inicializa o bot e carrega comandos</li>
    <li>Comando <code>/play</code> busca e reproduz música</li>
    <li>Envia embed com barra manual ASCII</li>
    <li>Atualiza barra com <code>setInterval</code></li>
    <li>Limpa o temporizador quando a música termina</li>
    <li>Erros são enviados ao canal ou exibidos no console</li>
  </ul>

  <h2>🤝 Contribuições</h2>
  <ol>
    <li>Faça um <em>fork</em></li>
    <li>Crie uma branch <code>feature/xyz</code></li>
    <li>Implemente suas melhorias</li>
    <li>Abra um Pull Request</li>
  </ol>
</body>
