import axios from "axios";
var gstalk_default = {
  command: "github",
  aliases: ["ghprofile", "gh"],
  category: "stalk",
  description: "Lookup GitHub user profile",
  usage: ".github <username>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: "*Please provide a GitHub username.*\nExample: .github GlobalTechInfo"
      }, { quoted: message });
    }
    const username = args[0];
    try {
      const apiUrl = `https://discardapi.onrender.com/api/stalk/github?apikey=guru&url=${username}`;
      const { data } = await axios.get(apiUrl, {
        timeout: 45e3,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: "\u274C GitHub user not found." }, { quoted: message });
      }
      const result = data.result;
      const caption = `\u{1F419} *GitHub Profile Info*

\u{1F464} Name: ${result.nickname || "N/A"}
\u{1F194} Username: ${result.username || "N/A"}
\u{1F3E2} Company: ${result.company || "N/A"}
\u{1F4CD} Location: ${result.location || "N/A"}
\u{1F4AC} Bio: ${result.bio || "N/A"}
\u{1F4E6} Public Repos: ${result.public_repo || 0}
\u{1F4DC} Public Gists: ${result.public_gists || 0}
\u{1F465} Followers: ${result.followers || 0}
\u27A1 Following: ${result.following || 0}
\u{1F517} Profile URL: ${result.url || "N/A"}
\u{1F4C5} Created At: ${new Date(result.created_at).toDateString()}
\u{1F552} Last Updated: ${new Date(result.updated_at).toDateString()}`;
      await sock.sendMessage(chatId, { image: { url: result.profile_pic }, caption }, { quoted: message });
    } catch (err) {
      console.error("GitHub plugin error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Failed to fetch GitHub profile." }, { quoted: message });
    }
  }
};
export {
  gstalk_default as default
};
