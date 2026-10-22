import axios from "axios";
var string_default = {
  command: "string",
  aliases: ["textinfo", "textstats"],
  category: "info",
  description: "Get detailed info about a text string",
  usage: ".string <text>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const textInput = args?.join(" ")?.trim();
    if (!textInput) {
      return await sock.sendMessage(chatId, { text: "*Provide some text to analyze.*\nExample: .string What is AI" }, { quoted: message });
    }
    try {
      const apiUrl = `https://discardapi.dpdns.org/api/tools/string?apikey=guru&text=${encodeURIComponent(textInput)}`;
      const { data } = await axios.get(apiUrl, { timeout: 1e4 });
      if (!data?.status) {
        return await sock.sendMessage(chatId, { text: "\u274C Failed to analyze text." }, { quoted: message });
      }
      const reply = `\u{1F4DD} *Text Analysis*

\u270F\uFE0F Text: ${textInput}
\u{1F520} Letters: ${data.letters}
\u{1F522} Characters (including spaces): ${data.length}
\u{1F4C4} Words: ${data.words}

\u{1F4A1} Tip: Keep your text concise for better readability!`;
      await sock.sendMessage(chatId, { text: reply }, { quoted: message });
    } catch (error) {
      console.error("String plugin error:", error);
      if (error.code === "ECONNABORTED") {
        await sock.sendMessage(chatId, { text: "\u274C Request timed out. Please try again later." }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: "\u274C Failed to fetch text information." }, { quoted: message });
      }
    }
  }
};
export {
  string_default as default
};
