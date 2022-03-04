// Imports
import { appLogger, botLogger } from "./util/log";
import config from "./config/config";
import { getEnvVar } from "./util/env";
import onMessage from "./events/message";
import { Client, Intents } from "discord.js";
import { onInteraction } from "./events/interaction";

// Load settings
appLogger.info("Fetching settings from environment variables...");
const BOT_TOKEN = getEnvVar("BOT_TOKEN", "Bot Token");

// Create the client
appLogger.info("Creating Discord bot connection...");
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES]
});

// Attempt login
appLogger.info("Logging into Discord services...");

// Ready
client.on("ready", () => {
  botLogger.info("Connected to Discord servers!");
  client.user?.setPresence({
    status: "online",
    activities: [
      {
        name: "merge conflicts...",
        type: "LISTENING"
      }
    ]
  });
  client.guilds.cache.forEach((guild) => guild.me?.setNickname(config.bot.nickname));
});

// Logging
// client.on("error", (e) => botLogger.error(e));
// client.on("warn", (e) => botLogger.warn(e));
// client.on("debug", (e) => botLogger.debug(e));

// Custom event handlers
client.on("messageCreate", onMessage.bind(undefined, client));
client.on("interactionCreate", onInteraction.bind(undefined, client));

client.login(BOT_TOKEN);
