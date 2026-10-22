import axios from "axios";
var ttstalk_default = {
  command: "ttstalk",
  aliases: ["tikstalk", "ttprofile"],
  category: "stalk",
  description: "Lookup TikTok user profile",
  usage: ".ttstalk <username>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: "*Please provide a TikTok username.*\nExample: .ttstalk truepakistanofficial"
      }, { quoted: message });
    }
    const username = args[0];
    try {
      const { data } = await axios.get("https://discardapi.dpdns.org/api/stalk/tiktok", {
        params: { apikey: "guru", username }
      });
      if (!data?.result?.user) {
        return await sock.sendMessage(chatId, { text: "\u274C TikTok user not found." }, { quoted: message });
      }
      const user = data.result.user;
      const stats = data.result.statsV2 || data.result.stats;
      const profileImage = user.avatarLarger || user.avatarMedium || user.avatarThumb;
      const verifiedMark = user.verified ? "\u2705 Verified" : "";
      const caption = `\u{1F3B5} *TikTok Profile Info*

\u{1F464} Nickname: ${user.nickname || "N/A"} ${verifiedMark}
\u{1F194} Username: @${user.uniqueId || "N/A"}
\u{1F4DD} Bio: ${user.signature || "N/A"}
\u{1F512} Private Account: ${user.privateAccount ? "Yes" : "No"}

\u{1F465} Followers: ${stats?.followerCount || 0}
\u27A1 Following: ${stats?.followingCount || 0}
\u2764\uFE0F Likes: ${stats?.heartCount || 0}
\u{1F3A5} Videos: ${stats?.videoCount || 0}

\u{1F517} Profile URL: https://www.tiktok.com/@${user.uniqueId}`;
      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }
    } catch (err) {
      console.error("TikTok plugin error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Failed to fetch TikTok profile." }, { quoted: message });
    }
  }
};
export {
  ttstalk_default as default
};
