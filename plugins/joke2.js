import axios from "axios";
var joke2_default = {
  command: "joke2",
  aliases: ["funny2", "jokes2"],
  category: "fun",
  description: "Get a random general joke",
  usage: ".joke2",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const res = await axios.get("https://raw.githubusercontent.com/GlobalTechInfo/Database/main/text/random_jokes.txt");
      if (!res.data) {
        return await sock.sendMessage(chatId, { text: "\u274C Failed to fetch joke." }, { quoted: message });
      }
      const jokes = res.data.split("\n").filter((line) => line.trim() !== "");
      if (jokes.length === 0) {
        return await sock.sendMessage(chatId, { text: "\u274C No jokes available." }, { quoted: message });
      }
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      await sock.sendMessage(chatId, { text: `\u{1F602} *Joke*

${randomJoke}` }, { quoted: message });
    } catch (err) {
      console.error("Joke plugin error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Error while fetching joke." }, { quoted: message });
    }
  }
};
export {
  joke2_default as default
};
