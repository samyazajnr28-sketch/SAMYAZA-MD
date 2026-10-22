import axios from "axios";
var tiktok_default = {
  command: "tiktok",
  aliases: ["tt", "ttdl", "tiktokdl"],
  category: "download",
  description: "Download TikTok video without watermark (HD if available)",
  usage: ".tiktok <TikTok URL>",
  async handler(sock, message, args, context) {
    const { chatId, rawText } = context;
    const prefix = rawText.match(/^[.!#]/)?.[0] || ".";
    const commandPart = rawText.slice(prefix.length).trim();
    const parts = commandPart.split(/\s+/);
    const url = parts.slice(1).join(" ").trim();
    if (!url) {
      return await sock.sendMessage(chatId, {
        text: "\u{1F3B5} *TikTok Downloader*\n\nPlease provide a TikTok URL.\nExample:\n.tiktok https://vm.tiktok.com/XXXX"
      }, { quoted: message });
    }
    try {
      await sock.sendMessage(chatId, {
        text: "\u23F3 Downloading TikTok video..."
      }, { quoted: message });
      const apiUrl = `https://discardapi.onrender.com/api/dl/tiktok?apikey=guru&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, {
        timeout: 45e3,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (!data?.status || !data?.result) {
        throw new Error("Invalid API response");
      }
      const res = data.result;
      const hd = res.data.find((v) => v.type === "nowatermark_hd");
      const noWm = res.data.find((v) => v.type === "nowatermark");
      const videoUrl = hd?.url || noWm?.url;
      if (!videoUrl) {
        throw new Error("No downloadable video found");
      }
      const caption = `\u{1F3B5} *TikTok Downloader*
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F464} *User:* ${res.author.nickname}
\u{1F194} *Username:* ${res.author.fullname}
\u{1F30D} *Region:* ${res.region}
\u23F1\uFE0F *Duration:* ${res.duration}

\u2764\uFE0F *Likes:* ${res.stats.likes}
\u{1F4AC} *Comments:* ${res.stats.comment}
\u{1F501} *Shares:* ${res.stats.share}
\u{1F440} *Views:* ${res.stats.views}

\u{1F3A7} *Sound:* ${res.music_info.title}
\u{1F4C5} *Posted:* ${res.taken_at}

\u{1F4DD} *Caption:*
${res.title || "No caption"}

\u2728 *Quality:* ${hd ? "HD No Watermark" : "No Watermark"}
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`;
      await sock.sendMessage(chatId, {
        video: { url: videoUrl },
        mimetype: "video/mp4",
        caption
      }, { quoted: message });
    } catch (error) {
      console.error("TikTok plugin error:", error);
      if (error.code === "ECONNABORTED") {
        await sock.sendMessage(chatId, {
          text: "\u23F1\uFE0F Request timed out. Please try again later."
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, {
          text: `\u274C Failed to download TikTok video.
Reason: ${error.message}`
        }, { quoted: message });
      }
    }
  }
};
export {
  tiktok_default as default
};
