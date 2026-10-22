var broadcastdm_default = {
  command: "broadcastdm",
  aliases: ["bcdm", "announcedm", "dmall"],
  category: "owner",
  description: "Broadcast a message to all saved DM contacts",
  usage: ".broadcastdm <message>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const text = args.join(" ").trim();
    if (!text) {
      return await sock.sendMessage(chatId, {
        text: `*\u{1F4E9} BROADCAST DM*

*Usage:* .broadcastdm <message>

*Example:*
.broadcastdm Hey! Check out our new features!

_Sends to all contacts in the bot's contact list. Has a 1.5s delay between each to avoid ban._`,
        ...channelInfo
      }, { quoted: message });
    }
    let contacts = [];
    try {
      const allContacts = Object.keys(sock.store?.contacts || {});
      contacts = allContacts.filter(
        (jid) => jid.endsWith("@s.whatsapp.net") && jid !== sock.user?.id
      );
    } catch (e) {
      console.error("[BROADCASTDM] Error getting contacts:", e.message);
    }
    if (contacts.length === 0) {
      return await sock.sendMessage(chatId, {
        text: "\u274C No contacts found in the bot's contact list.",
        ...channelInfo
      }, { quoted: message });
    }
    await sock.sendMessage(chatId, {
      text: `\u{1F4E9} *Broadcasting to ${contacts.length} contact(s)...*

This may take a moment.`,
      ...channelInfo
    }, { quoted: message });
    const broadcastText = `\u{1F4E9} *MESSAGE*

${text}`;
    let sent = 0;
    let failed = 0;
    for (const contactJid of contacts) {
      try {
        await sock.sendMessage(contactJid, {
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
        console.error(`[BROADCASTDM] Failed to send to ${contactJid}: ${e.message}`);
        failed++;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    await sock.sendMessage(chatId, {
      text: `\u2705 *DM Broadcast Complete!*

\u{1F4E4} Sent: ${sent}
\u274C Failed: ${failed}
\u{1F4CA} Total: ${contacts.length}`,
      ...channelInfo
    }, { quoted: message });
  }
};
export {
  broadcastdm_default as default
};
