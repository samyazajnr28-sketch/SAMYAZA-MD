import store from "../lib/lightweight_store.js";
import fs from "fs";
import { dataFile } from "../lib/paths.js";
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const STICKER_FILE = dataFile("sticker_commands.json");
async function getStickerCommands() {
  if (HAS_DB) {
    const data = await store.getSetting("global", "stickerCommands");
    return data || {};
  } else {
    try {
      if (!fs.existsSync(STICKER_FILE)) {
        return {};
      }
      return JSON.parse(fs.readFileSync(STICKER_FILE, "utf8"));
    } catch {
      return {};
    }
  }
}
var listcmd_default = {
  command: "listcmd",
  aliases: ["cmdlist"],
  category: "owner",
  description: "List all sticker commands",
  usage: ".listcmd",
  async handler(sock, message, args, context) {
    const { chatId } = context;
    const stickers = await getStickerCommands();
    const entries = Object.entries(stickers);
    if (entries.length === 0) {
      return await sock.sendMessage(chatId, {
        text: "\u2733\uFE0F No sticker commands found"
      }, { quoted: message });
    }
    const stickerList = entries.map(
      ([key, value], index) => `${index + 1}. ${value.locked ? `*(blocked)* ${key}` : key} : ${value.text}`
    ).join("\n");
    const mentions = entries.map(([, value]) => value.mentionedJid).flat().filter(Boolean);
    await sock.sendMessage(chatId, {
      text: `*CUSTOM STICKER COMMANDS*

\u25A2 *Info:* Custom commands set via .setcmd

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
${stickerList}`,
      mentions
    }, { quoted: message });
  }
};
export {
  listcmd_default as default
};
