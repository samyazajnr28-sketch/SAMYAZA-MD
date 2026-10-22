import axios from "axios";
var tgstalk_default = {
  command: "tgstalk",
  aliases: ["tguser", "tginfo"],
  category: "stalk",
  description: "Lookup Telegram channel or user",
  usage: ".tgstalk <username>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: "*Please provide a Telegram username.*\nExample: .tginfo GlobalTechBots"
      }, { quoted: message });
    }
    const username = args[0];
    try {
      const apiUrl = `https://discardapi.onrender.com/api/stalk/telegram?apikey=guru&url=${username}`;
      const { data } = await axios.get(apiUrl, {
        timeout: 45e3,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: "\u274C Telegram user/channel not found." }, { quoted: message });
      }
      const result = data.result;
      const profileImage = result.image_url || null;
      const caption = `\u{1F4F1} *Telegram Info*

\u{1F464} Title: ${result.title || "N/A"}
\u{1F4DD} Description: ${result.description || "N/A"}
\u{1F517} Link: ${result.url || `https://t.me/${username}`}`;
      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }
    } catch (err) {
      console.error("Telegram plugin error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Failed to fetch Telegram info." }, { quoted: message });
    }
  }
};
export {
  tgstalk_default as default
};
