import axios from "axios";
import { channelInfo } from "../lib/messageConfig.js";
var wikipedia_default = {
  command: "wiki",
  aliases: ["wikipedia"],
  category: "search",
  description: "Search Wikipedia for a topic!",
  usage: ".wiki <query>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(" ").trim();
    if (!query) {
      return await sock.sendMessage(chatId, {
        text: "*Enter what you want to search for on Wikipedia.*\nExample: .wiki Pakistan",
        ...channelInfo
      }, { quoted: message });
    }
    const formattedQuery = query.replace(/ /g, "_");
    try {
      const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedQuery)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) MEGA-BOT/1.0",
          "Accept-Language": "en"
        }
      });
      const data = res.data;
      if (data.extract) {
        await sock.sendMessage(chatId, {
          text: `\u25A2 *Wikipedia*

\u2023 Search: ${data.title}

${data.extract}

Read more: ${data.content_urls.desktop.page}`,
          ...channelInfo
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, {
          text: "\u26A0\uFE0F No results found.",
          ...channelInfo
        }, { quoted: message });
      }
    } catch (e) {
      console.error("Wikipedia plugin error:", e.message || e);
      await sock.sendMessage(chatId, {
        text: "\u26A0\uFE0F No results found or Wikipedia blocked the request.",
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  wikipedia_default as default
};
