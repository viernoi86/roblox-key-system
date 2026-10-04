const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const config = require("./config");
const { createKey } = require("./keys");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const durations = [
  { name: "1 jour", value: "1d" },
  { name: "7 jours", value: "7d" },
  { name: "30 jours", value: "30d" },
  { name: "Illimitée", value: "unlimited" }
];

function isAllowed(interaction) {
  const discord = config.discord;

  if (
    discord.allowedUserIds.length > 0 &&
    !discord.allowedUserIds.includes(interaction.user.id)
  ) {
    return false;
  }

  if (
    discord.allowedChannelId &&
    interaction.channelId !== discord.allowedChannelId
  ) {
    return false;
  }

  if (discord.allowedRoleId) {
    const member = interaction.member;

    if (!member || !member.roles.cache.has(discord.allowedRoleId)) {
      return false;
    }
  }

  return true;
}

const commands = [
  new SlashCommandBuilder()
    .setName("getkey")
    .setDescription("Obtenir une clé Roblox")
    .addStringOption(option =>
      option
        .setName("duration")
        .setDescription("Durée de validité")
        .setRequired(true)
        .addChoices(
          ...durations.map(duration => ({
            name: duration.name,
            value: duration.value
          }))
        )
    ),

  new SlashCommandBuilder()
    .setName("adminkey")
    .setDescription("Générer une clé administrateur")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName("duration")
        .setDescription("Durée de validité")
        .setRequired(true)
        .addChoices(
          ...durations.map(duration => ({
            name: duration.name,
            value: duration.value
          }))
        )
    )
].map(command => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: "10" })
    .setToken(config.discord.botToken);

  await rest.put(
    Routes.applicationGuildCommands(
      config.discord.clientId,
      config.discord.guildId
    ),
    {
      body: commands
    }
  );

  console.log("✓ Commandes Discord enregistrées.");
}

async function handleInteraction(interaction) {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (!isAllowed(interaction)) {
    return interaction.reply({
      content: "❌ Tu n'es pas autorisé à utiliser cette commande.",
      ephemeral: true
    });
  }

  if (interaction.commandName === "getkey") {
    const duration = interaction.options.getString("duration");

    try {
      const result = await createKey(
        duration,
        `discord:${interaction.user.id}`
      );

      return interaction.reply({
        content:
          `🔑 **Ta clé Roblox**\n\n` +
          `\`\`\`\n${result.key}\n\`\`\`\n` +
          `⏱️ Durée : **${duration}**\n\n` +
          `⚠️ Garde cette clé secrète.`,
        ephemeral: true
      });
    } catch (error) {
      console.error("Erreur /getkey :", error);

      return interaction.reply({
        content: "❌ Impossible de générer la clé.",
        ephemeral: true
      });
    }
  }

  if (interaction.commandName === "adminkey") {
    if (
      !interaction.memberPermissions ||
      !interaction.memberPermissions.has(
        PermissionFlagsBits.Administrator
      )
    ) {
      return interaction.reply({
        content: "❌ Cette commande est réservée aux administrateurs.",
        ephemeral: true
      });
    }

    const duration = interaction.options.getString("duration");

    try {
      const result = await createKey(
        duration,
        `discord-admin:${interaction.user.id}`
      );

      return interaction.reply({
        content:
          `🔐 **Clé administrateur générée**\n\n` +
          `\`\`\`\n${result.key}\n\`\`\`\n` +
          `⏱️ Durée : **${duration}**`,
        ephemeral: true
      });
    } catch (error) {
      console.error("Erreur /adminkey :", error);

      return interaction.reply({
        content: "❌ Impossible de générer la clé.",
        ephemeral: true
      });
    }
  }
}

async function startDiscordBot() {
  const discord = config.discord;

  if (!discord.botToken) {
    console.log("Discord désactivé : DISCORD_BOT_TOKEN absent.");
    return;
  }

  if (!discord.clientId) {
    throw new Error("DISCORD_CLIENT_ID manquant.");
  }

  if (!discord.guildId) {
    throw new Error("DISCORD_GUILD_ID manquant.");
  }

  client.once("ready", () => {
    console.log(`✓ Bot Discord connecté : ${client.user.tag}`);
  });

  client.on("interactionCreate", handleInteraction);

  await registerCommands();
  await client.login(discord.botToken);
}

module.exports = {
  startDiscordBot
};
