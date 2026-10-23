import { simpleGit } from "simple-git";
var pull_default = {
  command: "gitpull",
  aliases: ["refresh", "pull"],
  category: "owner",
  description: "Reload all plugins (Pull changes from git if available)",
  usage: ".gitpull",
  ownerOnly: true,
  async handler(sock, message) {
    const chatId = message.key.remoteJid;
    const commandHandler = (await import("../lib/commandHandler.js")).default;
    const git = simpleGit();
    const start = Date.now();
    let gitStatus = "Local reload only";
    try {
      const isRepo = await git.checkIsRepo();
      if (isRepo) {
        const remotes = await git.getRemotes(true);
        if (remotes.some((r) => r.name === "origin")) {
          await git.pull();
          gitStatus = "Pulled from git remote";
        }
      }
    } catch (err) {
      gitStatus = "Git unavailable, used local files";
    }
    try {
      commandHandler.reloadCommands();
      const end = Date.now();
      await sock.sendMessage(chatId, {
        text: `\u2705 Reload complete
\u{1F504} Mode: ${gitStatus}
\u{1F4E6} Plugins: ${commandHandler.commands.size}
\u23F1 Time: ${end - start}ms`
      });
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C Reload failed: ${error.message}`
      });
    }
  }
};
export {
  pull_default as default
};
