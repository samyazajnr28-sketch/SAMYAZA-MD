import axios from "axios";
var tstalk_default = {
  command: "thrstalk",
  aliases: ["threadsprofile", "threadsuser"],
  category: "stalk",
  description: "Lookup Threads user profile",
  usage: ".thrstalk <username>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: "*Please provide a Threads username.*\nExample: .thrstalk google"
      }, { quoted: message });
    }
    const username = args[0];
    try {
      const apiUrl = `https://discardapi.onrender.com/api/stalk/threads?apikey=guru&url=${username}`;
      const { data } = await axios.get(apiUrl, {
        timeout: 45e3,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });
      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: "\u274C Threads user not found." }, { quoted: message });
      }
      const result = data.result;
      const profileImage = result.hd_profile_picture || result.profile_picture || null;
      const verifiedMark = result.is_verified ? "\u2705 Verified" : "";
      const caption = `\u{1F9F5} *Threads Profile Info*

\u{1F464} Name: ${result.name || "N/A"} ${verifiedMark}
\u{1F194} Username: ${result.username || "N/A"}
\u{1F4CE} Links: ${result.links?.length ? result.links.join("\n") : "N/A"}
\u{1F465} Followers: ${result.followers || 0}
\u{1F4DD} Bio: ${result.bio || "N/A"}
\u{1F517} Profile URL: https://threads.net/@${result.username || username}`;
      if (profileImage) {
        await sock.sendMessage(chatId, { image: { url: profileImage }, caption }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: caption }, { quoted: message });
      }
    } catch (err) {
      console.error("Threads plugin error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Failed to fetch Threads profile." }, { quoted: message });
    }
  }
};
export {
  tstalk_default as default
};
