async function handleDemotionEvent(sock, groupId, participants, author) {
  try {
    if (!Array.isArray(participants) || participants.length === 0) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    const demotedUsernames = await Promise.all(participants.map(async (jid) => {
      const jidString = typeof jid === "string" ? jid : jid.id || jid.toString();
      return `@${jidString.split("@")[0]}`;
    }));
    let demotedBy;
    const mentionList = participants.map((jid) => {
      return typeof jid === "string" ? jid : jid.id || jid.toString();
    });
    if (author && author.length > 0) {
      const authorJid = typeof author === "string" ? author : author.id || author.toString();
      demotedBy = `@${authorJid.split("@")[0]}`;
      mentionList.push(authorJid);
    } else {
      demotedBy = "System";
    }
    await new Promise((resolve) => setTimeout(resolve, 1e3));
    const demotionMessage = `*\u300E GROUP DEMOTION \u300F*

\u{1F464} *Demoted User${participants.length > 1 ? "s" : ""}:*
${demotedUsernames.map((name) => `\u2022 ${name}`).join("\n")}

\u{1F451} *Demoted By:* ${demotedBy}

\u{1F4C5} *Date:* ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
    await sock.sendMessage(groupId, {
      text: demotionMessage,
      mentions: mentionList
    });
  } catch (error) {
    console.error("Error handling demotion event:", error);
    if (error.data === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2e3));
    }
  }
}
var demote_default = {
  command: "demote",
  aliases: ["dmt", "removeadmin"],
  category: "group admin",
  description: "Demote user(s) from admin to member",
  usage: ".demote @user or reply to message",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const isBotAdmin = context.isBotAdmin;
    if (!isBotAdmin) {
      await sock.sendMessage(chatId, {
        text: "\u274C *Please make the bot an admin first*"
      }, { quoted: message });
      return;
    }
    let userToDemote = [];
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentionedJids && mentionedJids.length > 0) {
      userToDemote = mentionedJids;
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      userToDemote = [message.message.extendedTextMessage.contextInfo.participant];
    }
    if (userToDemote.length === 0) {
      await sock.sendMessage(chatId, {
        text: "\u274C *Please mention a user or reply to their message*\n\nUsage: `.demote @user` or reply with `.demote`"
      }, { quoted: message });
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      await sock.groupParticipantsUpdate(chatId, userToDemote, "demote");
      const usernames = await Promise.all(userToDemote.map(async (jid) => {
        return `@${jid.split("@")[0]}`;
      }));
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      const demotionMessage = `*\u300E GROUP DEMOTION \u300F*

\u{1F464} *Demoted User${userToDemote.length > 1 ? "s" : ""}:*
${usernames.map((name) => `\u2022 ${name}`).join("\n")}

\u{1F451} *Demoted By:* @${message.key.participant ? message.key.participant.split("@")[0] : message.key.remoteJid.split("@")[0]}

\u{1F4C5} *Date:* ${(/* @__PURE__ */ new Date()).toLocaleString()}`;
      await sock.sendMessage(chatId, {
        text: demotionMessage,
        mentions: [...userToDemote, message.key.participant || message.key.remoteJid]
      }, { quoted: message });
    } catch (error) {
      console.error("Error in demote command:", error);
      if (error.data === 429) {
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        try {
          await sock.sendMessage(chatId, {
            text: "\u274C *Rate limit reached*\n\nPlease try again in a few seconds."
          }, { quoted: message });
        } catch (retryError) {
          console.error("Error sending retry message:", retryError);
        }
      } else {
        try {
          await sock.sendMessage(chatId, {
            text: "\u274C *Failed to demote user(s)*\n\nMake sure the bot has sufficient permissions."
          }, { quoted: message });
        } catch (sendError) {
          console.error("Error sending error message:", sendError);
        }
      }
    }
  },
  handleDemotionEvent
};
export {
  demote_default as default
};
