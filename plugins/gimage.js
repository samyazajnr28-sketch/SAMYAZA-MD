import axios from "axios";
var gimage_default = {
  command: "gimage",
  aliases: ["googleimage", "gimg"],
  category: "download",
  description: "Search and send first 4 Google images",
  usage: ".gimage <search query>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args?.join(" ").trim();
    if (!query) {
      return await sock.sendMessage(chatId, { text: "Please provide a search query.\nExample: .gimage Pakistan" }, { quoted: message });
    }
    try {
      const apiUrl = `https://discardapi.dpdns.org/api/dl/gimage?apikey=guru&query=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl, { timeout: 1e4 });
      if (!data?.status || !data.imageUrls?.length) {
        return await sock.sendMessage(chatId, { text: "\u274C No images found for this query." }, { quoted: message });
      }
      const imagesToSend = data.imageUrls.slice(0, 4);
      for (let i = 0; i < imagesToSend.length; i++) {
        const imgUrl = imagesToSend[i];
        await sock.sendMessage(chatId, { image: { url: imgUrl }, caption: `\u{1F5BC}\uFE0F *Google Image ${i + 1}*` }, { quoted: message });
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      }
    } catch (error) {
      console.error("GImage plugin error:", error);
      if (error.code === "ECONNABORTED") {
        await sock.sendMessage(chatId, { text: "\u274C Request timed out. The API may be slow or unreachable." }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: "\u274C Failed to fetch Google images." }, { quoted: message });
      }
    }
  }
};
export {
  gimage_default as default
};
