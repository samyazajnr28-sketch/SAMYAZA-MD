var gcadd_default = {
  command: "add",
  aliases: ["invite", "gcadd", "addgc"],
  category: "group admin",
  description: "Add a user to the group",
  usage: ".add <number> or reply to vcard/message",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    let targetNumber = null;
    if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
      const quotedParticipant = message.message.extendedTextMessage.contextInfo.participant;
      if (quotedMsg.contactMessage) {
        const vcard = quotedMsg.contactMessage.vcard;
        const phoneMatch = vcard.match(/waid=(\d+)/);
        if (phoneMatch) {
          targetNumber = phoneMatch[1];
        } else {
          const telMatch = vcard.match(/TEL.*?:(\+?\d+)/);
          if (telMatch) {
            targetNumber = telMatch[1].replace(/\D/g, "");
          }
        }
      } else if (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text) {
        const text = quotedMsg.conversation || quotedMsg.extendedTextMessage.text;
        const numberMatch = text.match(/(\+?\d{10,15})/);
        if (numberMatch) {
          targetNumber = numberMatch[1].replace(/\D/g, "");
        }
      } else if (quotedParticipant) {
        targetNumber = quotedParticipant.split("@")[0];
      }
    }
    if (!targetNumber && args.length > 0) {
      const input = args.join(" ");
      const cleaned = input.replace(/[^\d+]/g, "");
      targetNumber = cleaned.replace(/^\+/, "");
    }
    if (!targetNumber) {
      return await sock.sendMessage(chatId, {
        text: `\u274C *Please provide a number to add!*

*Usage:*
\u2022 \`.add 923051234567\`
\u2022 \`.add +923051234567\`
\u2022 \`.add 92 305 1234567\`
\u2022 Reply to a vcard with \`.add\`
\u2022 Reply to a message with \`.add\``,
        ...channelInfo
      }, { quoted: message });
    }
    if (!targetNumber.startsWith("1") && !targetNumber.startsWith("2") && !targetNumber.startsWith("3") && !targetNumber.startsWith("4") && !targetNumber.startsWith("5") && !targetNumber.startsWith("6") && !targetNumber.startsWith("7") && !targetNumber.startsWith("8") && !targetNumber.startsWith("9")) {
      return await sock.sendMessage(chatId, {
        text: "\u274C *Invalid number format!*\n\nPlease include the country code.\nExample: 923051234567",
        ...channelInfo
      }, { quoted: message });
    }
    const targetJid = `${targetNumber}@s.whatsapp.net`;
    try {
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants.map((p) => p.id);
      if (participants.includes(targetJid)) {
        return await sock.sendMessage(chatId, {
          text: `\u26A0\uFE0F *User is already in the group!*

${targetNumber}`,
          ...channelInfo
        }, { quoted: message });
      }
      const result = await sock.groupParticipantsUpdate(
        chatId,
        [targetJid],
        "add"
      );
      if (result[0].status === "200") {
        await sock.sendMessage(chatId, {
          text: `\u2705 *Successfully added!*

@${targetNumber}`,
          mentions: [targetJid],
          ...channelInfo
        }, { quoted: message });
      } else if (result[0].status === "403") {
        await sock.sendMessage(chatId, {
          text: `\u274C *Failed to add user!*

*Reason:* User has privacy settings that prevent being added to groups.

*Solution:* Send them the group invite link.`,
          ...channelInfo
        }, { quoted: message });
      } else if (result[0].status === "408") {
        await sock.sendMessage(chatId, {
          text: `\u26A0\uFE0F *Invite sent!*

User needs to accept the invitation to join.`,
          ...channelInfo
        }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, {
          text: `\u274C *Failed to add user!*

*Status:* ${result[0].status}

The user may have blocked the bot or changed their privacy settings.`,
          ...channelInfo
        }, { quoted: message });
      }
    } catch (error) {
      console.error("Add command error:", error);
      await sock.sendMessage(chatId, {
        text: `\u274C *Error adding user!*

${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  gcadd_default as default
};
