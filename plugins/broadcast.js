var broadcast_default = {
  command: "broadcast",
  aliases: ["bc", "announce"],
  category: "owner",
  description: "Broadcast a message to all groups the bot is in",
  usage: ".broadcast <message>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const text = args.join(" ").trim();
    if (!text) {
      return await sock.sendMessage(chatId, {
        text: `*\u{1F4E2} BROADCAST*

*Usage:* .broadcast <message>

*Example:*
.broadcast Hello everyone! Bot will be down for maintenance at 10 PM.

_Sends to all groups the bot is in. Has a 1 second delay between each group to avoid ban._`,
        ...channelInfo
      }, { quoted: message });
    }
    let groups = [];
    try {
      const allChats = Object.keys(sock.store?.chats || {});
      groups = allChats.filter((jid) => jid.endsWith("@g.us"));
    } catch (e) {
      console.error("[BROADCAST] Error getting groups:", e.message);
    }
    if (groups.length === 0) {
      return await sock.sendMessage(chatId, {
        text: "\u274C No groups found. Make sure the bot is in at least one group.",
        ...channelInfo
      }, { quoted: message });
    }
    await sock.sendMessage(chatId, {
      text: `\u{1F4E2} *Broadcasting to ${groups.length} group(s)...*

This may take a moment.`,
      ...channelInfo
    }, { quoted: message });
    const broadcastText = `\u{1F4E2} *BROADCAST MESSAGE*

${text}`;
    let sent = 0;
    let failed = 0;
    for (const groupJid of groups) {
      try {
        await sock.sendMessage(groupJid, {
          text: broadcastText,
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363319098372999@newsletter",
              newsletterName: "GlobalTechInc",
              serverMessageId: -1
            }
          }
        });
        sent++;
      } catch (e) {
        console.error(`[BROADCAST] Failed to send to ${groupJid}: ${e.message}`);
        failed++;
      }
      await new Promise((r) => setTimeout(r, 1e3));
    }
    await sock.sendMessage(chatId, {
      text: `\u2705 *Broadcast Complete!*

\u{1F4E4} Sent: ${sent}
\u274C Failed: ${failed}
\u{1F4CA} Total: ${groups.length}`,
      ...channelInfo
    }, { quoted: message });
  }
};
export {
  broadcast_default as default
};
