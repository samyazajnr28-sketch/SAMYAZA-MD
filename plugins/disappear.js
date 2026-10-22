import isAdmin from "../lib/isAdmin.js";
var disappear_default = {
  command: "disappear",
  aliases: ["ephemeral", "disappearing", "vanish"],
  category: "group admin",
  description: "Enable or disable disappearing messages in chat",
  usage: ".disappear off | .disappear 24h | .disappear 7d | .disappear 90d",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const isGroup = chatId.endsWith("@g.us");
    const senderId = context.senderId || message.key.participant || message.key.remoteJid;
    const senderIsOwnerOrSudo = context.senderIsOwnerOrSudo || false;
    if (isGroup && !senderIsOwnerOrSudo) {
      const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
      if (!isSenderAdmin) {
        return await sock.sendMessage(chatId, {
          text: "\u274C Only group admins or bot owner can change disappearing messages.",
          ...channelInfo
        }, { quoted: message });
      }
    }
    if (!isGroup && !senderIsOwnerOrSudo && !message.key.fromMe) {
      return await sock.sendMessage(chatId, {
        text: "\u274C Only the bot owner can change disappearing messages in DMs.",
        ...channelInfo
      }, { quoted: message });
    }
    const input = args[0]?.toLowerCase();
    if (!input) {
      return await sock.sendMessage(chatId, {
        text: `*\u23F3 DISAPPEARING MESSAGES*

*Usage:*
\u2022 \`.disappear off\` \u2014 Disable
\u2022 \`.disappear 24h\` \u2014 24 hours
\u2022 \`.disappear 7d\` \u2014 7 days (default)
\u2022 \`.disappear 90d\` \u2014 90 days`,
        ...channelInfo
      }, { quoted: message });
    }
    const durations = {
      "off": false,
      "0": false,
      "24h": 86400,
      "1d": 86400,
      "7d": 604800,
      "1w": 604800,
      "90d": 7776e3,
      "3m": 7776e3
    };
    if (!(input in durations)) {
      return await sock.sendMessage(chatId, {
        text: `\u274C Invalid option: *${input}*

Choose: \`off\`, \`24h\`, \`7d\`, \`90d\``,
        ...channelInfo
      }, { quoted: message });
    }
    const seconds = durations[input];
    try {
      await sock.sendMessage(chatId, {
        disappearingMessagesInChat: seconds === false ? false : seconds
      });
      const labels = {
        "off": "\u274C Disappearing messages *disabled*",
        "0": "\u274C Disappearing messages *disabled*",
        "24h": "\u23F3 Disappearing messages set to *24 hours*",
        "1d": "\u23F3 Disappearing messages set to *24 hours*",
        "7d": "\u23F3 Disappearing messages set to *7 days*",
        "1w": "\u23F3 Disappearing messages set to *7 days*",
        "90d": "\u23F3 Disappearing messages set to *90 days*",
        "3m": "\u23F3 Disappearing messages set to *90 days*"
      };
      await sock.sendMessage(chatId, {
        text: labels[input],
        ...channelInfo
      }, { quoted: message });
    } catch (e) {
      console.error("[DISAPPEAR] Error:", e.message);
      await sock.sendMessage(chatId, {
        text: `\u274C Failed to change disappearing messages: ${e.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  disappear_default as default
};
