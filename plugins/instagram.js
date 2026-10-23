import { igdl } from "ruhend-scraper";
const processedMessages = /* @__PURE__ */ new Set();
var instagram_default = {
  command: "instagram",
  aliases: ["ig", "igdl", "insta"],
  category: "download",
  description: "Download public Instagram media you own or have permission to reuse",
  usage: ".ig <public Instagram link> (only media you own or may reuse)",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const input = args.join(" ") || message.message?.conversation || message.message?.extendedTextMessage?.text || "";
    if (processedMessages.has(message.key.id)) return;
    processedMessages.add(message.key.id);
    setTimeout(() => processedMessages.delete(message.key.id), 3e5);
    if (!input) {
      return await sock.sendMessage(chatId, {
        text: "\u{1F4F8} *Instagram Downloader*\n\nUsage:\n.ig <public post | reel | video link>\nOnly download media you own or have permission to reuse."
      }, { quoted: message });
    }
    // Accept post, reel, reels, TV, story, and share URLs, including query strings.
    const urlMatch = input.match(/https?:\/\/(?:www\.|m\.)?(?:instagram\.com|instagr\.am)\/[^\s<>]+/i);
    const instagramUrl = urlMatch?.[0]?.replace(/[),\]}]+$/, "");
    let parsedUrl;
    try {
      parsedUrl = instagramUrl ? new URL(instagramUrl) : null;
    } catch {
      parsedUrl = null;
    }
    const isInstagramHost = parsedUrl
      && /(^|\.)instagram\.com$|(^|\.)instagr\.am$/i.test(parsedUrl.hostname);
    const hasMediaPath = parsedUrl
      && /^\/(?:p|reel|reels|tv|stories|share)\//i.test(parsedUrl.pathname);
    if (!parsedUrl || !isInstagramHost || !hasMediaPath) {
      return await sock.sendMessage(chatId, {
        text: "\u274C Invalid link. Please send a valid Instagram post, reel, or video URL."
      }, { quoted: message });
    }
    try {
      await sock.sendMessage(chatId, { react: { text: "\u{1F504}", key: message.key } });
      const res = await igdl(parsedUrl.toString()).catch((error) => {
        console.error("Instagram scraper request failed:", error.message);
        return null;
      });
      if (!res?.data || !Array.isArray(res.data) || res.data.length === 0) {
        return await sock.sendMessage(chatId, {
          text: "\u274C Could not retrieve media. The link might be private or broken."
        }, { quoted: message });
      }
      const mediaList = res.data.filter(
        (item, index, self) => item?.url && self.findIndex((t) => t.url === item.url) === index
      ).slice(0, 5);
      for (const media of mediaList) {
        try {
          const isVideo = media.type === "video" || /mp4|mov|webm/i.test(media.url);
          await sock.sendMessage(chatId, {
            [isVideo ? "video" : "image"]: { url: media.url },
            ...isVideo ? { mimetype: "video/mp4" } : {},
            caption: "\u{1F4E5} *Downloaded by SAMYAZA-MD*\nOnly share media you own or have permission to reuse."
          }, { quoted: message });
          await new Promise((resolve) => setTimeout(resolve, 800));
        } catch (subErr) {
          console.error("Media stream error:", subErr);
        }
      }
      await sock.sendMessage(chatId, { react: { text: "\u2705", key: message.key } });
    } catch (err) {
      console.error("Instagram plugin fatal error:", err);
      await sock.sendMessage(chatId, {
        text: "\u26A0\uFE0F An error occurred while processing your request. Please try again later."
      }, { quoted: message });
    }
  }
};
export {
  instagram_default as default
};
