import axios from "axios";
var xstalk_default = {
  command: "xstalk",
  aliases: ["twstalk", "xprofile"],
  category: "stalk",
  description: "Lookup Twitter user profile",
  usage: ".xstalk <username>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: "*Please provide a Twitter username.*\nExample: .xstalk HarmeetSinghPk"
      }, { quoted: message });
    }
    const username = args[0];
    try {
      const { data } = await axios.get(`https://discardapi.dpdns.org/api/stalk/twitter`, {
        params: { apikey: "guru", username }
      });
      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: "\u274C Twitter user not found." }, { quoted: message });
      }
      const result = data.result;
      const profileImage = result.profile?.image || null;
      const bannerImage = result.profile?.banner || null;
      const verifiedMark = result.verified ? "\u2705 Verified" : "";
      const caption = `\u{1F426} *Twitter Profile Info*

\u{1F464} Name: ${result.name || "N/A"} ${verifiedMark}
\u{1F194} Username: @${result.username || "N/A"}
\u{1F4DD} Bio: ${result.description || "N/A"}
\u{1F4CD} Location: ${result.location || "N/A"}
\u{1F4C5} Joined: ${new Date(result.created_at).toDateString()}

\u{1F465} Followers: ${result.stats?.followers || 0}
\u27A1 Following: ${result.stats?.following || 0}
\u2764\uFE0F Likes: ${result.stats?.likes || 0}
\u{1F5BC} Media: ${result.stats?.media || 0}
\u{1F426} Tweets: ${result.stats?.tweets || 0}
\u{1F517} Profile URL: https://twitter.com/${result.username}`;
      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }
      if (bannerImage) {
        await sock.sendMessage(chatId, { image: { url: bannerImage }, caption: `\u{1F4CC} Banner of @${username}` });
      }
    } catch (err) {
      console.error("Twitter plugin error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Failed to fetch Twitter profile." }, { quoted: message });
    }
  }
};
export {
  xstalk_default as default
};
