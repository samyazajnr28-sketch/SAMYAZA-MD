import { promises as fs } from "fs";
import path from "path";
var getfile_default = {
  command: "getfile",
  aliases: ["readfile", "viewfile"],
  category: "owner",
  description: "Read and display file contents from bot directory",
  usage: ".getfile <filename>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const filename = args.join(" ").trim();
    try {
      if (!filename) {
        return await sock.sendMessage(chatId, {
          text: `*\u{1F4C4} Get File*

*Usage:*
.getfile <filename>

*Examples:*
\u2022 .getfile index.js
\u2022 .getfile plugins/ping.js
\u2022 .getfile settings.js
\u2022 .getfile package.json`
        }, { quoted: message });
      }
      let filePath = path.join(process.cwd(), filename);
      try {
        await fs.access(filePath);
      } catch {
        const distPath = path.join(process.cwd(), "dist", filename);
        try {
          await fs.access(distPath);
          filePath = distPath;
        } catch {
        }
      }
      try {
        await fs.access(filePath);
      } catch {
        return await sock.sendMessage(chatId, {
          text: `\u274C *File not found!*

No file named "${filename}" exists.

*Tip:* Use relative path from bot root directory.`
        }, { quoted: message });
      }
      const fileContent = await fs.readFile(filePath, "utf8");
      if (!fileContent || fileContent.length === 0) {
        return await sock.sendMessage(chatId, {
          text: `\u26A0\uFE0F *File is empty*

The file "${filename}" has no content.`
        }, { quoted: message });
      }
      if (fileContent.length > 6e4) {
        return await sock.sendMessage(chatId, {
          text: `\u274C *File too large!*

The file "${filename}" is too large to display (${Math.round(fileContent.length / 1024)}KB).

*Limit:* 60KB

*Tip:* Use a file manager or split the file.`
        }, { quoted: message });
      }
      const stats = await fs.stat(filePath);
      const fileSize = (stats.size / 1024).toFixed(2);
      const lastModified = stats.mtime.toLocaleString();
      const caption = `\u{1F4C4} *File: ${filename}*

\u{1F4CA} *Size:* ${fileSize} KB
\u{1F4C5} *Modified:* ${lastModified}
\u{1F4DD} *Lines:* ${fileContent.split("\n").length}

\`\`\`${fileContent}\`\`\``;
      await sock.sendMessage(chatId, {
        text: caption
      }, { quoted: message });
    } catch (error) {
      console.error("GetFile Error:", error);
      await sock.sendMessage(chatId, {
        text: `\u274C *Error reading file*

*Error:* ${error.message}

*Possible reasons:*
\u2022 File is corrupted
\u2022 No read permissions
\u2022 Invalid file path`
      }, { quoted: message });
    }
  }
};
export {
  getfile_default as default
};
