var groupdata_default = {
  command: "gcmtdata",
  aliases: ["gcinfo", "groupinfo", "gcmetadata", "groupdata"],
  category: "group",
  description: "Get detailed info about the current group",
  usage: ".gcinfo",
  groupOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    try {
      const meta = await sock.groupMetadata(chatId);
      const admins = meta.participants.filter((p) => p.admin).map(
        (p) => `  \u2022 @${p.id.split("@")[0]}`
      ).join("\n");
      const created = meta.creation ? new Date(meta.creation * 1e3).toLocaleDateString() : "Unknown";
      const memberCount = meta.participants.length;
      const adminCount = meta.participants.filter((p) => p.admin).length;
      await sock.sendMessage(chatId, {
        text: `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551    \u{1F4CA} *GROUP INFO*       \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

*\u{1F4DB} Name:* ${meta.subject}
*\u{1F4DD} Description:*
${meta.desc || "_No description_"}

*\u{1F465} Members:* ${memberCount}
*\u{1F451} Admins:* ${adminCount}
*\u{1F4C5} Created:* ${created}
*\u{1F194} JID:* \`${meta.id}\`

*\u{1F451} Admin List:*
${admins || "_None_"}`,
        mentions: meta.participants.filter((p) => p.admin).map((p) => p.id),
        ...channelInfo
      }, { quoted: message });
    } catch (e) {
      console.error("[GROUPMETADATA] Error:", e.message);
      await sock.sendMessage(chatId, {
        text: `\u274C Failed to fetch group info: ${e.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  groupdata_default as default
};
