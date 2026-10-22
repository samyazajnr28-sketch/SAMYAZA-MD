import isOwnerOrSudo from "../lib/isOwner.js";
import { getChatbot, getWelcome, getGoodbye, getAntitag } from "../lib/index.js";
import store from "../lib/lightweight_store.js";
import { cleanJid } from "../lib/isOwner.js";
var settings_default = {
  command: "settings",
  aliases: ["config", "setting"],
  category: "owner",
  description: "Show bot settings and per-group configurations",
  usage: ".settings",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderId = message.key.participant || message.key.remoteJid;
    try {
      const isOwner = await isOwnerOrSudo(senderId, sock, chatId);
      const isMe = message.key.fromMe;
      if (!isMe && !isOwner) {
        return await sock.sendMessage(chatId, {
          text: "\u274C *Access Denied:* Only Owner/Sudo can view settings."
        }, { quoted: message });
      }
      const isGroup = chatId.endsWith("@g.us");
      const botMode = await store.getBotMode();
      const autoStatus = await store.getSetting("global", "autoStatus") || { enabled: false };
      const autoread = await store.getSetting("global", "autoread") || { enabled: false };
      const autotyping = await store.getSetting("global", "autotyping") || { enabled: false };
      const pmblocker = await store.getSetting("global", "pmblocker") || { enabled: false };
      const anticall = await store.getSetting("global", "anticall") || { enabled: false };
      const autoReactionData = await store.getSetting("global", "autoReaction");
      const mentionData = await store.getSetting("global", "mention");
      const autoReaction = autoReactionData?.enabled || false;
      const stealthMode = await store.getSetting("global", "stealthMode") || { enabled: false };
      const autoBio = await store.getSetting("global", "autoBio") || { enabled: false };
      const fs = (await import("fs")).default;
      let cmdReactEnabled = true;
      try {
        const ugd = JSON.parse(fs.readFileSync("./data/userGroupData.json", "utf-8"));
        cmdReactEnabled = ugd.autoReaction ?? true;
      } catch {
        cmdReactEnabled = true;
      }
      const getSt = (val) => val ? "\u2705" : "\u274C";
      let menuText = `\u256D\u2501\u3014 *MEGA CONFIG* \u3015\u2501\u2508
\u2503
`;
      menuText += `\u2503 \u{1F464} *User:* @${cleanJid(senderId)}
`;
      menuText += `\u2503 \u{1F916} *Mode:* ${botMode.toUpperCase()}
`;
      menuText += `\u2503
\u2523\u2501\u3014 *GLOBAL CONFIG* \u3015\u2501\u2508
`;
      menuText += `\u2503 ${getSt(autoStatus?.enabled)} *Auto Status*
`;
      menuText += `\u2503 ${getSt(autoread?.enabled)} *Auto Read*
`;
      menuText += `\u2503 ${getSt(autotyping?.enabled)} *Auto Typing*
`;
      menuText += `\u2503 ${getSt(pmblocker?.enabled)} *PM Blocker*
`;
      menuText += `\u2503 ${getSt(anticall?.enabled)} *Anti Call*
`;
      menuText += `\u2503 ${getSt(autoReaction)} *Auto Reaction*
`;
      menuText += `\u2503 ${getSt(cmdReactEnabled)} *Cmd Reactions*
`;
      menuText += `\u2503 ${getSt(stealthMode?.enabled)} *Stealth Mode*
`;
      menuText += `\u2503 ${getSt(autoBio?.enabled)} *Auto Bio*
`;
      menuText += `\u2503 ${getSt(mentionData?.enabled)} *Mention Alert*
`;
      menuText += `\u2503
`;
      if (isGroup) {
        const groupSettings = await store.getAllSettings(chatId);
        const groupAntilink = groupSettings.antilink || { enabled: false };
        const groupBadword = groupSettings.antibadword || { enabled: false };
        const antitag = await getAntitag(chatId, "on");
        const groupAntitag = { enabled: !!antitag };
        const chatbotData = await getChatbot(chatId);
        const welcomeData = await getWelcome(chatId);
        const goodbyeData = await getGoodbye(chatId);
        const groupChatbot = chatbotData === true || chatbotData?.enabled || false;
        const groupWelcome = welcomeData !== null && welcomeData !== void 0 && welcomeData !== false;
        const groupGoodbye = goodbyeData !== null && goodbyeData !== void 0 && goodbyeData !== false;
        menuText += `\u2523\u2501\u3014 *GROUP CONFIG* \u3015\u2501\u2508
`;
        menuText += `\u2503 ${getSt(groupAntilink.enabled)} *Antilink*
`;
        menuText += `\u2503 ${getSt(groupBadword.enabled)} *Antibadword*
`;
        menuText += `\u2503 ${getSt(groupAntitag.enabled)} *Antitag*
`;
        menuText += `\u2503 ${getSt(groupChatbot)} *Chatbot*
`;
        menuText += `\u2503 ${getSt(groupWelcome)} *Welcome*
`;
        menuText += `\u2503 ${getSt(groupGoodbye)} *Goodbye*
`;
      } else {
        menuText += `\u2503 \u{1F4A1} *Note:* _Use in group for group configs._
`;
      }
      menuText += `\u2503
\u2570\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2508`;
      await sock.sendMessage(chatId, {
        text: menuText,
        mentions: [senderId],
        contextInfo: {
          externalAdReply: {
            title: "SYSTEM SETTINGS PANEL",
            body: "Configuration Status",
            thumbnailUrl: "https://github.com/GlobalTechInfo.png",
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: message });
    } catch (error) {
      console.error("Settings Command Error:", error);
      await sock.sendMessage(chatId, {
        text: "\u274C Error: Failed to load settings."
      }, { quoted: message });
    }
  }
};
export {
  settings_default as default
};
