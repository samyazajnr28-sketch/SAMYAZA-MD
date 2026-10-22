import fs from "fs";
import path from "path";
import { dataFile, store } from "../storage.js";
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const configPath = dataFile("autoread.json");
async function initConfig() {
  const defaultConfig = { dm: false, groups: false };
  if (HAS_DB) {
    const config = await store.getSetting("global", "autoread");
    return config || defaultConfig;
  } else {
    if (!fs.existsSync(configPath)) {
      const dataDir = path.dirname(configPath);
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    }
    return JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
}
async function saveConfig(config) {
  if (HAS_DB) {
    await store.saveSetting("global", "autoread", config);
  } else {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
}
async function isAutoreadEnabled(isGroup) {
  try {
    const config = await initConfig();
    return isGroup ? config.groups : config.dm;
  } catch {
    return false;
  }
}
function isBotMentionedInMessage(message, botNumber) {
  if (!message.message) return false;
  const textContent = message.message.conversation || message.message.extendedTextMessage?.text || "";
  if (textContent) {
    const botUsername = botNumber.split("@")[0];
    if (textContent.includes(`@${botUsername}`)) return true;
  }
  return false;
}
async function handleAutoread(sock, message) {
  try {
    const ghostMode = await store.getSetting("global", "stealthMode");
    if (ghostMode?.enabled) return false;
  } catch {
  }
  const remoteJid = message.key.remoteJid || "";
  const isGroup = remoteJid.endsWith("@g.us");
  if (await isAutoreadEnabled(isGroup)) {
    const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    if (isBotMentionedInMessage(message, botNumber)) return false;
    try {
      await sock.readMessages([{
        remoteJid: message.key.remoteJid,
        id: message.key.id,
        participant: message.key.participant
      }]);
      return true;
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }
  return false;
}
var autoread_default = {
  command: "autoread",
  aliases: ["read"],
  category: "automation",
  description: "Toggle autoread for DM or Groups",
  usage: ".autoread <dm|groups> <on|off>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const config = await initConfig();
    const [target, state] = args;
    if (!target || !state) {
      await sock.sendMessage(chatId, { text: `*\u{1F4D6} AUTOREAD CONFIG*

DM: ${config.dm ? "\u2705" : "\u274C"}
Groups: ${config.groups ? "\u2705" : "\u274C"}

Usage: .autoread <dm|groups> <on|off>` }, { quoted: message });
      return;
    }
    if (target === "dm" || target === "groups") {
      config[target] = state === "on";
      await saveConfig(config);
      await sock.sendMessage(chatId, { text: `\u2705 Autoread for ${target} set to ${state}` }, { quoted: message });
    }
  }
};
export {
  autoread_default as default,
  handleAutoread
};
