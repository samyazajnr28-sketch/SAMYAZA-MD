var joingroup_default = {
  command: "joingroup",
  aliases: ["join", "gcjoin", "groupinfo"],
  category: "owner",
  description: "Join a group via invite link or get group info from link",
  usage: ".joingroup <link or code>\n.groupinfo <link or code>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const rawText = (context.rawText || "").toLowerCase();
    const isInfo = rawText.startsWith(".groupinfo");
    const input = args[0];
    if (!input) {
      return await sock.sendMessage(chatId, {
        text: `*${isInfo ? "\u{1F50D} GROUP INFO" : "\u{1F6AA} JOIN GROUP"}*

*Usage:*
\u2022 \`.joingroup https://chat.whatsapp.com/XXXX\`
\u2022 \`.joingroup XXXX\` (code only)
\u2022 \`.groupinfo https://chat.whatsapp.com/XXXX\` \u2014 get info without joining`,
        ...channelInfo
      }, { quoted: message });
    }
    const code = input.replace("https://chat.whatsapp.com/", "").trim();
    try {
      if (isInfo) {
        const info = await sock.groupGetInviteInfo(code);
        const members = info.participants?.length || 0;
        return await sock.sendMessage(chatId, {
          text: `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551    \u{1F50D} *GROUP INFO*       \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

*Name:* ${info.subject || "Unknown"}
*Description:* ${info.desc || "None"}
*Members:* ${members}
*Created:* ${info.creation ? new Date(info.creation * 1e3).toLocaleDateString() : "Unknown"}
*JID:* \`${info.id}\``,
          ...channelInfo
        }, { quoted: message });
      } else {
        const response = await sock.groupAcceptInvite(code);
        return await sock.sendMessage(chatId, {
          text: `\u2705 *Joined group successfully!*

JID: \`${response}\``,
          ...channelInfo
        }, { quoted: message });
      }
    } catch (e) {
      console.error("[JOINGROUP] Error:", e.message);
      await sock.sendMessage(chatId, {
        text: `\u274C Failed: ${e.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  joingroup_default as default
};
