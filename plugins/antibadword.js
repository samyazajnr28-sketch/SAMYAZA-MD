import store from "../lib/lightweight_store.js";
async function getAntibadwordSettings(chatId) {
  const settings = await store.getSetting(chatId, "antibadword");
  return settings || { enabled: false, words: [] };
}
async function saveAntibadwordSettings(chatId, settings) {
  await store.saveSetting(chatId, "antibadword", settings);
}
async function handleAntiBadwordCommand(sock, chatId, message, match) {
  const args = match.trim().toLowerCase().split(/\s+/);
  const action = args[0];
  const settings = await getAntibadwordSettings(chatId);
  if (!action || action === "status") {
    const status = settings.enabled ? "\u2705 Enabled" : "\u274C Disabled";
    const wordCount = settings.words?.length || 0;
    await sock.sendMessage(chatId, {
      text: `*Anti-Badword Status*

Status: ${status}
Blocked Words: ${wordCount}

Use:
\u2022 \`.antibadword on\` - Enable
\u2022 \`.antibadword off\` - Disable
\u2022 \`.antibadword add <word>\` - Add word
\u2022 \`.antibadword remove <word>\` - Remove word
\u2022 \`.antibadword list\` - Show all words`
    }, { quoted: message });
    return;
  }
  if (action === "on") {
    settings.enabled = true;
    await saveAntibadwordSettings(chatId, settings);
    await sock.sendMessage(chatId, {
      text: "\u2705 *Anti-Badword Enabled*\n\nMessages with blocked words will be deleted."
    }, { quoted: message });
    return;
  }
  if (action === "off") {
    settings.enabled = false;
    await saveAntibadwordSettings(chatId, settings);
    await sock.sendMessage(chatId, {
      text: "\u274C *Anti-Badword Disabled*\n\nBadword filter is now inactive."
    }, { quoted: message });
    return;
  }
  if (action === "add") {
    const word = args.slice(1).join(" ").toLowerCase().trim();
    if (!word) {
      await sock.sendMessage(chatId, {
        text: "\u274C *Please specify a word to add*\n\nExample: `.antibadword add badword`"
      }, { quoted: message });
      return;
    }
    if (!settings.words) settings.words = [];
    if (settings.words.includes(word)) {
      await sock.sendMessage(chatId, {
        text: `\u274C *Word already in list*

"${word}" is already blocked.`
      }, { quoted: message });
      return;
    }
    settings.words.push(word);
    await saveAntibadwordSettings(chatId, settings);
    await sock.sendMessage(chatId, {
      text: `\u2705 *Word Added*

Added "${word}" to blocked words list.

Total blocked words: ${settings.words.length}`
    }, { quoted: message });
    return;
  }
  if (action === "remove" || action === "delete" || action === "del") {
    const word = args.slice(1).join(" ").toLowerCase().trim();
    if (!word) {
      await sock.sendMessage(chatId, {
        text: "\u274C *Please specify a word to remove*\n\nExample: `.antibadword remove badword`"
      }, { quoted: message });
      return;
    }
    if (!settings.words || !settings.words.includes(word)) {
      await sock.sendMessage(chatId, {
        text: `\u274C *Word not found*

"${word}" is not in the blocked list.`
      }, { quoted: message });
      return;
    }
    settings.words = settings.words.filter((w) => w !== word);
    await saveAntibadwordSettings(chatId, settings);
    await sock.sendMessage(chatId, {
      text: `\u2705 *Word Removed*

Removed "${word}" from blocked words list.

Remaining blocked words: ${settings.words.length}`
    }, { quoted: message });
    return;
  }
  if (action === "list") {
    if (!settings.words || settings.words.length === 0) {
      await sock.sendMessage(chatId, {
        text: "\u{1F4DD} *Blocked Words List*\n\nNo words are currently blocked.\n\nUse `.antibadword add <word>` to add words."
      }, { quoted: message });
      return;
    }
    const wordList = settings.words.map((w, i) => `${i + 1}. ${w}`).join("\n");
    await sock.sendMessage(chatId, {
      text: `\u{1F4DD} *Blocked Words List*

${wordList}

Total: ${settings.words.length} words`
    }, { quoted: message });
    return;
  }
  await sock.sendMessage(chatId, {
    text: "\u274C *Invalid action*\n\nUse:\n\u2022 `.antibadword on/off`\n\u2022 `.antibadword add <word>`\n\u2022 `.antibadword remove <word>`\n\u2022 `.antibadword list`"
  }, { quoted: message });
}
async function checkAntiBadword(sock, message) {
  const chatId = message.key.remoteJid;
  if (!chatId.endsWith("@g.us")) return false;
  const settings = await getAntibadwordSettings(chatId);
  if (!settings.enabled || !settings.words || settings.words.length === 0) return false;
  const messageText = (message.message?.conversation || message.message?.extendedTextMessage?.text || message.message?.imageMessage?.caption || message.message?.videoMessage?.caption || "").toLowerCase();
  if (!messageText) return false;
  for (const word of settings.words) {
    if (messageText.includes(word.toLowerCase())) {
      try {
        await sock.sendMessage(chatId, { delete: message.key });
        await sock.sendMessage(chatId, {
          text: `\u274C Message deleted: Contains blocked word "${word}"`
        });
        return true;
      } catch (error) {
        console.error("Error deleting badword message:", error);
      }
      break;
    }
  }
  return false;
}
var antibadword_default = {
  command: "antibadword",
  aliases: ["abw", "badword", "antibad"],
  category: "group admin",
  description: "Configure anti-badword filter to delete messages containing inappropriate words",
  usage: ".antibadword <on|off|add|remove|list>",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const match = args.join(" ");
    try {
      await handleAntiBadwordCommand(sock, chatId, message, match);
    } catch (error) {
      console.error("Error in antibadword command:", error);
      await sock.sendMessage(chatId, {
        text: "\u274C *Error processing antibadword command*\n\nPlease try again later."
      }, { quoted: message });
    }
  }
};
export {
  checkAntiBadword,
  antibadword_default as default,
  handleAntiBadwordCommand
};
