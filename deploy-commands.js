require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('Toca música do YouTube pelo nome ou link')
    .addStringOption(opt =>
      opt.setName('query')
         .setDescription('Nome ou URL da música')
         .setRequired(true)
    ),

  new SlashCommandBuilder()
  .setName('playlist')
  .setDescription('Toca até 25 músicas populares de um artista')
  .addStringOption(opt =>
    opt.setName('artista')
       .setDescription('Nome do artista ou banda')
       .setRequired(true)
  ),

  new SlashCommandBuilder()
  .setName('nowplayed')
  .setDescription('Mostra a música atual e o volume'),

  new SlashCommandBuilder()
    .setName('pause')
    .setDescription('Pausa a música que está tocando'),

  new SlashCommandBuilder()
  .setName('stop')
  .setDescription('Para a música atual e limpa a fila'),

  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Pula para a próxima música na fila'),

  new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Mostra a fila de músicas'),

  new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Define o volume (1–200%)')
    .addIntegerOption(opt =>
      opt.setName('amount')
         .setDescription('Nível de volume')
         .setRequired(true)
         .setMinValue(1)
         .setMaxValue(200)
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔁 Registrando comandos...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados!');
  } catch (err) {
    console.error('❌ Erro ao registrar comandos:', err);
  }
})();
