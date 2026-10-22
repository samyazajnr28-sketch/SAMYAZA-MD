import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
var sharpen_default = {
  command: "sharpen",
  aliases: ["enhance"],
  category: "tools",
  description: "Convert an image to sharpen",
  usage: "Reply to an image with .sharpen",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.imageMessage) {
        return await sock.sendMessage(
          chatId,
          { text: "\u{1FA75} *Sharpen Image*\n\nReply to an image to convert it to sepia\n\nUsage:\n.sharpen" },
          { quoted: message }
        );
      }
      await sock.sendMessage(chatId, { react: { text: "\u{1F504}", key: message.key } });
      const stream = await downloadContentFromMessage(quoted.imageMessage, "image");
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      const tempFile = path.join(process.cwd(), `sepia_${Date.now()}.jpg`);
      fs.writeFileSync(tempFile, buffer);
      const form = new FormData();
      form.append("apikey", "guru");
      form.append("file", fs.createReadStream(tempFile));
      const res = await axios.post(
        "https://discardapi.dpdns.org/api/image/sharpen",
        form,
        { headers: form.getHeaders(), responseType: "arraybuffer", timeout: 6e4 }
      );
      fs.unlinkSync(tempFile);
      if (!res?.data) throw new Error("Sharpen conversion failed");
      const grayFile = path.join(process.cwd(), `sepia_result_${Date.now()}.jpg`);
      fs.writeFileSync(grayFile, res.data);
      await sock.sendMessage(
        chatId,
        {
          image: { url: grayFile },
          caption: `\u{1FA75} *Sharpen Image*

\u{1D67F}\u{1D69B}\u{1D698}\u{1D68C}\u{1D68E}\u{1D69C}\u{1D69C}\u{1D68E}\u{1D68D} \u{1D68B}\u{1D6A2}: \u{1D67C}\u{1D674}\u{1D676}\u{1D670}-\u{1D67C}\u{1D673}`
        },
        { quoted: message }
      );
      fs.unlinkSync(grayFile);
    } catch (err) {
      console.error("Sharpen Plugin Error:", err);
      await sock.sendMessage(
        chatId,
        { text: "\u274C Failed to convert image to sepia. Make sure the image is clear and try again." },
        { quoted: message }
      );
    }
  }
};
export {
  sharpen_default as default
};
