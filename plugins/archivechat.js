var archivechat_default = {
  command: "archivechat",
  aliases: ["archive", "unarchive", "unarchivechat"],
  category: "owner",
  description: "Archive or unarchive the current chat",
  usage: ".archivechat <archive|unarchive>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const rawText = context.rawText || "";
    const isUnarchive = rawText.toLowerCase().startsWith(".unarchive");
    const action = args[0]?.toLowerCase() || (isUnarchive ? "unarchive" : "archive");
    if (!["archive", "unarchive"].includes(action)) {
      return await sock.sendMessage(chatId, {
        text: `*\u{1F4E6} ARCHIVE CHAT*

*Usage:*
\u2022 \`.archivechat archive\` \u2014 Archive this chat
\u2022 \`.archivechat unarchive\` \u2014 Unarchive this chat

_Or use aliases: \`.archive\` / \`.unarchive\`_`,
        ...channelInfo
      }, { quoted: message });
    }
    const shouldArchive = action === "archive";
    try {
      const lastMsg = message;
      await sock.chatModify(
        {
          archive: shouldArchive,
          lastMessages: [
            {
              key: lastMsg.key,
              messageTimestamp: lastMsg.messageTimestamp
            }
          ]
        },
        chatId
      );
      await sock.sendMessage(chatId, {
        text: shouldArchive ? `\u{1F4E6} *Chat archived!*` : `\u{1F4C2} *Chat unarchived!*`,
        ...channelInfo
      }, { quoted: message });
    } catch (e) {
      console.error("[ARCHIVECHAT] Error:", e.message);
      await sock.sendMessage(chatId, {
        text: `\u274C Failed to ${action} chat: ${e.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  archivechat_default as default
};
