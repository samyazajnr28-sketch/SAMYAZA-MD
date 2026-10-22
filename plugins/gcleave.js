var gcleave_default = {
  command: "gcleave",
  aliases: ["leavegroup", "groupleave", "leavegc"],
  category: "owner",
  description: "Make the bot leave a group",
  usage: ".groupleave \u2014 leave current group\n.groupleave <jid> \u2014 leave specific group",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const targetJid = args[0]?.includes("@g.us") ? args[0] : chatId;
    if (!targetJid.endsWith("@g.us")) {
      return await sock.sendMessage(chatId, {
        text: `\u274C This command only works in groups.

To leave a specific group: \`.groupleave 1234567890-1234567890@g.us\``,
        ...channelInfo
      }, { quoted: message });
    }
    try {
      await sock.sendMessage(targetJid, {
        text: `\u{1F44B} *Bot is leaving the group.*

_Goodbye everyone!_`,
        ...channelInfo
      });
      await new Promise((r) => setTimeout(r, 500));
      await sock.groupLeave(targetJid);
      if (targetJid !== chatId) {
        await sock.sendMessage(chatId, {
          text: `\u2705 Left group: \`${targetJid}\``,
          ...channelInfo
        }, { quoted: message });
      }
    } catch (e) {
      console.error("[GROUPLEAVE] Error:", e.message);
      await sock.sendMessage(chatId, {
        text: `\u274C Failed to leave group: ${e.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  gcleave_default as default
};
