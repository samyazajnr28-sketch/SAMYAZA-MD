import axios from "axios";
var quote2_default = {
  command: "quote2",
  aliases: ["quotes2", "randomquote"],
  category: "quotes",
  description: "Get a random inspirational quote",
  usage: ".quote2",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const res = await axios.get("https://discardapi.dpdns.org/api/quotes/random?apikey=guru");
      if (!res.data || res.data.status !== true) {
        return await sock.sendMessage(chatId, { text: "\u274C Failed to fetch quote." }, { quoted: message });
      }
      const quote = res.data.result?.quote || "No quote found.";
      const _creator = res.data.creator || "Unknown";
      const replyText = `\u{1F4AC} *Random Quote*

${quote}`;
      await sock.sendMessage(chatId, { text: replyText }, { quoted: message });
    } catch (err) {
      console.error("Quote plugin error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Error while fetching quote." }, { quoted: message });
    }
  }
};
export {
  quote2_default as default
};
