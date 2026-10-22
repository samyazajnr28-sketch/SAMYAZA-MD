import { setCommandReactState } from "../lib/reactions.js";
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
var cmdreact_default = {
  command: "cmdreact",
  aliases: ["creact", "commandreact"],
  category: "owner",
  description: "Toggle command reactions",
  usage: ".creact on/off",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    if (!args[0] || !["on", "off"].includes(args[0])) {
      await sock.sendMessage(chatId, {
        text: `*Usage:*
.creact on/off

Storage: ${HAS_DB ? "Database" : "File System"}`,
        ...channelInfo
      }, { quoted: message });
      return;
    }
    if (args[0] === "on") {
      await setCommandReactState(true);
      await sock.sendMessage(chatId, {
        text: `*\u2705 Command reactions enabled*

Storage: ${HAS_DB ? "Database" : "File System"}`,
        ...channelInfo
      }, { quoted: message });
    } else if (args[0] === "off") {
      await setCommandReactState(false);
      await sock.sendMessage(chatId, {
        text: `*\u274C Command reactions disabled*

Storage: ${HAS_DB ? "Database" : "File System"}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  cmdreact_default as default
};
