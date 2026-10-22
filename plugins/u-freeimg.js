import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";
import { uploadToFreeimage } from "../lib/uploaders.js";
var u_freeimg_default = {
  command: "freeimage",
  aliases: ["fimg", "freeimg"],
  category: "upload",
  description: "Upload to Freeimage.host",
  usage: ".freeimage (reply to image)",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage) {
        await sock.sendMessage(chatId, { text: "\u26A0\uFE0F Please reply to an image!" }, { quoted: message });
        return;
      }
      await sock.sendMessage(chatId, { text: "Uploading to Freeimage..." }, { quoted: message });
      const stream = await downloadContentFromMessage(quotedMsg.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      const tempDir = path.join("./temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      const tempPath = path.join(tempDir, `freeimage_${Date.now()}.jpg`);
      fs.writeFileSync(tempPath, buffer);
      const result = await uploadToFreeimage(tempPath);
      await sock.sendMessage(chatId, {
        text: `\u2705 *Freeimage Upload Success!*

\u{1F517} *URL:* ${result.url}
\u{1F5BC}\uFE0F *Display:* ${result.display_url}
\u{1F5D1}\uFE0F *Delete:* ${result.delete_url}`
      }, { quoted: message });
      fs.unlinkSync(tempPath);
    } catch (error) {
      console.error("Freeimage Error:", error);
      await sock.sendMessage(chatId, { text: `\u274C Error: ${error.message}` }, { quoted: message });
    }
  }
};
export {
  u_freeimg_default as default
};
