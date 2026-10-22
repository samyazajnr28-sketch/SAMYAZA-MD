import store from "../lib/lightweight_store.js";
import isOwnerOrSudo from "../lib/isOwner.js";
import isAdmin from "../lib/isAdmin.js";
async function setAntilink(chatId, type, action) {
  try {
    await store.saveSetting(chatId, "antilink", {
      enabled: true,
      action,
      type
    });
    return true;
  } catch (error) {
    console.error("Error setting antilink:", error);
    return false;
  }
}
async function getAntilink(chatId, _type) {
  try {
    const settings = await store.getSetting(chatId, "antilink");
    return settings || null;
  } catch (error) {
    console.error("Error getting antilink:", error);
    return null;
  }
}
async function removeAntilink(chatId, _type) {
  try {
    await store.saveSetting(chatId, "antilink", {
      enabled: false,
      action: null,
      type: null
    });
    return true;
  } catch (error) {
    console.error("Error removing antilink:", error);
    return false;
  }
}
async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
  try {
    const config = await getAntilink(chatId, "on");
    if (!config?.enabled) return;
    const isOwnerSudo = await isOwnerOrSudo(senderId, sock, chatId);
    if (isOwnerSudo) return;
    try {
      const { isSenderAdmin } = await isAdmin(sock, chatId, senderId);
      if (isSenderAdmin) return;
    } catch (e) {
    }
    const action = config.action || "delete";
    let shouldAct = false;
    let linkType = "";
    const linkPatterns = {
      whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
      whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
      telegram: /t\.me\/[A-Za-z0-9_]+/i,
      allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i
    };
    if (linkPatterns.whatsappGroup.test(userMessage)) {
      shouldAct = true;
      linkType = "WhatsApp Group";
    } else if (linkPatterns.whatsappChannel.test(userMessage)) {
      shouldAct = true;
      linkType = "WhatsApp Channel";
    } else if (linkPatterns.telegram.test(userMessage)) {
      shouldAct = true;
      linkType = "Telegram";
    } else if (linkPatterns.allLinks.test(userMessage)) {
      shouldAct = true;
      linkType = "Link";
    }
    if (!shouldAct) return;
    const messageId = message.key.id;
    const participant = message.key.participant || senderId;
    if (action === "delete" || action === "kick") {
      try {
        await sock.sendMessage(chatId, {
          delete: {
            remoteJid: chatId,
            fromMe: false,
            id: messageId,
            participant
          }
        });
      } catch (error) {
        console.error("Failed to delete message:", error);
      }
    }
    if (action === "warn" || action === "delete") {
      await sock.sendMessage(chatId, {
        text: `\u26A0\uFE0F *Antilink Warning*

@${senderId.split("@")[0]}, posting ${linkType} links is not allowed!`,
        mentions: [senderId]
      });
    }
    if (action === "kick") {
      try {
        await sock.groupParticipantsUpdate(chatId, [senderId], "remove");
        await sock.sendMessage(chatId, {
          text: `\u{1F6AB} @${senderId.split("@")[0]} has been removed for posting ${linkType} links.`,
          mentions: [senderId]
        });
      } catch (error) {
        console.error("Failed to kick user:", error);
        await sock.sendMessage(chatId, {
          text: `\u26A0\uFE0F Failed to remove user. Make sure Samyaza is an admin.`
        });
      }
    }
  } catch (error) {
    console.error("Error in link detection:", error);
  }
}
var antilink_default = {
  command: "antilink",
  aliases: ["alink", "linkblock"],
  category: "group admin",
  description: "Prevent users from sending links in the group",
  usage: ".antilink <on|off|set>",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const action = args[0]?.toLowerCase();
    if (!action) {
      const config = await getAntilink(chatId, "on");
      await sock.sendMessage(chatId, {
        text: `*\u{1F517} ANTILINK SETUP*

*Current Status:* ${config?.enabled ? "\u2705 Enabled" : "\u274C Disabled"}
*Current Action:* ${config?.action || "Not set"}

*Commands:*
\u2022 \`.antilink on\` - Enable antilink
\u2022 \`.antilink off\` - Disable antilink
\u2022 \`.antilink set delete\` - Delete link messages
\u2022 \`.antilink set kick\` - Kick users who send links
\u2022 \`.antilink set warn\` - Warn users only

*Protected Links:*
\u2022 WhatsApp Groups
\u2022 WhatsApp Channels
\u2022 Telegram
\u2022 All other links

*Note:* Admins, Owner, and Sudo users are exempt.`
      }, { quoted: message });
      return;
    }
    switch (action) {
      case "on":
        const existingConfig = await getAntilink(chatId, "on");
        if (existingConfig?.enabled) {
          await sock.sendMessage(chatId, {
            text: "\u26A0\uFE0F *Antilink is already enabled*"
          }, { quoted: message });
          return;
        }
        const result = await setAntilink(chatId, "on", "delete");
        await sock.sendMessage(chatId, {
          text: result ? "\u2705 *Antilink enabled successfully!*\n\nDefault action: Delete messages\n\n*Exempt:* Admins, Owner, Sudo users" : "\u274C *Failed to enable antilink*"
        }, { quoted: message });
        break;
      case "off":
        await removeAntilink(chatId, "on");
        await sock.sendMessage(chatId, {
          text: "\u274C *Antilink disabled*\n\nUsers can now send links freely."
        }, { quoted: message });
        break;
      case "set":
        if (args.length < 2) {
          await sock.sendMessage(chatId, {
            text: "\u274C *Please specify an action*\n\nUsage: `.antilink set delete | kick | warn`"
          }, { quoted: message });
          return;
        }
        const setAction = args[1].toLowerCase();
        if (!["delete", "kick", "warn"].includes(setAction)) {
          await sock.sendMessage(chatId, {
            text: "\u274C *Invalid action*\n\nChoose: delete, kick, or warn"
          }, { quoted: message });
          return;
        }
        const setResult = await setAntilink(chatId, "on", setAction);
        const actionDescriptions = {
          delete: "Delete link messages and warn users",
          kick: "Delete messages and remove users",
          warn: "Only send warning messages"
        };
        await sock.sendMessage(chatId, {
          text: setResult ? `\u2705 *Antilink action set to: ${setAction}*

${actionDescriptions[setAction]}

*Exempt:* Admins, Owner, Sudo users` : "\u274C *Failed to set antilink action*"
        }, { quoted: message });
        break;
      case "status":
      case "get":
        const status = await getAntilink(chatId, "on");
        await sock.sendMessage(chatId, {
          text: `*\u{1F517} ANTILINK STATUS*

*Status:* ${status?.enabled ? "\u2705 Enabled" : "\u274C Disabled"}
*Action:* ${status?.action || "Not set"}

*What happens when links are detected:*
${status?.action === "delete" ? "\u2022 Message is deleted\n\u2022 User gets warning" : ""}${status?.action === "kick" ? "\u2022 Message is deleted\n\u2022 User is removed from group" : ""}${status?.action === "warn" ? "\u2022 User gets warning\n\u2022 Message stays" : ""}

*Exempt:* Admins, Owner, Sudo users`
        }, { quoted: message });
        break;
      default:
        await sock.sendMessage(chatId, {
          text: "\u274C *Invalid command*\n\nUse `.antilink` to see available options."
        }, { quoted: message });
    }
  },
  handleLinkDetection,
  setAntilink,
  getAntilink,
  removeAntilink
};
export {
  antilink_default as default,
  handleLinkDetection
};
