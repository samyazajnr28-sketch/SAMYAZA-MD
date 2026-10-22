import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
var readqr_default = {
  command: "readqr",
  aliases: ["qrread", "decodeqr"],
  category: "tools",
  description: "Read QR code from an image",
  usage: "Reply to an image with .readqr",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.imageMessage) {
        return await sock.sendMessage(
          chatId,
          { text: "\u{1F9FE} *QR Reader*\n\n\u{1F4CC} Reply to an image that contains a QR code\n\nUsage:\n.readqr" },
          { quoted: message }
        );
      }
      await sock.sendMessage(chatId, {
        react: { text: "\u{1F50D}", key: message.key }
      });
      const stream = await downloadContentFromMessage(
        quoted.imageMessage,
        "image"
      );
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      const tempFile = path.join(process.cwd(), `qr_${Date.now()}.png`);
      fs.writeFileSync(tempFile, buffer);
      const form = new FormData();
      form.append("apikey", "guru");
      form.append("image", fs.createReadStream(tempFile));
      const res = await axios.post(
        "https://discardapi.dpdns.org/api/tools/readqr",
        form,
        { headers: form.getHeaders(), timeout: 6e4 }
      );
      fs.unlinkSync(tempFile);
      if (!res?.data?.status) throw new Error("Decode failed");
      await sock.sendMessage(
        chatId,
        {
          text: `\u2705 *QR Code Decoded*

\u{1F4C4} *Result:*
\`\`\`
${res.data.result}
\`\`\`

\u{1F464} ${res.data.creator}
`
        },
        { quoted: message }
      );
    } catch (err) {
      console.error("QR Reader Error:", err);
      await sock.sendMessage(
        chatId,
        { text: "\u274C Failed to read QR code. Please try a clearer image." },
        { quoted: message }
      );
    }
  }
};
export {
  readqr_default as default
};
