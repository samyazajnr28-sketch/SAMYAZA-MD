var invitelink_default = {
  command: "invitelink",
  aliases: ["invite", "grouplink", "gclink", "revokeinvite", "resetlink"],
  category: "group",
  description: "Get or revoke the group invite link",
  usage: ".invitelink \u2014 get link\n.revokeinvite \u2014 reset link",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const rawText = (context.rawText || "").toLowerCase();
    const isBotAdmin = context.isBotAdmin || false;
    const isRevoke = rawText.startsWith(".revokeinvite") || rawText.startsWith(".resetlink") || args[0]?.toLowerCase() === "revoke";
    if (isRevoke && !isBotAdmin) {
      return await sock.sendMessage(chatId, {
        text: `\u274C Bot needs to be an admin to revoke the invite link.`,
        ...channelInfo
      }, { quoted: message });
    }
    try {
      if (isRevoke) {
        const newCode = await sock.groupRevokeInvite(chatId);
        return await sock.sendMessage(chatId, {
          text: `\u{1F504} *Invite link reset!*

*New Link:*
https://chat.whatsapp.com/${newCode}`,
          ...channelInfo
        }, { quoted: message });
      } else {
        const code = await sock.groupInviteCode(chatId);
        return await sock.sendMessage(chatId, {
          text: `\u{1F517} *Group Invite Link*

https://chat.whatsapp.com/${code}

_Use \`.revokeinvite\` to reset this link._`,
          ...channelInfo
        }, { quoted: message });
      }
    } catch (e) {
      console.error("[INVITELINK] Error:", e.message);
      await sock.sendMessage(chatId, {
        text: `\u274C Failed: ${e.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  invitelink_default as default
};
