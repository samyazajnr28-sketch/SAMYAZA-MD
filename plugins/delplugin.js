import { join } from "path";
import { unlinkSync, readdirSync } from "fs";
var delplugin_default = {
  command: "delplugin",
  aliases: ["deleteplugin", "rmplugin"],
  category: "owner",
  description: "Delete a plugin by name (owner only)",
  usage: ".delplugin <plugin_name>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      if (!args || !args[0]) {
        return await sock.sendMessage(chatId, {
          text: `*\u{1F31F}Example usage:*
.delplugin main-menu`
        }, { quoted: message });
      }
      const pluginDir = join(process.cwd(), "plugins");
      const pluginFiles = readdirSync(pluginDir).filter((f) => f.endsWith(".js"));
      const pluginNames = pluginFiles.map((f) => f.replace(".js", ""));
      if (!pluginNames.includes(args[0])) {
        return await sock.sendMessage(chatId, {
          text: `\u{1F5C3}\uFE0F This plugin doesn't exist!

Available plugins:
${pluginNames.join("\n")}`
        }, { quoted: message });
      }
      const filePath = join(pluginDir, args[0] + ".js");
      unlinkSync(filePath);
      await sock.sendMessage(chatId, { text: `\u26A0\uFE0F Plugin "${args[0]}.js" has been deleted.` }, { quoted: message });
    } catch (err) {
      console.error("rmplugin error:", err);
      await sock.sendMessage(chatId, {
        text: `\u274C Failed to delete plugin: ${err.message}`
      }, { quoted: message });
    }
  }
};
export {
  delplugin_default as default
};
