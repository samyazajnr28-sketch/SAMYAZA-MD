import CommandHandler from "../lib/commandHandler.js";
var manage_default = {
  command: "manage",
  aliases: ["ctrl", "control"],
  category: "owner",
  description: "Manage bot commands and aliases",
  usage: ".manage [toggle/alias] [command_name] [new_alias]",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const action = args[0]?.toLowerCase();
    const targetCmd = args[1]?.toLowerCase();
    try {
      if (action === "toggle") {
        if (!CommandHandler.commands.has(targetCmd)) {
          return await sock.sendMessage(chatId, { text: `\u274C Command *${targetCmd}* not found.` }, { quoted: message });
        }
        const state = CommandHandler.toggleCommand(targetCmd);
        return await sock.sendMessage(chatId, { text: `\u2705 Command *${targetCmd}* has been *${state}*.` }, { quoted: message });
      }
      if (action === "alias") {
        const newAlias = args[2]?.toLowerCase();
        if (!targetCmd || !newAlias) {
          return await sock.sendMessage(chatId, { text: "\u274C Usage: .manage alias [command] [new_alias]" }, { quoted: message });
        }
        if (!CommandHandler.commands.has(targetCmd)) {
          return await sock.sendMessage(chatId, { text: `\u274C Source command *${targetCmd}* not found.` }, { quoted: message });
        }
        CommandHandler.aliases.set(newAlias, targetCmd);
        return await sock.sendMessage(chatId, { text: `\u2705 Added alias *${newAlias}* for command *${targetCmd}*.` }, { quoted: message });
      }
      const helpText = `\u{1F6E0}\uFE0F *COMMAND MANAGER*

*\u2060\u2022 Toggle:* .manage toggle [name]
*\u2022 Alias:* .manage alias [name] [new_alias]
*\u2022 Reload:* Run your reload command to reset changes.`;
      await sock.sendMessage(chatId, { text: helpText }, { quoted: message });
    } catch (error) {
      console.error("Error in manage plugin:", error);
      await sock.sendMessage(chatId, { text: "\u274C Management action failed." }, { quoted: message });
    }
  }
};
export {
  manage_default as default
};
