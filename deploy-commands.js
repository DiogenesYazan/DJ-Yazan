require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const cmds = [];

for (const f of fs.readdirSync('./commands').filter(f => f.endsWith('.js'))) {
  const cmd = require(`./commands/${f}`);
  cmds.push(cmd.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: cmds }
)
.then(() => console.log('→ Slash commands deployados.'))
.catch(console.error);
