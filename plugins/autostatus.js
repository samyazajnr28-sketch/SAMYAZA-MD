import fs from "fs";
import path from "path";
import { dataFile, store } from "../storage.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
const MY_JID = "254715182153@s.whatsapp.net";
const STATUS_REACTION = "\u{1F90D}";
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const configPath = dataFile("autoStatus.json");
const downloadDir = path.join(process.cwd(), "downloads", "statuses");
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}
if (!HAS_DB && !fs.existsSync(configPath)) {
  if (!fs.existsSync(path.dirname(configPath))) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }
  fs.writeFileSync(configPath, JSON.stringify({
    enabled: false,
    reactOn: false,
    saveOn: false
  }, null, 2));
}
const channelInfo = {
  contextInfo: {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363319098372999@newsletter",
      newsletterName: "GlobalTechInc",
      serverMessageId: -1
    }
  }
};
async function readConfig() {
  try {
    if (HAS_DB) {
      const config = await store.getSetting("global", "autoStatus");
      return config || { enabled: false, reactOn: false, saveOn: false };
    } else {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      return {
        enabled: !!config.enabled,
        reactOn: !!config.reactOn,
        saveOn: !!config.saveOn
      };
    }
  } catch (error) {
    return { enabled: false, reactOn: false, saveOn: false };
  }
}
async function writeConfig(config) {
  try {
    if (HAS_DB) {
      await store.saveSetting("global", "autoStatus", config);
    } else {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    }
  } catch (error) {
    console.error("Error writing auto status config:", error);
  }
}
async function isAutoStatusEnabled() {
  const config = await readConfig();
  return config.enabled;
}
async function isStatusReactionEnabled() {
  const config = await readConfig();
  return config.reactOn;
}
async function isStatusSaveEnabled() {
  const config = await readConfig();
  return config.saveOn;
}
async function saveStatus(sock, msg) {
  try {
    if (!await isStatusSaveEnabled()) return;
    const message = msg.message?.imageMessage || msg.message?.videoMessage;
    if (!message) return;
    const type = msg.message?.imageMessage ? "image" : "video";
    const stream = await downloadContentFromMessage(message, type);
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }
    const fileName = `${msg.key.id || Date.now()}.${type === "image" ? "jpg" : "mp4"}`;
    fs.writeFileSync(path.join(downloadDir, fileName), buffer);
    const jid = msg.key.participant || msg.key.remoteJid;
    let contactName = "Unknown";
    try {
      contactName = await sock.getName(jid);
    } catch (e) {
      contactName = jid.split("@")[0];
    }
    await sock.sendMessage(MY_JID, {
      [type]: buffer,
      caption: `\u{1F4BE} *Status saved from:* ${contactName}`
    });
    console.log(`\u2705 Saved and sent status to DM: ${fileName} (From: ${contactName})`);
  } catch (error) {
    console.error("\u274C Error saving/sending status:", error.message);
  }
}
async function reactToStatus(sock, statusKey) {
  try {
    if (!await isStatusReactionEnabled()) return;
    await sock.relayMessage(
      "status@broadcast",
      {
        reactionMessage: {
          key: {
            remoteJid: "status@broadcast",
            id: statusKey.id,
            participant: statusKey.participant || statusKey.remoteJid,
            fromMe: false
          },
          text: STATUS_REACTION
        }
      },
      {
        messageId: statusKey.id,
        statusJidList: [statusKey.remoteJid, statusKey.participant || statusKey.remoteJid]
      }
    );
  } catch (error) {
    console.error("\u274C Error reacting to status:", error.message);
  }
}
async function handleStatusUpdate(sock, status) {
  try {
    if (!await isAutoStatusEnabled()) return;
    const msg = status.messages ? status.messages[0] : status;
    if (msg.key && msg.key.remoteJid === "status@broadcast") {
      await sock.readMessages([msg.key]);
      await reactToStatus(sock, msg.key);
      await saveStatus(sock, msg);
    }
  } catch (error) {
    console.error("\u274C Error in auto status handler:", error.message);
  }
}
var autostatus_default = {
  command: "autostatus",
  aliases: ["autoview", "statusview"],
  category: "automation",
  description: "Automatically view, react, and save WhatsApp statuses",
  usage: ".autostatus <on|off|react on|react off|save on|save off>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const config = await readConfig();
    if (!args || args.length === 0) {
      await sock.sendMessage(chatId, {
        text: `\u{1F504} *Auto Status Settings*

\u{1F4F1} *Auto View:* ${config.enabled ? "\u2705" : "\u274C"}
\u{1F4AB} *Reactions:* ${config.reactOn ? "\u2705" : "\u274C"}
\u{1F4BE} *Auto Save:* ${config.saveOn ? "\u2705" : "\u274C"}

*Usage:*
.autostatus on/off
.autostatus react on/off
.autostatus save on/off`,
        ...channelInfo
      }, { quoted: message });
      return;
    }
    const cmd = args[0].toLowerCase();
    if (cmd === "on" || cmd === "off") {
      config.enabled = cmd === "on";
    } else if (cmd === "react" && args[1]) {
      config.reactOn = args[1].toLowerCase() === "on";
    } else if (cmd === "save" && args[1]) {
      config.saveOn = args[1].toLowerCase() === "on";
    } else {
      return await sock.sendMessage(chatId, { text: "\u274C Invalid arguments." }, { quoted: message });
    }
    await writeConfig(config);
    await sock.sendMessage(chatId, { text: `\u2705 Settings updated successfully.` }, { quoted: message });
  },
  handleStatusUpdate,
  isAutoStatusEnabled,
  isStatusReactionEnabled,
  isStatusSaveEnabled,
  reactToStatus,
  saveStatus,
  readConfig,
  writeConfig
};
export {
  autostatus_default as default,
  handleStatusUpdate
};
