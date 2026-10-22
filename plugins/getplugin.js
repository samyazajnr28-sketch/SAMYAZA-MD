import fs from "fs";
import path from "path";
var getplugin_default = {
  command: "inspect",
  aliases: ["cat", "readcode", "getplugin"],
  category: "owner",
  description: "Read the source code of a specific plugin",
  usage: ".inspect [plugin_name]",
  ownerOnly: true,
  async handler(sock, message, args, _context) {
    const chatId = message.key.remoteJid;
    const pluginName = args[0];
    if (!pluginName) {
      return await sock.sendMessage(chatId, { text: "Which plugin do you want to inspect?\n\n*Examples:*\n- .inspect ping\n- .inspect ping.ts\n- .inspect ping.js" }, { quoted: message });
    }
    try {
      const base = pluginName.replace(/\.(ts|js)$/, "");
      let filePath;
      let fileName;
      if (pluginName.endsWith(".js")) {
        filePath = path.join(process.cwd(), "dist", "plugins", base + ".js");
        fileName = base + ".js";
      } else {
        filePath = path.join(process.cwd(), "plugins", base + ".ts");
        fileName = base + ".ts";
        if (!fs.existsSync(filePath)) {
          filePath = path.join(process.cwd(), "dist", "plugins", base + ".js");
          fileName = base + ".js";
        }
      }
      if (!fs.existsSync(filePath)) {
        return await sock.sendMessage(chatId, { text: `\u274C Plugin "${base}" not found.` }, { quoted: message });
      }
      const code = fs.readFileSync(filePath, "utf8");
      const formattedCode = `\u{1F4BB} *SOURCE CODE: ${fileName}*

\`\`\`javascript
${code}
\`\`\``;
      if (formattedCode.length > 4e3) {
        await sock.sendMessage(chatId, {
          document: Buffer.from(code),
          fileName,
          mimetype: "text/javascript",
          caption: `\u{1F4C4} Code for *${fileName}* (File too large for text message)`
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: formattedCode }, { quoted: message });
      }
    } catch (error) {
      console.error("Inspect Error:", error);
      await sock.sendMessage(chatId, { text: "\u274C Failed to read the plugin file." });
    }
  }
};
export {
  getplugin_default as default
};
