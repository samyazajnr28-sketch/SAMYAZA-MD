var setgdesc_default = {
  command: "setgdesc",
  aliases: ["setdesc", "groupdesc"],
  category: "group admin",
  description: "Change group description",
  usage: ".setgdesc <new description>",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const desc = args.join(" ").trim();
    if (!desc) {
      await sock.sendMessage(chatId, {
        text: "\u274C *Please provide a description*\n\nUsage: `.setgdesc <description>`"
      }, { quoted: message });
      return;
    }
    try {
      await sock.groupUpdateDescription(chatId, desc);
      await sock.sendMessage(chatId, {
        text: "\u2705 *Group description updated successfully!*"
      }, { quoted: message });
    } catch (error) {
      console.error("Error updating group description:", error);
      await sock.sendMessage(chatId, {
        text: "\u274C *Failed to update group description*\n\nMake sure the bot is an admin."
      }, { quoted: message });
    }
  }
};
export {
  setgdesc_default as default
};
