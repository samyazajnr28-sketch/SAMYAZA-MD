import axios from "axios";
function decodeUnicode(str) {
  if (!str) return "N/A";
  return str.replace(
    /\\u[\dA-F]{4}/gi,
    (match) => String.fromCharCode(parseInt(match.replace("\\u", ""), 16))
  );
}
var genshin_default = {
  command: "genshin",
  aliases: ["gh", "uid"],
  category: "stalk",
  description: "Stalk Genshin Impact UID",
  usage: ".genshin <UID>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: "*Please provide a Genshin UID.*\nExample: .genshin 826401293"
      }, { quoted: message });
    }
    const uid = args[0];
    try {
      const { data } = await axios.get(`https://discardapi.dpdns.org/api/stalk/genshin`, {
        params: { apikey: "guru", text: uid }
      });
      if (!data?.result) {
        return await sock.sendMessage(chatId, { text: "\u274C UID not found or invalid." }, { quoted: message });
      }
      const result = data.result;
      const caption = `\u{1F3AE} *Genshin UID Info*

\u{1F464} Nickname: ${result.nickname || "N/A"}
\u{1F194} UID: ${result.uid || "N/A"}
\u{1F3C6} Achievements: ${result.achivement || "N/A"}
\u26A1 Level: ${result.level || "N/A"}
\u{1F30C} World Level: ${result.world_level || "N/A"}
\u{1F300} Spiral Abyss: ${decodeUnicode(result.spiral_abyss)}
\u{1F4B3} Card ID: ${result.card_id || "N/A"}`;
      await sock.sendMessage(chatId, { image: { url: result.image }, caption }, { quoted: message });
    } catch (err) {
      console.error("Genshin plugin error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Failed to fetch UID info." }, { quoted: message });
    }
  }
};
export {
  genshin_default as default
};
