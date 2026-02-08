// ============================================
// 🔒 PRIVACY POLICY PAGE
// ============================================

const { theme, getBaseStyles, getHead, getNavbar, getFooter } = require('../styles/theme');

function getPrivacyPage() {
  const lastUpdated = '8 de Fevereiro de 2026';
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${getHead('Política de Privacidade', 'Política de Privacidade do DJ Yazan - Como seus dados são tratados')}
  <style>
    ${getBaseStyles()}
    
    .legal-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 8rem 2rem 4rem;
    }
    
    .legal-header {
      text-align: center;
      margin-bottom: 3rem;
    }
    
    .legal-header h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .legal-header .last-updated {
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    
    .legal-content {
      background: var(--surface);
      border-radius: 16px;
      padding: 3rem;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .legal-content h2 {
      font-size: 1.5rem;
      margin: 2rem 0 1rem;
      color: var(--primary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .legal-content h2:first-of-type {
      margin-top: 0;
    }
    
    .legal-content p {
      color: var(--text-muted);
      margin-bottom: 1rem;
      line-height: 1.8;
    }
    
    .legal-content ul {
      color: var(--text-muted);
      margin: 1rem 0 1rem 2rem;
      line-height: 1.8;
    }
    
    .legal-content li {
      margin-bottom: 0.5rem;
    }
    
    .legal-content a {
      color: var(--primary);
      text-decoration: none;
    }
    
    .legal-content a:hover {
      text-decoration: underline;
    }
    
    .highlight-box {
      background: rgba(88, 101, 242, 0.1);
      border: 1px solid var(--primary);
      border-radius: 12px;
      padding: 1.5rem;
      margin: 1.5rem 0;
    }
    
    .highlight-box p {
      margin: 0;
      color: var(--text);
    }
    
    .highlight-box.success {
      background: rgba(87, 242, 135, 0.1);
      border-color: var(--success);
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    
    .data-table th,
    .data-table td {
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .data-table th {
      background: var(--surface-light);
      color: var(--text);
      font-weight: 600;
    }
    
    .data-table td {
      color: var(--text-muted);
    }
    
    .data-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-muted);
      text-decoration: none;
      margin-bottom: 2rem;
      transition: color 0.3s ease;
    }
    
    .back-link:hover {
      color: var(--primary);
    }
    
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    
    .badge-green {
      background: rgba(87, 242, 135, 0.2);
      color: var(--success);
    }
    
    .badge-yellow {
      background: rgba(254, 231, 92, 0.2);
      color: var(--warning);
    }
    
    @media (max-width: 768px) {
      .legal-container { padding: 6rem 1rem 2rem; }
      .legal-content { padding: 1.5rem; }
      .legal-header h1 { font-size: 2rem; }
      .data-table { font-size: 0.9rem; }
      .data-table th, .data-table td { padding: 0.75rem 0.5rem; }
    }
  </style>
</head>
<body>
  <div class="bg-animation"></div>
  
  ${getNavbar()}
  
  <div class="legal-container">
    <a href="/" class="back-link">
      <i class="fas fa-arrow-left"></i>
      Voltar para a página inicial
    </a>
    
    <div class="legal-header">
      <h1>🔒 Política de Privacidade</h1>
      <p class="last-updated">Última atualização: ${lastUpdated}</p>
    </div>
    
    <div class="legal-content">
      <div class="highlight-box success">
        <p><strong>🛡️ Sua privacidade é importante para nós.</strong> O ${theme.botName} foi desenvolvido com a privacidade em mente. Coletamos apenas os dados mínimos necessários para fornecer o serviço.</p>
      </div>
      
      <h2><i class="fas fa-file-alt"></i> 1. Introdução</h2>
      <p>
        Esta Política de Privacidade descreve como o ${theme.botName} ("Bot", "nós", "nosso") coleta, usa e protege 
        as informações dos usuários ("você", "seu") quando você utiliza nosso bot de música para Discord.
      </p>
      <p>
        Ao usar o Bot, você concorda com a coleta e uso de informações de acordo com esta política.
      </p>
      
      <h2><i class="fas fa-database"></i> 2. Dados que Coletamos</h2>
      <p>
        O ${theme.botName} coleta e armazena os seguintes dados:
      </p>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>Tipo de Dado</th>
            <th>Finalidade</th>
            <th>Retenção</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ID do Servidor</strong></td>
            <td>Identificar configurações específicas de cada servidor</td>
            <td><span class="badge badge-yellow">Até remoção do bot</span></td>
          </tr>
          <tr>
            <td><strong>ID do Usuário</strong></td>
            <td>Sistema de leaderboard e estatísticas</td>
            <td><span class="badge badge-green">Mensal (resetado)</span></td>
          </tr>
          <tr>
            <td><strong>Músicas Reproduzidas</strong></td>
            <td>Contagem para leaderboard (apenas quantidade)</td>
            <td><span class="badge badge-green">Mensal (resetado)</span></td>
          </tr>
          <tr>
            <td><strong>Tempo de Escuta</strong></td>
            <td>Estatísticas do leaderboard</td>
            <td><span class="badge badge-green">Mensal (resetado)</span></td>
          </tr>
          <tr>
            <td><strong>Configurações do Servidor</strong></td>
            <td>Preferências personalizadas (canal DJ, volume, etc.)</td>
            <td><span class="badge badge-yellow">Até remoção do bot</span></td>
          </tr>
        </tbody>
      </table>
      
      <h2><i class="fas fa-times"></i> 3. Dados que NÃO Coletamos</h2>
      <p>O ${theme.botName} <strong>NÃO</strong> coleta, armazena ou processa:</p>
      <ul>
        <li>Conteúdo de mensagens de texto</li>
        <li>Informações pessoais (nome real, email, endereço, telefone)</li>
        <li>Dados de pagamento ou financeiros</li>
        <li>Histórico de navegação</li>
        <li>Dados de localização</li>
        <li>Informações de outros aplicativos</li>
        <li>Arquivos de áudio ou vídeo (o Bot apenas faz streaming, não armazena)</li>
        <li>Conteúdo de conversas de voz</li>
      </ul>
      
      <h2><i class="fas fa-cogs"></i> 4. Como Usamos os Dados</h2>
      <p>Os dados coletados são utilizados exclusivamente para:</p>
      <ul>
        <li><strong>Funcionalidades do Bot:</strong> Gerenciar filas de música, configurações e preferências</li>
        <li><strong>Leaderboard:</strong> Exibir rankings de usuários mais ativos no servidor</li>
        <li><strong>Estatísticas:</strong> Mostrar contadores gerais (músicas tocadas, servidores, etc.)</li>
        <li><strong>Melhorias:</strong> Entender como o Bot é utilizado para implementar melhorias</li>
      </ul>
      <p>
        <strong>Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais.</strong>
      </p>
      
      <h2><i class="fas fa-server"></i> 5. Armazenamento e Segurança</h2>
      <p>
        Os dados são armazenados em servidores MongoDB seguros com as seguintes medidas de proteção:
      </p>
      <ul>
        <li>Conexões criptografadas (SSL/TLS)</li>
        <li>Acesso restrito apenas aos desenvolvedores autorizados</li>
        <li>Backups regulares para prevenir perda de dados</li>
        <li>Senhas fortes e autenticação de dois fatores para acesso administrativo</li>
      </ul>
      
      <h2><i class="fas fa-trash-alt"></i> 6. Exclusão de Dados</h2>
      <p>Seus dados podem ser excluídos das seguintes formas:</p>
      <ul>
        <li><strong>Automaticamente:</strong> Dados do leaderboard são resetados mensalmente</li>
        <li><strong>Ao remover o Bot:</strong> Quando o Bot é removido de um servidor, os dados daquele servidor são excluídos em até 30 dias</li>
        <li><strong>Por solicitação:</strong> Você pode solicitar a exclusão de seus dados entrando em contato conosco</li>
      </ul>
      
      <div class="highlight-box">
        <p><strong>Solicitação de Exclusão:</strong> Para solicitar a remoção de seus dados, entre em contato através do nosso <a href="${theme.githubUrl}" target="_blank">GitHub</a> ou site do desenvolvedor.</p>
      </div>
      
      <h2><i class="fas fa-child"></i> 7. Menores de Idade</h2>
      <p>
        O ${theme.botName} segue os Termos de Serviço do Discord, que requerem que usuários tenham pelo menos 13 anos de idade 
        (ou a idade mínima em seu país, se maior). Não coletamos intencionalmente dados de menores de 13 anos.
      </p>
      
      <h2><i class="fas fa-share-alt"></i> 8. Serviços de Terceiros</h2>
      <p>O Bot integra com os seguintes serviços de terceiros:</p>
      <ul>
        <li><strong>Discord:</strong> Plataforma principal (<a href="https://discord.com/privacy" target="_blank">Política de Privacidade</a>)</li>
        <li><strong>YouTube:</strong> Fonte de músicas (<a href="https://policies.google.com/privacy" target="_blank">Política de Privacidade</a>)</li>
        <li><strong>Spotify:</strong> Fonte de músicas (<a href="https://www.spotify.com/legal/privacy-policy/" target="_blank">Política de Privacidade</a>)</li>
        <li><strong>SoundCloud:</strong> Fonte de músicas (<a href="https://soundcloud.com/pages/privacy" target="_blank">Política de Privacidade</a>)</li>
      </ul>
      <p>
        Recomendamos revisar as políticas de privacidade desses serviços para entender como eles tratam seus dados.
      </p>
      
      <h2><i class="fas fa-user-shield"></i> 9. Seus Direitos</h2>
      <p>Você tem os seguintes direitos em relação aos seus dados:</p>
      <ul>
        <li><strong>Acesso:</strong> Solicitar informações sobre quais dados temos sobre você</li>
        <li><strong>Correção:</strong> Solicitar correção de dados incorretos</li>
        <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados</li>
        <li><strong>Portabilidade:</strong> Solicitar seus dados em formato legível por máquina</li>
        <li><strong>Objeção:</strong> Opor-se ao processamento de seus dados</li>
      </ul>
      
      <h2><i class="fas fa-sync-alt"></i> 10. Alterações nesta Política</h2>
      <p>
        Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas serão comunicadas através:
      </p>
      <ul>
        <li>Atualização da data "Última atualização" no topo desta página</li>
        <li>Anúncios em nosso servidor de suporte (quando aplicável)</li>
        <li>Changelog do projeto no GitHub</li>
      </ul>
      
      <h2><i class="fas fa-code"></i> 11. Open Source</h2>
      <p>
        O ${theme.botName} é um projeto open-source. O código-fonte está disponível publicamente, 
        permitindo que qualquer pessoa verifique como os dados são processados.
      </p>
      <p>
        Repositório: <a href="${theme.githubUrl}" target="_blank">${theme.githubUrl}</a>
      </p>
      
      <h2><i class="fas fa-envelope"></i> 12. Contato</h2>
      <p>
        Para questões relacionadas à privacidade ou para exercer seus direitos, entre em contato:
      </p>
      <ul>
        <li>Site do desenvolvedor: <a href="${theme.authorUrl}" target="_blank">${theme.authorUrl}</a></li>
        <li>GitHub: <a href="${theme.githubUrl}" target="_blank">${theme.githubUrl}</a></li>
      </ul>
      
      <div class="highlight-box success" style="margin-top: 2rem;">
        <p>
          <strong>Resumo:</strong> Coletamos apenas IDs e estatísticas de música. Não vendemos seus dados. 
          Você pode solicitar exclusão a qualquer momento. O código é open-source para transparência.
        </p>
      </div>
    </div>
  </div>
  
  ${getFooter()}
</body>
</html>
  `;
}

module.exports = { getPrivacyPage };
