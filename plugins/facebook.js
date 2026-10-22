import axios from "axios";
const AXIOS_DEFAULTS = {
  timeout: 6e4,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "application/json, text/plain, */*"
  }
};
var facebook_default = {
  command: "facebook",
  aliases: ["fb", "fbdl"],
  category: "download",
  description: "Download Facebook videos",
  usage: ".fb <facebook video link>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args.join(" ") || message.message?.conversation || message.message?.extendedTextMessage?.text;
    try {
      if (!url) {
        return await sock.sendMessage(chatId, { text: "\u{1F4D8} *Facebook Downloader*\n\nUsage:\n.fb <facebook video link>" }, { quoted: message });
      }
      if (!/facebook\.com|fb\.watch/i.test(url)) {
        return await sock.sendMessage(
          chatId,
          { text: "\u274C Invalid Facebook link.\nPlease send a valid Facebook video URL." },
          { quoted: message }
        );
      }
      await sock.sendMessage(chatId, {
        react: { text: "\u{1F504}", key: message.key }
      });
      const apiUrl = `https://gtech-api-xtp1.onrender.com/api/download/fb?url=${encodeURIComponent(
        url
      )}&apikey=APIKEY`;
      const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
      const videos = res?.data?.data?.data;
      if (!res?.data?.status || !Array.isArray(videos) || !videos.length) {
        throw new Error("No downloadable video found");
      }
      const sorted = videos.sort((a, b) => {
        const qa = parseInt(a.resolution, 10) || 0;
        const qb = parseInt(b.resolution, 10) || 0;
        return qb - qa;
      });
      const selected = sorted[0];
      const videoUrl = selected.url.startsWith("http") ? selected.url : `https://gtech-api-xtp1.onrender.com${selected.url}`;
      const caption = `\u{1F4D8} *Facebook Downloader*
\u{1F39E} Quality: *${selected.resolution || "Unknown"}*

> *_Downloaded by MEGA-MD_*`;
      await sock.sendMessage(chatId, { video: { url: videoUrl }, mimetype: "video/mp4", caption }, { quoted: message });
    } catch (err) {
      console.error("Facebook downloader error:", err);
      await sock.sendMessage(
        chatId,
        { text: "\u274C Failed to download Facebook video. Please try again later." },
        { quoted: message }
      );
    }
  }
};
export {
  facebook_default as default
};
