import pkg from "api-qasim";
const QasimAny = pkg;
import { channelInfo } from "../lib/messageConfig.js";
var wattpad_default = {
  command: "wattpad",
  aliases: ["wattpadsearch", "searchwattpad"],
  category: "search",
  description: "Search for stories on Wattpad!",
  usage: ".wattpad <query>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(" ").trim();
    if (!query) {
      return await sock.sendMessage(chatId, {
        text: `*Please provide a query (e.g., story title, author, or tag).*
Example: .wattpad The Hunger Games`,
        ...channelInfo
      }, { quoted: message });
    }
    try {
      const results = await QasimAny.wattpad(query);
      if (!Array.isArray(results) || results.length === 0) {
        throw new Error("No results found for your query.");
      }
      const formattedResults = results.slice(0, 9).map((story, index) => {
        const title = story.judul || "No title available";
        const reads = story.dibaca || "No reads available";
        const votes = story.divote || "No votes available";
        const thumb = story.thumb || "";
        const link = story.link || "No link available";
        return `${index + 1}. *${title}*
*Reads*: ${reads}
*Votes*: ${votes}
Read more: ${link}${thumb ? `
${thumb}` : ""}`;
      }).join("\n\n");
      await sock.sendMessage(chatId, {
        text: `*Search Results For "${query}":*

${formattedResults}`,
        ...channelInfo
      }, { quoted: message });
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C An error occurred: ${error.message || error}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  wattpad_default as default
};
