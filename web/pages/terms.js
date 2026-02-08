// ============================================
// 📜 TERMS OF SERVICE PAGE
// ============================================

const { theme, getBaseStyles, getHead, getNavbar, getFooter } = require('../styles/theme');

function getTermsPage() {
  const lastUpdated = '8 de Fevereiro de 2026';
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${getHead('Termos de Serviço', 'Termos de Serviço do DJ Yazan - Bot de música para Discord')}
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
    
    @media (max-width: 768px) {
      .legal-container { padding: 6rem 1rem 2rem; }
      .legal-content { padding: 1.5rem; }
      .legal-header h1 { font-size: 2rem; }
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
      <h1>📜 Termos de Serviço</h1>
      <p class="last-updated">Última atualização: ${lastUpdated}</p>
    </div>
    
    <div class="legal-content">
      <div class="highlight-box">
        <p><strong>Importante:</strong> Ao adicionar o ${theme.botName} ao seu servidor Discord ou ao utilizá-lo, você concorda com estes Termos de Serviço. Por favor, leia-os cuidadosamente.</p>
      </div>
      
      <h2><i class="fas fa-info-circle"></i> 1. Aceitação dos Termos</h2>
      <p>
        Ao utilizar o ${theme.botName} ("Bot", "Serviço"), você concorda em estar vinculado a estes Termos de Serviço ("Termos"). 
        Se você não concordar com qualquer parte destes termos, você não deve usar o Bot.
      </p>
      <p>
        Estes Termos se aplicam a todos os usuários e servidores que utilizam o Bot, incluindo, sem limitação, 
        usuários que são administradores de servidores, moderadores ou membros comuns.
      </p>
      
      <h2><i class="fas fa-music"></i> 2. Descrição do Serviço</h2>
      <p>
        O ${theme.botName} é um bot de música para Discord que permite:
      </p>
      <ul>
        <li>Reproduzir músicas de diversas plataformas (YouTube, Spotify, SoundCloud, etc.)</li>
        <li>Gerenciar filas de reprodução</li>
        <li>Participar de quiz musicais</li>
        <li>Visualizar rankings e estatísticas</li>
        <li>Outras funcionalidades relacionadas à música</li>
      </ul>
      <p>
        O Bot é fornecido "como está" e "conforme disponível", sem garantias de qualquer tipo.
      </p>
      
      <h2><i class="fas fa-check-circle"></i> 3. Uso Aceitável</h2>
      <p>Você concorda em usar o Bot apenas para fins legais e de maneira que não:</p>
      <ul>
        <li>Viole qualquer lei ou regulamento aplicável</li>
        <li>Viole os direitos de propriedade intelectual de terceiros</li>
        <li>Viole os <a href="https://discord.com/terms" target="_blank">Termos de Serviço do Discord</a></li>
        <li>Tente explorar, hackear ou sobrecarregar o Bot ou sua infraestrutura</li>
        <li>Use automação não autorizada para interagir com o Bot</li>
        <li>Abuse das funcionalidades do Bot de forma que prejudique outros usuários</li>
        <li>Utilize o Bot para spam, assédio ou qualquer atividade maliciosa</li>
      </ul>
      
      <h2><i class="fas fa-ban"></i> 4. Restrições e Penalidades</h2>
      <p>
        Reservamo-nos o direito de, a nosso critério exclusivo:
      </p>
      <ul>
        <li>Bloquear usuários individuais de usar o Bot</li>
        <li>Remover o Bot de servidores que violem estes Termos</li>
        <li>Limitar ou suspender funcionalidades para usuários ou servidores específicos</li>
        <li>Tomar outras medidas que consideremos necessárias para proteger o Serviço</li>
      </ul>
      
      <h2><i class="fas fa-shield-alt"></i> 5. Propriedade Intelectual</h2>
      <p>
        O ${theme.botName} é um projeto open-source. O código-fonte está disponível publicamente, 
        mas isso não concede direitos sobre a marca, nome ou identidade visual do Bot.
      </p>
      <p>
        O conteúdo de música reproduzido pelo Bot pertence aos seus respectivos proprietários. 
        O Bot atua apenas como intermediário para reprodução e não armazena ou distribui conteúdo protegido por direitos autorais.
      </p>
      
      <h2><i class="fas fa-times-circle"></i> 6. Isenção de Garantias</h2>
      <p>
        O Bot é fornecido "COMO ESTÁ" e "CONFORME DISPONÍVEL", sem garantias de qualquer tipo, expressas ou implícitas, incluindo, 
        mas não se limitando a, garantias implícitas de comercialização, adequação a um propósito específico e não violação.
      </p>
      <p>
        Não garantimos que:
      </p>
      <ul>
        <li>O Bot funcionará de forma ininterrupta ou livre de erros</li>
        <li>Os defeitos serão corrigidos</li>
        <li>O Bot atenderá às suas expectativas ou requisitos específicos</li>
        <li>As informações obtidas através do Bot serão precisas ou confiáveis</li>
      </ul>
      
      <h2><i class="fas fa-gavel"></i> 7. Limitação de Responsabilidade</h2>
      <p>
        Em nenhuma circunstância seremos responsáveis por quaisquer danos diretos, indiretos, incidentais, especiais, 
        consequenciais ou punitivos resultantes do uso ou incapacidade de usar o Bot.
      </p>
      <p>
        Isso inclui, sem limitação, perda de dados, lucros cessantes ou interrupção de negócios, 
        mesmo que tenhamos sido avisados da possibilidade de tais danos.
      </p>
      
      <h2><i class="fas fa-sync-alt"></i> 8. Modificações dos Termos</h2>
      <p>
        Reservamo-nos o direito de modificar estes Termos a qualquer momento. 
        As alterações entrarão em vigor imediatamente após a publicação dos Termos atualizados.
      </p>
      <p>
        O uso continuado do Bot após quaisquer alterações constitui sua aceitação dos novos Termos. 
        Recomendamos revisar periodicamente esta página para se manter informado sobre atualizações.
      </p>
      
      <h2><i class="fas fa-plug"></i> 9. Disponibilidade do Serviço</h2>
      <p>
        Não garantimos disponibilidade contínua do Bot. O serviço pode ser:
      </p>
      <ul>
        <li>Interrompido temporariamente para manutenção</li>
        <li>Afetado por problemas técnicos fora de nosso controle</li>
        <li>Descontinuado a qualquer momento, com ou sem aviso prévio</li>
      </ul>
      
      <h2><i class="fas fa-envelope"></i> 10. Contato</h2>
      <p>
        Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
      </p>
      <ul>
        <li>Site do desenvolvedor: <a href="${theme.authorUrl}" target="_blank">${theme.authorUrl}</a></li>
        <li>GitHub: <a href="${theme.githubUrl}" target="_blank">${theme.githubUrl}</a></li>
      </ul>
      
      <div class="highlight-box" style="margin-top: 2rem;">
        <p>
          <strong>Ao utilizar o ${theme.botName}, você confirma que leu, entendeu e concorda com estes Termos de Serviço.</strong>
        </p>
      </div>
    </div>
  </div>
  
  ${getFooter()}
</body>
</html>
  `;
}

module.exports = { getTermsPage };
