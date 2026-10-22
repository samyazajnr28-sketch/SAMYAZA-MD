import fs from "fs";
import path from "path";
import { dataFile, store } from "../storage.js";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { writeFile } from "fs/promises";
const messageStore = /* @__PURE__ */ new Map();
const CONFIG_PATH = dataFile("antidelete.json");
const TEMP_MEDIA_DIR = path.join(process.cwd(), "temp");
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
if (!fs.existsSync(TEMP_MEDIA_DIR)) {
  fs.mkdirSync(TEMP_MEDIA_DIR, { recursive: true });
}
const getFolderSizeInMB = (folderPath) => {
  try {
    const files = fs.readdirSync(folderPath);
    let totalSize = 0;
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      if (fs.statSync(filePath).isFile()) {
        totalSize += fs.statSync(filePath).size;
      }
    }
    return totalSize / (1024 * 1024);
  } catch (err) {
    console.error("Error getting folder size:", err);
    return 0;
  }
};
const cleanTempFolderIfLarge = () => {
  try {
    const sizeMB = getFolderSizeInMB(TEMP_MEDIA_DIR);
    if (sizeMB > 200) {
      const files = fs.readdirSync(TEMP_MEDIA_DIR);
      for (const file of files) {
        const filePath = path.join(TEMP_MEDIA_DIR, file);
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error("Temp cleanup error:", err);
  }
};
setInterval(cleanTempFolderIfLarge, 60 * 1e3);
async function loadAntideleteConfig() {
  try {
    if (HAS_DB) {
      const config = await store.getSetting("global", "antidelete");
      return config || { enabled: false };
    } else {
      if (!fs.existsSync(CONFIG_PATH)) return { enabled: false };
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    }
  } catch {
    return { enabled: false };
  }
}
async function saveAntideleteConfig(config) {
  try {
    if (HAS_DB) {
      await store.saveSetting("global", "antidelete", config);
    } else {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    }
  } catch (err) {
    console.error("Config save error:", err);
  }
}
async function storeMessage(sock, message) {
  try {
    const config = await loadAntideleteConfig();
    if (!config.enabled) return;
    if (!message.key?.id) return;
    const messageId = message.key.id;
    let content = "";
    let mediaType = "";
    let mediaPath = "";
    let isViewOnce = false;
    const sender = message.key.participant || message.key.remoteJid;
    const viewOnceContainer = message.message?.viewOnceMessageV2?.message || message.message?.viewOnceMessage?.message;
    if (viewOnceContainer) {
      if (viewOnceContainer.imageMessage) {
        mediaType = "image";
        content = viewOnceContainer.imageMessage.caption || "";
        const stream = await downloadContentFromMessage(viewOnceContainer.imageMessage, "image");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
        await writeFile(mediaPath, buffer);
        isViewOnce = true;
      } else if (viewOnceContainer.videoMessage) {
        mediaType = "video";
        content = viewOnceContainer.videoMessage.caption || "";
        const stream = await downloadContentFromMessage(viewOnceContainer.videoMessage, "video");
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
        await writeFile(mediaPath, buffer);
        isViewOnce = true;
      }
    } else if (message.message?.conversation) {
      content = message.message.conversation;
    } else if (message.message?.extendedTextMessage?.text) {
      content = message.message.extendedTextMessage.text;
    } else if (message.message?.imageMessage) {
      mediaType = "image";
      content = message.message.imageMessage.caption || "";
      const stream = await downloadContentFromMessage(message.message.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.jpg`);
      await writeFile(mediaPath, buffer);
    } else if (message.message?.stickerMessage) {
      mediaType = "sticker";
      const stream = await downloadContentFromMessage(message.message.stickerMessage, "sticker");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.webp`);
      await writeFile(mediaPath, buffer);
    } else if (message.message?.videoMessage) {
      mediaType = "video";
      content = message.message.videoMessage.caption || "";
      const stream = await downloadContentFromMessage(message.message.videoMessage, "video");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.mp4`);
      await writeFile(mediaPath, buffer);
    } else if (message.message?.audioMessage) {
      mediaType = "audio";
      const mime = message.message.audioMessage.mimetype || "";
      const ext = mime.includes("mpeg") ? "mp3" : mime.includes("ogg") ? "ogg" : "mp3";
      const stream = await downloadContentFromMessage(message.message.audioMessage, "audio");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      mediaPath = path.join(TEMP_MEDIA_DIR, `${messageId}.${ext}`);
      await writeFile(mediaPath, buffer);
    }
    messageStore.set(messageId, {
      content,
      mediaType,
      mediaPath,
      sender,
      group: message.key.remoteJid.endsWith("@g.us") ? message.key.remoteJid : null,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (isViewOnce && mediaType && fs.existsSync(mediaPath)) {
      try {
        const ownerNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
        const senderName = sender.split("@")[0];
        const mediaOptions = {
          caption: `*Anti-ViewOnce ${mediaType}*
From: @${senderName}`,
          mentions: [sender]
        };
        if (mediaType === "image") {
          await sock.sendMessage(ownerNumber, { image: { url: mediaPath }, ...mediaOptions });
        } else if (mediaType === "video") {
          await sock.sendMessage(ownerNumber, { video: { url: mediaPath }, ...mediaOptions });
        }
        try {
          fs.unlinkSync(mediaPath);
        } catch {
        }
      } catch (e) {
      }
    }
  } catch (err) {
    console.error("storeMessage error:", err);
  }
}
async function handleMessageRevocation(sock, revocationMessage) {
  try {
    const config = await loadAntideleteConfig();
    if (!config.enabled) return;
    const messageId = revocationMessage.message.protocolMessage.key.id;
    const deletedBy = revocationMessage.participant || revocationMessage.key.participant || revocationMessage.key.remoteJid;
    const ownerNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    if (deletedBy.includes(sock.user.id) || deletedBy === ownerNumber) return;
    const original = messageStore.get(messageId);
    if (!original) return;
    const sender = original.sender;
    const senderName = sender.split("@")[0];
    const groupName = original.group ? (await sock.groupMetadata(original.group)).subject : "";
    const time = (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
      timeZone: process.env.TIMEZONE || "Asia/Karachi",
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    let text = `*\u{1F530}SAMYAZA ANTIDELETE REPORT \u{1F530}*

*\u{1F5D1}\uFE0F Deleted By:* @${deletedBy.split("@")[0]}
*\u{1F464} Sender:* @${senderName}
*\u{1F4F1} Number:* ${sender}
*\u{1F552} Time:* ${time}
`;
    if (groupName) text += `*\u{1F465} Group:* ${groupName}
`;
    if (original.content) {
      text += `
*\u{1F4AC} Deleted Message:*
${original.content}`;
    }
    await sock.sendMessage(ownerNumber, {
      text,
      mentions: [deletedBy, sender]
    });
    if (original.mediaType && fs.existsSync(original.mediaPath)) {
      const mediaOptions = {
        caption: `*Deleted ${original.mediaType}*
From: @${senderName}`,
        mentions: [sender]
      };
      try {
        switch (original.mediaType) {
          case "image":
            await sock.sendMessage(ownerNumber, {
              image: { url: original.mediaPath },
              ...mediaOptions
            });
            break;
          case "sticker":
            await sock.sendMessage(ownerNumber, {
              sticker: { url: original.mediaPath },
              ...mediaOptions
            });
            break;
          case "video":
            await sock.sendMessage(ownerNumber, {
              video: { url: original.mediaPath },
              ...mediaOptions
            });
            break;
          case "audio":
            await sock.sendMessage(ownerNumber, {
              audio: { url: original.mediaPath },
              mimetype: "audio/mpeg",
              ptt: false,
              ...mediaOptions
            });
            break;
        }
      } catch (err) {
        await sock.sendMessage(ownerNumber, {
          text: `\u26A0\uFE0F Error sending media: ${err.message}`
        });
      }
      try {
        fs.unlinkSync(original.mediaPath);
      } catch (err) {
        console.error("Media cleanup error:", err);
      }
    }
    messageStore.delete(messageId);
  } catch (err) {
    console.error("handleMessageRevocation error:", err);
  }
}
var antidelete_default = {
  command: "antidelete",
  aliases: ["antidel", "adel"],
  category: "automation",
  description: "Enable or disable antidelete feature to track deleted messages",
  usage: ".antidelete <on|off>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const config = await loadAntideleteConfig();
    const action = args[0]?.toLowerCase();
    if (!action) {
      await sock.sendMessage(chatId, {
        text: `*\u{1F530}SAMYAZA ANTIDELETE SETUP \u{1F530}*

*Current Status:* ${config.enabled ? "\u2705 Enabled" : "\u274C Disabled"}
*Storage:* ${HAS_DB ? "Database" : "File System"}

*Commands:*
\u2022 \`.antidelete on\` - Enable
\u2022 \`.antidelete off\` - Disable

*Features:*
\u2022 Track deleted messages
\u2022 Save deleted media
\u2022 Auto-save ViewOnce media
\u2022 Send reports to owner`
      }, { quoted: message });
      return;
    }
    if (action === "on") {
      config.enabled = true;
      await saveAntideleteConfig(config);
      await sock.sendMessage(chatId, {
        text: `\u2705 *Antidelete enabled!*

Storage: ${HAS_DB ? "Database" : "File System"}

The bot will now:
\u2022 Track all messages
\u2022 Monitor deleted messages
\u2022 Save ViewOnce media
\u2022 Send deletion reports to owner`
      }, { quoted: message });
    } else if (action === "off") {
      config.enabled = false;
      await saveAntideleteConfig(config);
      await sock.sendMessage(chatId, {
        text: `\u274C *Antidelete disabled!*

The bot will no longer track deleted messages.`
      }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, {
        text: "\u274C *Invalid command*\n\nUse: `.antidelete on/off`"
      }, { quoted: message });
    }
  },
  handleMessageRevocation,
  storeMessage,
  loadAntideleteConfig,
  saveAntideleteConfig
};
export {
  antidelete_default as default,
  handleMessageRevocation,
  storeMessage
};
