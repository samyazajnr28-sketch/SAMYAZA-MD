var resetlink_default = {
  command: "resetlink",
  aliases: ["revoke", "newlink"],
  category: "group admin",
  description: "Reset group invite link",
  usage: ".resetlink",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    try {
      const newCode = await sock.groupRevokeInvite(chatId);
      await sock.sendMessage(chatId, {
        text: `\u2705 Group link has been successfully reset

\u{1F517} New link:
https://chat.whatsapp.com/${newCode}`,
        ...channelInfo
      }, { quoted: message });
    } catch (error) {
      console.error("Error in resetlink command:", error);
      await sock.sendMessage(chatId, {
        text: "Failed to reset group link!",
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  resetlink_default as default
};
