import axios from "axios";
import FormData from "form-data";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
async function getImageBuffer(message) {
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const imageMessage = quoted?.imageMessage || message.message?.imageMessage;
  if (!imageMessage) return null;
  const stream = await downloadContentFromMessage(imageMessage, "image");
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}
var removebg_default = {
  command: "removebg",
  aliases: ["rmbg", "bgremove"],
  category: "tools",
  description: "Remove background from an image",
  usage: ".removebg (reply to image or send image with caption)",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const imageBuffer = await getImageBuffer(message);
      if (!imageBuffer) {
        return await sock.sendMessage(chatId, {
          text: "\u{1F4F8} *Remove Background*\n\nUsage:\n\u2022 Reply to an image with `.removebg`\n\u2022 Send image with caption `.removebg`"
        }, { quoted: message });
      }
      const apiKey = process.env.REMOVEBG_KEY;
      if (!apiKey) {
        return await sock.sendMessage(chatId, {
          text: "\u274C RemoveBG API key not configured."
        }, { quoted: message });
      }
      const form = new FormData();
      form.append("size", "auto");
      form.append("image_file", imageBuffer, {
        filename: "image.jpg",
        contentType: "image/jpeg"
      });
      const response = await axios.post("https://api.remove.bg/v1.0/removebg", form, {
        headers: { ...form.getHeaders(), "X-Api-Key": apiKey },
        responseType: "arraybuffer",
        timeout: 6e4
      });
      await sock.sendMessage(chatId, {
        image: response.data,
        caption: "\u2728 *Background removed successfully*\n\n\u{1D5E3}\u{1D5E2}\u{1D5EA}\u{1D5D8}\u{1D5E5}\u{1D5D8}\u{1D5D7} \u{1D5D5}\u{1D5EC} \u{1D5E0}\u{1D5D8}\u{1D5DA}\u{1D5D4}-\u{1D5E0}\u{1D5D7}"
      }, { quoted: message });
    } catch (err) {
      console.error("RemoveBG Error:", err?.response?.data || err.message);
      let msg = "\u274C Failed to remove background.";
      if (err.response?.status === 402) msg = "\u{1F4B3} API quota exceeded.";
      else if (err.response?.status === 401) msg = "\u{1F511} Invalid API key.";
      else if (err.code === "ECONNABORTED") msg = "\u23F0 Request timeout. Try again.";
      await sock.sendMessage(chatId, { text: msg }, { quoted: message });
    }
  }
};
export {
  removebg_default as default
};
