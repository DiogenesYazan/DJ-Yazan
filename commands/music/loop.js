const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('🔁 Alterna loop')
    .addStringOption(o =>
      o.setName('mode')
        .setDescription('off | queue | track')
        .setRequired(true)
        .addChoices(
          { name: 'Nenhum (off)', value: 'off' },
          { name: 'Fila (queue)', value: 'queue' },
          { name: 'Faixa (track)', value: 'track' },
        )
    ),
  async execute(interaction) {
    const mode = interaction.options.getString('mode');
    const player = interaction.client.lavalink.getPlayer(interaction.guildId);

    if (!player || !player.queue.current) {
      return interaction.reply({ content: '❌ Nenhuma música tocando.', ephemeral: true });
    }

    // Usa a função nativa do Lavalink para loop
    player.setRepeatMode(mode);

    interaction.reply({ content: `🔁 Loop agora está em **${mode}**`, ephemeral: true });
  }
};
