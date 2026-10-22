import axios from "axios";
var element_default = {
  command: "element",
  aliases: ["atom", "periodictable"],
  category: "search",
  description: "Get information about a chemical element",
  usage: ".element <name or symbol>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args?.join(" ")?.trim();
    if (!query) {
      return await sock.sendMessage(chatId, { text: "*Provide element name or symbol.*\nExample: .element H" }, { quoted: message });
    }
    try {
      const { data: json } = await axios.get(`https://api.popcat.xyz/periodic-table?element=${encodeURIComponent(query)}`);
      if (!json?.name) {
        return await sock.sendMessage(chatId, { text: "\u274C Element not found." }, { quoted: message });
      }
      const text = `\u{1F9EA} *Element Info*
\u2022 Name: ${json.name}
\u2022 Symbol: ${json.symbol}
\u2022 Atomic #: ${json.atomic_number}
\u2022 Atomic Mass: ${json.atomic_mass}
\u2022 Period: ${json.period}
\u2022 Phase: ${json.phase}
\u2022 Discovered By: ${json.discovered_by || "Unknown"}

\u{1F4D8} Summary:
${json.summary}`;
      await sock.sendMessage(chatId, { image: { url: json.image }, caption: text }, { quoted: message });
    } catch (error) {
      console.error("Element plugin error:", error);
      await sock.sendMessage(chatId, { text: "\u274C Failed to fetch element info." }, { quoted: message });
    }
  }
};
export {
  element_default as default
};
