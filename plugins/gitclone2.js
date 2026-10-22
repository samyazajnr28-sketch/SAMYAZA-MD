import axios from "axios";
var gitclone2_default = {
  command: "gitclone2",
  aliases: ["githubdl2", "clone2"],
  category: "download",
  description: "Download a GitHub repository as a ZIP file",
  usage: ".gitclone2 <github-link>",
  async handler(sock, message, args, context) {
    const { chatId } = context;
    const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;
    try {
      const link = args[0];
      if (!link) {
        return await sock.sendMessage(chatId, {
          text: `\u274C *Missing Link!*

Example: .gitclone2 https://github.com/GlobalTechInfo/MEGA-MD`
        }, { quoted: message });
      }
      if (!regex.test(link)) {
        return await sock.sendMessage(chatId, { text: "\u26A0\uFE0F *Invalid GitHub link!*" }, { quoted: message });
      }
      let [_, user, repo] = link.match(regex) || [];
      repo = repo.replace(/.git$/, "");
      const url = `https://api.github.com/repos/${user}/${repo}/zipball`;
      const { default: _axios } = await import("axios");
      const _response = _axios.head;
      const headRes = await axios.head(url);
      const contentDisposition = headRes.headers["content-disposition"];
      let filename = `${repo}.zip`;
      if (contentDisposition) {
        const match = contentDisposition.match(/attachment; filename=(.*)/);
        if (match) filename = match[1];
      }
      await sock.sendMessage(chatId, { text: `\u2733\uFE0F *Wait, sending repository...*` }, { quoted: message });
      await sock.sendMessage(chatId, {
        document: { url },
        fileName: filename,
        mimetype: "application/zip",
        caption: `\u{1F4E6} *Repository:* ${user}/${repo}
\u2728 *Cloned by MEGA-MD*`
      }, { quoted: message });
    } catch (err) {
      console.error("Gitclone Error:", err);
      await sock.sendMessage(chatId, { text: "\u274C *Failed to download the repository.* Make sure it is public." }, { quoted: message });
    }
  }
};
export {
  gitclone2_default as default
};
