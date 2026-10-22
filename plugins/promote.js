async function handlePromotionEvent(sock, groupId, participants, author) {
  try {
    if (!Array.isArray(participants) || participants.length === 0) {
      return;
    }
    const promotedUsernames = await Promise.all(participants.map(async (jid) => {
      const jidString = typeof jid === "string" ? jid : jid.id || jid.toString();
      return `@${jidString.split("@")[0]} `;
    }));
    let promotedBy;
    const mentionList = participants.map((jid) => {
      return typeof jid === "string" ? jid : jid.id || jid.toString();
    });
    if (author && author.length > 0) {
      const authorJid = typeof author === "string" ? author : author.id || author.toString();
      promotedBy = `@${authorJid.split("@")[0]}`;
      mentionList.push(authorJid);
    } else {
      promotedBy = "System";
    }
    const promotionMessage = `*\u300E GROUP PROMOTION \u300F*

\u{1F465} *Promoted User${participants.length > 1 ? "s" : ""}:*
${promotedUsernames.map((name) => `\u2022 ${name}`).join("\n")}

\u{1F451} *Promoted By:* ${promotedBy}

\u{1F4C5} *Date:* ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
    await sock.sendMessage(groupId, {
      text: promotionMessage,
      mentions: mentionList
    });
  } catch (error) {
    console.error("Error handling promotion event:", error);
  }
}
var promote_default = {
  command: "promote",
  aliases: ["admin"],
  category: "group admin",
  description: "Promote user(s) to admin",
  usage: ".promote [@user] or reply to message",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    let userToPromote = [];
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentionedJids && mentionedJids.length > 0) {
      userToPromote = mentionedJids;
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      userToPromote = [message.message.extendedTextMessage.contextInfo.participant];
    }
    if (userToPromote.length === 0) {
      await sock.sendMessage(chatId, {
        text: "Please mention the user or reply to their message to promote!",
        ...channelInfo
      }, { quoted: message });
      return;
    }
    try {
      await sock.groupParticipantsUpdate(chatId, userToPromote, "promote");
      const usernames = await Promise.all(userToPromote.map(async (jid) => {
        return `@${jid.split("@")[0]}`;
      }));
      const promoterJid = sock.user.id;
      const promotionMessage = `*\u300E GROUP PROMOTION \u300F*

\u{1F465} *Promoted User${userToPromote.length > 1 ? "s" : ""}:*
${usernames.map((name) => `\u2022 ${name}`).join("\n")}

\u{1F451} *Promoted By:* @${promoterJid.split("@")[0]}

\u{1F4C5} *Date:* ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
      await sock.sendMessage(chatId, {
        text: promotionMessage,
        mentions: [...userToPromote, promoterJid],
        ...channelInfo
      });
    } catch (error) {
      console.error("Error in promote command:", error);
      await sock.sendMessage(chatId, {
        text: "Failed to promote user(s)!",
        ...channelInfo
      }, { quoted: message });
    }
  },
  handlePromotionEvent
};
export {
  promote_default as default
};
