import fs from "fs";
import path from "path";
import { dataFile, store } from "../storage.js";
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const configPath = dataFile("autotyping.json");
async function initConfig() {
  if (HAS_DB) {
    const config = await store.getSetting("global", "autotyping");
    return config || { enabled: false };
  } else {
    if (!fs.existsSync(configPath)) {
      const dataDir = path.dirname(configPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(configPath, JSON.stringify({ enabled: false }, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
}
async function saveConfig(config) {
  if (HAS_DB) {
    await store.saveSetting("global", "autotyping", config);
  } else {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
}
export async function isAutotypingEnabled() {
  try {
    const config = await initConfig();
    return config.enabled;
  } catch (error) {
    console.error("Error checking autotyping status:", error);
    return false;
  }
}
async function isGhostModeActive() {
  try {
    const ghostMode = await store.getSetting("global", "stealthMode");
    return ghostMode && ghostMode.enabled;
  } catch (error) {
    return false;
  }
}
async function handleAutotypingForMessage(sock, chatId, userMessage) {
  const ghostActive = await isGhostModeActive();
  if (ghostActive) {
    return false;
  }
  const enabled = await isAutotypingEnabled();
  if (enabled) {
    try {
      await sock.presenceSubscribe(chatId);
      await sock.sendPresenceUpdate("available", chatId);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await sock.sendPresenceUpdate("composing", chatId);
      const typingDelay = Math.max(3e3, Math.min(8e3, userMessage.length * 150));
      await new Promise((resolve) => setTimeout(resolve, typingDelay));
      await sock.sendPresenceUpdate("composing", chatId);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await sock.sendPresenceUpdate("paused", chatId);
      return true;
    } catch (error) {
      console.error("Error sending typing indicator:", error);
      return false;
    }
  }
  return false;
}
export async function handleAutotypingForCommand(sock, chatId) {
  const ghostActive = await isGhostModeActive();
  if (ghostActive) {
    return false;
  }
  const enabled = await isAutotypingEnabled();
  if (enabled) {
    try {
      await sock.presenceSubscribe(chatId);
      await sock.sendPresenceUpdate("available", chatId);
      await new Promise((resolve) => setTimeout(resolve, 500));
      await sock.sendPresenceUpdate("composing", chatId);
      const commandTypingDelay = 3e3;
      await new Promise((resolve) => setTimeout(resolve, commandTypingDelay));
      await sock.sendPresenceUpdate("composing", chatId);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await sock.sendPresenceUpdate("paused", chatId);
      return true;
    } catch (error) {
      console.error("Error sending command typing indicator:", error);
      return false;
    }
  }
  return false;
}
async function showTypingAfterCommand(sock, chatId) {
  const ghostActive = await isGhostModeActive();
  if (ghostActive) {
    return false;
  }
  const enabled = await isAutotypingEnabled();
  if (enabled) {
    try {
      await sock.presenceSubscribe(chatId);
      await sock.sendPresenceUpdate("composing", chatId);
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      await sock.sendPresenceUpdate("paused", chatId);
      return true;
    } catch (error) {
      console.error("Error sending post-command typing indicator:", error);
      return false;
    }
  }
  return false;
}
var autotyping_default = {
  command: "autotyping",
  aliases: ["typing", "autotype"],
  category: "automation",
  description: "Toggle auto-typing indicator when bot is processing messages",
  usage: ".autotyping <on|off>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    try {
      const config = await initConfig();
      const action = args[0]?.toLowerCase();
      if (!action) {
        const ghostActive = await isGhostModeActive();
        await sock.sendMessage(chatId, {
          text: `*\u2328\uFE0F AUTOTYPING STATUS*

*Current Status:* ${config.enabled ? "\u2705 Enabled" : "\u274C Disabled"}
*Ghost Mode:* ${ghostActive ? "\u{1F47B} Active (blocks typing)" : "\u274C Inactive"}
*Storage:* ${HAS_DB ? "Database" : "File System"}

*Commands:*
\u2022 \`.autotyping on\` - Enable auto-typing
\u2022 \`.autotyping off\` - Disable auto-typing

*What it does:*
When enabled, the bot will show "typing..." indicator while processing messages and commands.

*Note:* Ghost mode overrides autotyping to maintain stealth.`,
          ...channelInfo
        }, { quoted: message });
        return;
      }
      if (action === "on" || action === "enable") {
        if (config.enabled) {
          await sock.sendMessage(chatId, {
            text: "\u26A0\uFE0F *Autotyping is already enabled*",
            ...channelInfo
          }, { quoted: message });
          return;
        }
        config.enabled = true;
        await saveConfig(config);
        const ghostActive = await isGhostModeActive();
        await sock.sendMessage(chatId, {
          text: `\u2705 *Auto-typing enabled!*

The bot will now show typing indicator while processing.${ghostActive ? "\n\n\u26A0\uFE0F *Ghost mode is active* - typing indicators are currently blocked." : ""}`,
          ...channelInfo
        }, { quoted: message });
      } else if (action === "off" || action === "disable") {
        if (!config.enabled) {
          await sock.sendMessage(chatId, {
            text: "\u26A0\uFE0F *Autotyping is already disabled*",
            ...channelInfo
          }, { quoted: message });
          return;
        }
        config.enabled = false;
        await saveConfig(config);
        await sock.sendMessage(chatId, {
          text: "\u274C *Auto-typing disabled!*\n\nThe bot will no longer show typing indicator.",
          ...channelInfo
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, {
          text: "\u274C *Invalid option!*\n\nUse: `.autotyping on/off`",
          ...channelInfo
        }, { quoted: message });
      }
    } catch (error) {
      console.error("Error in autotyping command:", error);
      await sock.sendMessage(chatId, {
        text: "\u274C *Error processing command!*",
        ...channelInfo
      }, { quoted: message });
    }
  },
  isAutotypingEnabled,
  handleAutotypingForMessage,
  handleAutotypingForCommand,
  showTypingAfterCommand
};
export {
  autotyping_default as default,
  handleAutotypingForMessage,
  showTypingAfterCommand
};
