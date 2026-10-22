var pinchat_default = {
  command: "pinchat",
  aliases: ["pin", "unpin", "unpinchat"],
  category: "owner",
  description: "Pin or unpin the current chat",
  usage: ".pinchat pin | .pinchat unpin",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const rawText = (context.rawText || "").toLowerCase();
    const shouldPin = !rawText.startsWith(".unpin");
    try {
      await sock.chatModify({ pin: shouldPin }, chatId);
      await sock.sendMessage(chatId, {
        text: shouldPin ? `\u{1F4CC} *Chat pinned!*` : `\u{1F4CC} *Chat unpinned!*`,
        ...channelInfo
      }, { quoted: message });
    } catch (e) {
      console.error("[PINCHAT] Error:", e.message);
      await sock.sendMessage(chatId, {
        text: `\u274C Failed to ${shouldPin ? "pin" : "unpin"} chat: ${e.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  pinchat_default as default
};
