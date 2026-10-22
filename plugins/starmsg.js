var starmsg_default = {
  command: "star",
  aliases: ["starmsg", "unstar", "unstarmsg"],
  category: "owner",
  description: "Star or unstar a replied message",
  usage: ".star \u2014 reply to a message | .unstar \u2014 reply to a message",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const rawText = (context.rawText || "").toLowerCase();
    const shouldStar = !rawText.startsWith(".unstar");
    const msg = message.message;
    const contextInfo = msg?.extendedTextMessage?.contextInfo || msg?.imageMessage?.contextInfo || msg?.videoMessage?.contextInfo || msg?.audioMessage?.contextInfo || msg?.documentMessage?.contextInfo || msg?.stickerMessage?.contextInfo || msg?.buttonsResponseMessage?.contextInfo || null;
    if (!contextInfo?.stanzaId) {
      return await sock.sendMessage(chatId, {
        text: `*\u2B50 STAR MESSAGE*

_Reply to any message with:_
\u2022 \`.star\` \u2014 to star it
\u2022 \`.unstar\` \u2014 to unstar it`,
        ...channelInfo
      }, { quoted: message });
    }
    const targetId = contextInfo.stanzaId;
    const botNum = (sock.user?.id || "").split(":")[0].split("@")[0];
    const participantNum = (contextInfo.participant || "").split(":")[0].split("@")[0];
    const fromMe = participantNum ? participantNum === botNum : message.key.fromMe;
    try {
      await sock.chatModify(
        {
          star: {
            messages: [{ id: targetId, fromMe }],
            star: shouldStar
          }
        },
        chatId
      );
      await sock.sendMessage(chatId, {
        text: shouldStar ? `\u2B50 *Message starred!*` : `\u2734\uFE0F *Message unstarred!*`,
        ...channelInfo
      }, { quoted: message });
    } catch (e) {
      console.error("[STARMSG] Error:", e.message);
      await sock.sendMessage(chatId, {
        text: `\u274C Failed to ${shouldStar ? "star" : "unstar"} message: ${e.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  starmsg_default as default
};
