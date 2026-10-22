import axios from "axios";
var mountImg_default = {
  command: "mountain",
  aliases: ["mountains", "mountainimg"],
  category: "images",
  description: "Get a random mountain image",
  usage: ".mountain",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const res = await axios.get("https://raw.githubusercontent.com/GlobalTechInfo/Database/main/images/mountain.json");
      if (!res.data || !Array.isArray(res.data) || res.data.length === 0) {
        return await sock.sendMessage(chatId, { text: "\u274C Failed to fetch image." }, { quoted: message });
      }
      const randomImage = res.data[Math.floor(Math.random() * res.data.length)];
      await sock.sendMessage(chatId, { image: { url: randomImage }, caption: "\u{1F3D4}\uFE0F Mountain Image" }, { quoted: message });
    } catch (err) {
      console.error("Mountain image plugin error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Error while fetching image." }, { quoted: message });
    }
  }
};
export {
  mountImg_default as default
};
