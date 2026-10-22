import { setAntitag, getAntitag, removeAntitag } from "../lib/index.js";
async function handleTagDetection(sock, chatId, message, senderId) {
  try {
    const antitagSetting = await getAntitag(chatId, "on");
    if (!antitagSetting || !antitagSetting.enabled) return;
    const mentionedJids = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text || message.message?.imageMessage?.caption || message.message?.videoMessage?.caption || "";
    const textMentions = messageText.match(/@[\d+\s\-()~.]+/g) || [];
    const numericMentions = messageText.match(/@\d{10,}/g) || [];
    const _allMentions = [.../* @__PURE__ */ new Set([...mentionedJids, ...textMentions, ...numericMentions])];
    const uniqueNumericMentions = /* @__PURE__ */ new Set();
    numericMentions.forEach((mention) => {
      const numMatch = mention.match(/@(\d+)/);
      if (numMatch) uniqueNumericMentions.add(numMatch[1]);
    });
    const mentionedJidCount = mentionedJids.length;
    const numericMentionCount = uniqueNumericMentions.size;
    const totalMentions = Math.max(mentionedJidCount, numericMentionCount);
    if (totalMentions >= 3) {
      const groupMetadata = await sock.groupMetadata(chatId);
      const participants = groupMetadata.participants || [];
      const mentionThreshold = Math.ceil(participants.length * 0.5);
      const hasManyNumericMentions = numericMentionCount >= 10 || numericMentionCount >= 5 && numericMentionCount >= mentionThreshold;
      if (totalMentions >= mentionThreshold || hasManyNumericMentions) {
        const action = antitagSetting.action || "delete";
        if (action === "delete") {
          await sock.sendMessage(chatId, {
            delete: {
              remoteJid: chatId,
              fromMe: false,
              id: message.key.id,
              participant: senderId
            }
          });
          await sock.sendMessage(chatId, {
            text: `\u26A0\uFE0F *Tagall Detected!*

@${senderId.split("@")[0]}, tagging all members is not allowed.`,
            mentions: [senderId]
          });
        } else if (action === "kick") {
          await sock.sendMessage(chatId, {
            delete: {
              remoteJid: chatId,
              fromMe: false,
              id: message.key.id,
              participant: senderId
            }
          });
          try {
            await sock.groupParticipantsUpdate(chatId, [senderId], "remove");
            await sock.sendMessage(chatId, {
              text: `\u{1F6AB} *Antitag Action!*

@${senderId.split("@")[0]} has been removed for tagging all members.`,
              mentions: [senderId]
            });
          } catch (error) {
            await sock.sendMessage(chatId, {
              text: `\u26A0\uFE0F Failed to remove user. Make sure the bot is an admin.`
            });
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in tag detection:", error);
  }
}
var antitag_default = {
  command: "antitag",
  aliases: ["at", "tagblock"],
  category: "group admin",
  description: "Prevent users from tagging all members",
  usage: ".antitag <on|off|set>",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const action = args[0]?.toLowerCase();
    if (!action) {
      const config = await getAntitag(chatId, "on");
      await sock.sendMessage(chatId, {
        text: `*\u{1F3F7}\uFE0F ANTITAG SETUP*

*Current Status:* ${config?.enabled ? "\u2705 Enabled" : "\u274C Disabled"}
*Current Action:* ${config?.action || "Not set"}

*Commands:*
\u2022 \`.antitag on\` - Enable
\u2022 \`.antitag off\` - Disable
\u2022 \`.antitag set delete\` - Delete tagall messages
\u2022 \`.antitag set kick\` - Kick users who tagall

*Detection:*
\u2022 Detects mentions of 50%+ members
\u2022 Catches bot tagall patterns
\u2022 Protects against spam tagging`
      }, { quoted: message });
      return;
    }
    switch (action) {
      case "on":
        const existingConfig = await getAntitag(chatId, "on");
        if (existingConfig?.enabled) {
          await sock.sendMessage(chatId, {
            text: "\u26A0\uFE0F *Antitag is already enabled*"
          }, { quoted: message });
          return;
        }
        const result = await setAntitag(chatId, "on", "delete");
        await sock.sendMessage(chatId, {
          text: result ? "\u2705 *Antitag enabled successfully!*\n\nDefault action: Delete tagall messages" : "\u274C *Failed to enable antitag*"
        }, { quoted: message });
        break;
      case "off":
        await removeAntitag(chatId, "on");
        await sock.sendMessage(chatId, {
          text: "\u274C *Antitag disabled*\n\nUsers can now tag all members."
        }, { quoted: message });
        break;
      case "set":
        if (args.length < 2) {
          await sock.sendMessage(chatId, {
            text: "\u274C *Please specify an action*\n\nUsage: `.antitag set delete | kick`"
          }, { quoted: message });
          return;
        }
        const setAction = args[1].toLowerCase();
        if (!["delete", "kick"].includes(setAction)) {
          await sock.sendMessage(chatId, {
            text: "\u274C *Invalid action*\n\nChoose: delete or kick"
          }, { quoted: message });
          return;
        }
        const setResult = await setAntitag(chatId, "on", setAction);
        const actionDescriptions = {
          delete: "Delete tagall messages and warn users",
          kick: "Delete messages and remove users from group"
        };
        await sock.sendMessage(chatId, {
          text: setResult ? `\u2705 *Antitag action set to: ${setAction}*

${actionDescriptions[setAction]}` : "\u274C *Failed to set antitag action*"
        }, { quoted: message });
        break;
      case "status":
      case "get":
        const status = await getAntitag(chatId, "on");
        await sock.sendMessage(chatId, {
          text: `*\u{1F3F7}\uFE0F ANTITAG STATUS*

*Status:* ${status?.enabled ? "\u2705 Enabled" : "\u274C Disabled"}
*Action:* ${status?.action || "Not set"}

*What happens when tagall is detected:*
${status?.action === "delete" ? "\u2022 Message is deleted\n\u2022 User gets warning" : ""}${status?.action === "kick" ? "\u2022 Message is deleted\n\u2022 User is removed from group" : ""}

*Detection threshold:* 50% of group members or 10+ mentions`
        }, { quoted: message });
        break;
      default:
        await sock.sendMessage(chatId, {
          text: "\u274C *Invalid command*\n\nUse `.antitag` to see available options."
        }, { quoted: message });
    }
  },
  handleTagDetection
};
export {
  antitag_default as default,
  handleTagDetection
};
