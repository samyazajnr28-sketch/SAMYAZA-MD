import axios from "axios";
var twitter_default = {
  command: "twitter",
  aliases: ["xtweet", "tweetdl", "twitterdl"],
  category: "download",
  description: "Download media (video or image) from X/Twitter post",
  usage: ".twitter <Tweet URL>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const url = args?.[0];
    if (!url) {
      return await sock.sendMessage(chatId, { text: "Please provide a Twitter/X URL.\nExample: .twitter https://x.com/i/status/2002054360428167305" }, { quoted: message });
    }
    try {
      const apiUrl = `https://discardapi.dpdns.org/api/dl/twitter?apikey=guru&url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl, { timeout: 1e4 });
      if (!data?.status || !data.result?.media?.length) {
        return await sock.sendMessage(chatId, { text: "\u274C No media found for this Tweet." }, { quoted: message });
      }
      const tweet = data.result;
      const caption = `
\u{1F4DD} @${tweet.authorUsername} (${tweet.authorName})
\u{1F4C5} ${tweet.date}
\u2764\uFE0F Likes: ${tweet.likes} | \u{1F501} Retweets: ${tweet.retweets} | \u{1F4AC} Replies: ${tweet.replies}

\u{1F4AC} ${tweet.text}
      `.trim();
      for (const mediaItem of tweet.media) {
        if (mediaItem.type === "video") {
          await sock.sendMessage(chatId, { video: { url: mediaItem.url }, caption }, { quoted: message });
        } else if (mediaItem.type === "image") {
          await sock.sendMessage(chatId, { image: { url: mediaItem.url }, caption }, { quoted: message });
        }
      }
    } catch (error) {
      console.error("Twitter plugin error:", error);
      if (error.code === "ECONNABORTED") {
        await sock.sendMessage(chatId, { text: "\u274C Request timed out. The API may be slow or unreachable." }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: "\u274C Failed to fetch Twitter/X media." }, { quoted: message });
      }
    }
  }
};
export {
  twitter_default as default
};
