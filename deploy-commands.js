require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ============================================
// 📂 CARREGA COMANDOS (RECURSIVO)
// ============================================
function loadCommands(dir) {
  const commands = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      // Recursivamente carrega subpastas (music/, games/, misc/)
      const category = item.name.toUpperCase();
      console.log(`📁 Categoria: ${category}`);
      commands.push(...loadCommands(fullPath));
    } else if (item.name.endsWith('.js')) {
      try {
        const cmd = require(fullPath);
        if (cmd.data && cmd.execute) {
          commands.push(cmd.data.toJSON());
          console.log(`  ✔ /${cmd.data.name}`);
        }
      } catch (err) {
        console.error(`  ✖ Erro ao carregar ${item.name}:`, err.message);
      }
    }
  }
  
  return commands;
}

console.log('📦 Carregando comandos para registro...');
const commands = loadCommands(path.join(__dirname, 'commands'));
console.log(`📊 Total: ${commands.length} comandos`);

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('⚙️ Registrando comandos...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados');
  } catch (err) {
    console.error(err);
  }
})();
