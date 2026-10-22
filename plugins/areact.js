import store from "../lib/lightweight_store.js";
const autoEmojis = [
  "\u{1F498}",
  "\u{1F49D}",
  "\u{1F496}",
  "\u{1F497}",
  "\u{1F493}",
  "\u{1F49E}",
  "\u{1F495}",
  "\u{1F49F}",
  "\u2763\uFE0F",
  "\u2764\uFE0F",
  "\u{1F9E1}",
  "\u{1F49B}",
  "\u{1F49A}",
  "\u{1F499}",
  "\u{1F49C}",
  "\u{1F90E}",
  "\u{1F5A4}",
  "\u{1F90D}",
  "\u2665\uFE0F",
  "\u{1F388}",
  "\u{1F381}",
  "\u{1F48C}",
  "\u{1F490}",
  "\u{1F618}",
  "\u{1F917}",
  "\u{1F338}",
  "\u{1F339}",
  "\u{1F940}",
  "\u{1F33A}",
  "\u{1F33C}",
  "\u{1F337}",
  "\u{1F341}",
  "\u2B50\uFE0F",
  "\u{1F31F}",
  "\u{1F60A}",
  "\u{1F970}",
  "\u{1F60D}",
  "\u{1F929}",
  "\u263A\uFE0F"
];
let AUTO_REACT_MESSAGES = false;
store.getSetting("global", "autoReaction").then((v) => {
  if (v?.enabled !== void 0) AUTO_REACT_MESSAGES = v.enabled;
}).catch(() => {
});
let lastReactedTime = 0;
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
var areact_default = {
  command: "autoreact",
  aliases: ["areact"],
  category: "owner",
  description: "Toggle auto-react to messages",
  usage: ".autoreact on/off",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    if (!args[0] || !["on", "off"].includes(args[0])) {
      await sock.sendMessage(chatId, {
        text: "*Usage:*\n.autoreact on/off",
        ...channelInfo
      }, { quoted: message });
      return;
    }
    AUTO_REACT_MESSAGES = args[0] === "on";
    await store.saveSetting("global", "autoReaction", { enabled: AUTO_REACT_MESSAGES });
    await sock.sendMessage(chatId, {
      text: AUTO_REACT_MESSAGES ? "*\u2705 Auto-react enabled*" : "*\u274C Auto-react disabled*",
      ...channelInfo
    }, { quoted: message });
    if (sock.__autoReactAttached) return;
    sock.ev.on("messages.upsert", async ({ messages }) => {
      if (!AUTO_REACT_MESSAGES) return;
      for (const m of messages) {
        if (!m?.message) continue;
        if (m.key.fromMe) continue;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        if (!text) continue;
        if (/^[!#.$%^&*+=?<>]/.test(text)) continue;
        const now = Date.now();
        if (now - lastReactedTime < 2e3) continue;
        await sock.sendMessage(m.key.remoteJid, {
          react: {
            text: random(autoEmojis),
            key: m.key
          }
        });
        lastReactedTime = now;
      }
    });
    sock.__autoReactAttached = true;
  }
};
export {
  areact_default as default
};
