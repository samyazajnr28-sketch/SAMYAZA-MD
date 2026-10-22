import axios from "axios";
var pstalk_default = {
  command: "pinstalk",
  aliases: ["pstalk", "pinprofile"],
  category: "stalk",
  description: "Lookup Pinterest user profile",
  usage: ".pinstalk <username>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: "*Please provide a Pinterest username.*\nExample: .pinstalk anti_establishment"
      }, { quoted: message });
    }
    const username = args[0];
    try {
      const { data } = await axios.get(`https://discardapi.dpdns.org/api/stalk/pinterest`, {
        params: { apikey: "guru", username }
      });
      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: "\u274C Pinterest user not found." }, { quoted: message });
      }
      const result = data.result;
      const profileImage = result.image?.large || result.image?.original || null;
      const caption = `\u{1F4CC} *Pinterest Profile Info*

\u{1F464} Full Name: ${result.full_name || "N/A"}
\u{1F194} Username: ${result.username || "N/A"}
\u{1F4DD} Bio: ${result.bio || "N/A"}
\u{1F4CC} Boards: ${result.stats?.boards || 0}
\u{1F465} Followers: ${result.stats?.followers || 0}
\u27A1 Following: ${result.stats?.following || 0}
\u2764\uFE0F Likes: ${result.stats?.likes || 0}
\u{1F4CC} Pins: ${result.stats?.pins || 0}
\u{1F4BE} Saves: ${result.stats?.saves || 0}
\u{1F517} Profile URL: ${result.profile_url || "N/A"}
\u{1F310} Website: ${result.website || "N/A"}`;
      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }
    } catch (err) {
      console.error("Pinterest plugin error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Failed to fetch Pinterest profile." }, { quoted: message });
    }
  }
};
export {
  pstalk_default as default
};
