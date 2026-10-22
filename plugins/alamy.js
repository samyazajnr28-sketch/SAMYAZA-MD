import axios from "axios";
var alamy_default = {
  command: "alamy",
  aliases: ["alamydl", "alamydownload"],
  category: "download",
  description: "Download image or video from Alamy URL",
  usage: ".alamy <Alamy URL>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args?.[0]?.trim();
    if (!url) {
      return await sock.sendMessage(chatId, { text: "\u274C Please provide an Alamy URL.\nExample: .alamy https://www.alamy.com/video/beautiful-lake..." }, { quoted: message });
    }
    try {
      const apiUrl = `https://discardapi.dpdns.org/api/dl/alamy?apikey=guru&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, { timeout: 1e4 });
      if (!data?.status || !data.result?.length) {
        return await sock.sendMessage(chatId, { text: "\u274C Failed to fetch media from the provided Alamy URL." }, { quoted: message });
      }
      const isValidUrl = (u) => u && u.startsWith("http");
      let sent = false;
      for (const item of data.result) {
        if (isValidUrl(item.video)) {
          await sock.sendMessage(chatId, { video: { url: item.video }, caption: "\u{1F3AC} *Alamy Video*" }, { quoted: message });
          sent = true;
        }
        if (isValidUrl(item.image)) {
          await sock.sendMessage(chatId, { image: { url: item.image }, caption: "\u{1F5BC}\uFE0F *Alamy Image*" }, { quoted: message });
          sent = true;
        }
      }
      if (!sent) {
        await sock.sendMessage(chatId, { text: "\u274C No valid media found in the Alamy URL." }, { quoted: message });
      }
    } catch (error) {
      console.error("Alamy download plugin error:", error);
      if (error.code === "ECONNABORTED") {
        await sock.sendMessage(chatId, { text: "\u274C Request timed out. The API may be slow or unreachable." }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: "\u274C Failed to download media from Alamy URL." }, { quoted: message });
      }
    }
  }
};
export {
  alamy_default as default
};
