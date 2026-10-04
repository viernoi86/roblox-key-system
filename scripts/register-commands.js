import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const {
  DISCORD_BOT_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_GUILD_ID
} = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID || !DISCORD_GUILD_ID) {
  throw new Error("DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID and DISCORD_GUILD_ID are required.");
}

const commands = [
  new SlashCommandBuilder()
    .setName("getkey")
    .setDescription("Generate a Roblox key for yourself.")
    .addStringOption(o =>
      o.setName("duration")
        .setDescription("Validity duration")
        .setRequired(false)
        .addChoices(
          { name: "1 jour", value: "1d" },
          { name: "7 jours", value: "7d" },
          { name: "30 jours", value: "30d" },
          { name: "Illimitée", value: "unlimited" }
        )
    ),
  new SlashCommandBuilder()
    .setName("adminkey")
    .setDescription("Generate a Roblox key as an administrator.")
    .addStringOption(o =>
      o.setName("duration")
        .setDescription("Validity duration")
        .setRequired(false)
        .addChoices(
          { name: "1 jour", value: "1d" },
          { name: "7 jours", value: "7d" },
          { name: "30 jours", value: "30d" },
          { name: "Illimitée", value: "unlimited" }
        )
    )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);
await rest.put(
  Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
  { body: commands }
);

console.log("Discord slash commands registered.");
