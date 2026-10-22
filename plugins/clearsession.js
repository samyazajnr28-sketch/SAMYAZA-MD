import fs from "fs";
import path from "path";
import isOwnerOrSudo from "../lib/isOwner.js";
import { channelInfo } from "../lib/messageConfig.js";
var clearsession_default = {
  command: "clearsession",
  aliases: ["clearses", "csession"],
  category: "owner",
  description: "Clear session files",
  usage: ".clearsession",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const senderId = message.key.participant || message.key.remoteJid;
      const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
      if (!message.key.fromMe && !isOwner) {
        return await sock.sendMessage(chatId, { text: "*This command can only be used by the owner!*", ...channelInfo });
      }
      const sessionDir = path.join(process.cwd(), "session");
      if (!fs.existsSync(sessionDir)) {
        return await sock.sendMessage(chatId, { text: "*Session directory not found!*", ...channelInfo });
      }
      let filesCleared = 0;
      let errors = 0;
      const errorDetails = [];
      await sock.sendMessage(chatId, { text: "\u{1F50D} Optimizing session files for better performance...", ...channelInfo });
      const files = fs.readdirSync(sessionDir);
      let appStateSyncCount = 0;
      let preKeyCount = 0;
      for (const file of files) {
        if (file.startsWith("app-state-sync-")) appStateSyncCount++;
        if (file.startsWith("pre-key-")) preKeyCount++;
      }
      for (const file of files) {
        if (file === "creds.json") continue;
        if (file.startsWith("app-state-sync-key-")) continue;
        try {
          fs.unlinkSync(path.join(sessionDir, file));
          filesCleared++;
        } catch (err) {
          errors++;
          errorDetails.push(`Failed to delete ${file}: ${err.message}`);
        }
      }
      const msgText = `\u2705 Session files cleared successfully!

\u{1F4CA} Statistics:
\u2022 Total files cleared: ${filesCleared}
\u2022 App state sync files: ${appStateSyncCount}
\u2022 Pre-key files: ${preKeyCount}
` + (errors > 0 ? `
\u26A0\uFE0F Errors encountered: ${errors}
${errorDetails.join("\n")}` : "");
      await sock.sendMessage(chatId, { text: msgText, ...channelInfo });
    } catch {
      await sock.sendMessage(chatId, { text: "\u274C Failed to clear session files!", ...channelInfo });
    }
  }
};
export {
  clearsession_default as default
};
