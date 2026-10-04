const dotenv = require("dotenv");

dotenv.config();

function required(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }

  return value;
}

const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || "development",

  supabaseUrl: required("SUPABASE_URL"),
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),

  adminPasswordHash: required("ADMIN_PASSWORD_HASH"),
  jwtSecret: required("JWT_SECRET"),

  robloxApiKey: required("ROBLOX_API_KEY"),

  cookieSecure: process.env.COOKIE_SECURE === "true",

  discord: {
    botToken: process.env.DISCORD_BOT_TOKEN || "",
    clientId: process.env.DISCORD_CLIENT_ID || "",
    guildId: process.env.DISCORD_GUILD_ID || "",
    allowedRoleId: process.env.DISCORD_ALLOWED_ROLE_ID || "",
    allowedChannelId: process.env.DISCORD_ALLOWED_CHANNEL_ID || "",
    allowedUserIds: (process.env.DISCORD_ALLOWED_USER_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  }
};

module.exports = config;
