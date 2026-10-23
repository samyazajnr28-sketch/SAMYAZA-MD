import { simpleGit } from "simple-git";
var gitinfo_default = {
  command: "gitinfo",
  aliases: ["infogit"],
  category: "owner",
  description: "Show detailed git repository information",
  usage: ".gitinfo",
  ownerOnly: true,
  async handler(sock, message) {
    const chatId = message.key.remoteJid;
    const git = simpleGit();
    try {
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        return sock.sendMessage(chatId, { text: "\u274C This project is not a git repository." });
      }
      const status = await git.status();
      const branch = status.current || "unknown";
      const dirty = status.files.length > 0;
      const commitHash = (await git.revparse(["--short", "HEAD"])).trim();
      const ahead = status.ahead;
      const behind = status.behind;
      const modifiedCount = status.files.length;
      const remotes = await git.getRemotes(true);
      const remoteText = remotes.length ? remotes.map((r) => `\u2022 ${r.name}: ${r.refs.fetch}`).join("\n") : "None";
      const warning = dirty ? "\u26A0\uFE0F Warning: Working tree has uncommitted changes!" : "";
      const text = `\u{1F4E6} *Git Repository Info*

\u{1F33F} Branch: ${branch}
\u{1F516} Commit: ${commitHash}
\u{1F9FC} Working tree: ${dirty ? "Dirty" : "Clean"}
${dirty ? warning + "\n\n" : ""}\u{1F4CA} Ahead: ${ahead}, Behind: ${behind}
\u{1F4C1} Modified/Untracked files: ${modifiedCount}

\u{1F517} Remotes:
${remoteText}`;
      await sock.sendMessage(chatId, { text });
    } catch (err) {
      await sock.sendMessage(chatId, { text: `\u274C Git error: ${err.message}` });
    }
  }
};
export {
  gitinfo_default as default
};
