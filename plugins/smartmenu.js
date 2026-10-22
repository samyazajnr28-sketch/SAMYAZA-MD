import config from "../config.js";
import CommandHandler from "../lib/commandHandler.js";
import fs from "fs";
import path from "path";
const menuEmojis = ["\u2728", "\u{1F31F}", "\u2B50", "\u{1F4AB}", "\u{1F3AF}", "\u{1F3A8}", "\u{1F3AA}", "\u{1F3AD}"];
const activeEmojis = ["\u2705", "\u{1F7E2}", "\u{1F49A}", "\u2714\uFE0F", "\u2611\uFE0F"];
const disabledEmojis = ["\u274C", "\u{1F534}", "\u26D4", "\u{1F6AB}", "\u274E"];
const fastEmojis = ["\u26A1", "\u{1F680}", "\u{1F4A8}", "\u23F1\uFE0F", "\u{1F525}"];
const slowEmojis = ["\u{1F422}", "\u{1F40C}", "\u23F3", "\u231B", "\u{1F550}"];
const categoryEmojis = {
  general: ["\u{1F4F1}", "\u{1F527}", "\u2699\uFE0F", "\u{1F6E0}\uFE0F"],
  owner: ["\u{1F451}", "\u{1F531}", "\u{1F48E}", "\u{1F396}\uFE0F"],
  admin: ["\u{1F6E1}\uFE0F", "\u2694\uFE0F", "\u{1F510}", "\u{1F46E}"],
  group: ["\u{1F465}", "\u{1F46B}", "\u{1F9D1}\u200D\u{1F91D}\u200D\u{1F9D1}", "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}"],
  download: ["\u{1F4E5}", "\u2B07\uFE0F", "\u{1F4BE}", "\u{1F4E6}"],
  ai: ["\u{1F916}", "\u{1F9E0}", "\u{1F4AD}", "\u{1F3AF}"],
  search: ["\u{1F50D}", "\u{1F50E}", "\u{1F575}\uFE0F", "\u{1F4E1}"],
  apks: ["\u{1F4F2}", "\u{1F4E6}", "\u{1F4BF}", "\u{1F5C2}\uFE0F"],
  info: ["\u2139\uFE0F", "\u{1F4CB}", "\u{1F4CA}", "\u{1F4C4}"],
  fun: ["\u{1F3AE}", "\u{1F3B2}", "\u{1F3B0}", "\u{1F3AA}"],
  stalk: ["\u{1F440}", "\u{1F52D}", "\u{1F575}\uFE0F", "\u{1F3AF}"],
  games: ["\u{1F3AE}", "\u{1F579}\uFE0F", "\u{1F3AF}", "\u{1F3C6}"],
  images: ["\u{1F5BC}\uFE0F", "\u{1F4F8}", "\u{1F3A8}", "\u{1F304}"],
  menu: ["\u{1F4DC}", "\u{1F4CB}", "\u{1F4D1}", "\u{1F4DA}"],
  tools: ["\u{1F528}", "\u{1F527}", "\u26A1", "\u{1F6E0}\uFE0F"],
  stickers: ["\u{1F3AD}", "\u{1F600}", "\u{1F3A8}", "\u{1F5BC}\uFE0F"],
  quotes: ["\u{1F4AC}", "\u{1F4D6}", "\u270D\uFE0F", "\u{1F4AD}"],
  music: ["\u{1F3B5}", "\u{1F3B6}", "\u{1F3A7}", "\u{1F3A4}"],
  utility: ["\u{1F4C2}", "\u{1F527}", "\u2699\uFE0F", "\u{1F6E0}\uFE0F"]
};
function getRandomEmoji(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getCategoryEmoji(category) {
  const emojis = categoryEmojis[category.toLowerCase()] || ["\u{1F4C2}", "\u{1F4C1}", "\u{1F5C2}\uFE0F", "\u{1F4CB}"];
  return getRandomEmoji(emojis);
}
function formatTime() {
  const now = /* @__PURE__ */ new Date();
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: config.timeZone || "UTC"
  };
  return now.toLocaleTimeString("en-US", options);
}
var smartmenu_default = {
  command: "smenu",
  aliases: ["shelp", "smart", "help2"],
  category: "general",
  description: "Interactive smart menu with live status",
  usage: ".smenu",
  isPrefixless: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
                  const assetsDir = path.join(process.cwd(), "assets");
                  const imagePath = ["jpg", "jpeg", "png", "webp"]
                        .map((extension) => path.join(assetsDir, `menu-image.${extension}`))
                        .find((candidate) => fs.existsSync(candidate)) || path.join(assetsDir, "thumb.png");
                  const thumbnail = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;
      const categories = Array.from(CommandHandler.categories.keys());
      const stats = CommandHandler.getDiagnostics();
      const menuEmoji = getRandomEmoji(menuEmojis);
      const activeEmoji = getRandomEmoji(activeEmojis);
      const disabledEmoji = getRandomEmoji(disabledEmojis);
      const fastEmoji = getRandomEmoji(fastEmojis);
      const slowEmoji = getRandomEmoji(slowEmojis);
      let menuText = `${menuEmoji} *${config.botName || "SAMYAZA-MD"}* ${menuEmoji}

`;
      menuText += `\u250F\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2513
`;
      menuText += `\u2503 \u{1F4F1} *Bot:* ${config.botName || "SAMYAZA-MD"}
`;
      menuText += `\u2503 \u{1F516} *Version:* ${config.version || "6.0.0"}
`;
      menuText += `\u2503 \u{1F464} *Owner:* ${config.botOwner || "SAMYAZA JNR"}
`;
      menuText += `\u2503 \u23F0 *Time:* ${formatTime()}
`;
      menuText += `\u2503 \u2139\uFE0F *Prefix:* ${config.prefixes ? config.prefixes.join(", ") : "."}
`;
      menuText += `\u2503 \u{1F4CA} *Plugins:* ${CommandHandler.commands.size}
`;
      menuText += `\u2517\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u251B

`;
      const topCmds = stats.slice(0, 3).filter((s) => s.usage > 0);
      if (topCmds.length > 0) {
        menuText += `\u{1F525} *TOP COMMANDS:*
`;
        topCmds.forEach((c, i) => {
          const rank = i === 0 ? "\u{1F947}" : i === 1 ? "\u{1F948}" : "\u{1F949}";
          menuText += `${rank} .${c.command} \u2022 ${c.usage} uses
`;
        });
        menuText += `
`;
      }
      for (const cat of categories) {
        const catEmoji = getCategoryEmoji(cat);
        menuText += `${catEmoji} *${cat.toUpperCase()}*
`;
        menuText += `\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
`;
        const catCmds = CommandHandler.getCommandsByCategory(cat);
        catCmds.forEach((cmdName, index) => {
          const isLast = index === catCmds.length - 1;
          const treeChar = isLast ? "\u2514" : "\u251C";
          const isOff = CommandHandler.disabledCommands.has(cmdName.toLowerCase());
          const cmdStats = stats.find((s) => s.command === cmdName.toLowerCase());
          const statusIcon = isOff ? disabledEmoji : activeEmoji;
          let speedTag = "";
          if (cmdStats && !isOff) {
            const ms = parseFloat(cmdStats.average_speed);
            if (ms > 0 && ms < 100) speedTag = ` ${fastEmoji}`;
            else if (ms > 1e3) speedTag = ` ${slowEmoji}`;
          }
          menuText += `${treeChar}\u2500 ${statusIcon} .${cmdName}${speedTag}
`;
        });
        menuText += `
`;
      }
      menuText += `\u250C\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
`;
      menuText += `\u251C  \u{1F4A1} *LEGEND*
`;
      menuText += `\u251C\u2500 ${activeEmoji} Active Command
`;
      menuText += `\u251C\u2500 ${disabledEmoji} Disabled Command
`;
      menuText += `\u251C\u2500 ${fastEmoji} Fast Response
`;
      menuText += `\u251C\u2500 ${slowEmoji} Slow Response
`;
      menuText += `\u2060\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`;
      const contextInfo = {
        forwardingScore: 1,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363319098372999@newsletter",
          newsletterName: "GlobalTechInc",
          serverMessageId: -1
        }
      };
      const messageOptions = thumbnail ? { image: thumbnail, caption: menuText, contextInfo } : { text: menuText, contextInfo };
      await sock.sendMessage(chatId, messageOptions, { quoted: message });
    } catch (error) {
      console.error("Menu Error:", error);
      await sock.sendMessage(chatId, {
        text: `\u274C *Menu Error*

${error.message}`
      }, { quoted: message });
    }
  }
};
export {
  smartmenu_default as default
};
