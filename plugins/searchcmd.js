import CommandHandler from "../lib/commandHandler.js";
var searchcmd_default = {
  command: "find",
  aliases: ["lookup", "searchcmd"],
  category: "general",
  description: "Find a command by keyword or description",
  usage: ".find [keyword]",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(" ").toLowerCase();
    if (!query) {
      return await sock.sendMessage(chatId, { text: "What are you looking for? Example: *.find status*" }, { quoted: message });
    }
    try {
      const allCommands = Array.from(CommandHandler.commands.values());
      const results = allCommands.filter((commandObject) => {
        const nameMatch = commandObject.command?.toLowerCase().includes(query);
        const descMatch = commandObject.description?.toLowerCase().includes(query);
        const aliasMatch = commandObject.aliases?.some((a) => a.toLowerCase().includes(query));
        return nameMatch || descMatch || aliasMatch;
      });
      if (results.length === 0) {
        const suggestion = CommandHandler.findSuggestion(query);
        let failText = `\u274C No commands found matching *"${query}"*`;
        if (suggestion) failText += `

Did you mean: *.${suggestion}*?`;
        return await sock.sendMessage(chatId, { text: failText }, { quoted: message });
      }
      let resultText = `\u{1F50D} *SEARCH RESULTS FOR:* "${query.toUpperCase()}"

`;
      results.forEach((res, index) => {
        const status = CommandHandler.disabledCommands.has(res.command.toLowerCase()) ? "\u{1F538}" : "\u{1F539}";
        resultText += `${index + 1}. ${status} *.${res.command}*
`;
        resultText += `\u{1F4DD} _${res.description || "No description available."}_
`;
        if (res.aliases && res.aliases.length > 0) {
          resultText += `\u{1F517} Aliases: ${res.aliases.join(", ")}
`;
        }
        resultText += `
`;
      });
      resultText += `\u{1F4A1} _Tip: Use the prefix before the command name to run it._`;
      await sock.sendMessage(chatId, { text: resultText }, { quoted: message });
    } catch (error) {
      console.error("Search Error:", error);
      await sock.sendMessage(chatId, { text: "\u274C An error occurred during the search." });
    }
  }
};
export {
  searchcmd_default as default
};
