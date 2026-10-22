import { loadSchedules, formatTimeLeft } from "./schedule.js";
var schedulelist_default = {
  command: "schedulelist",
  aliases: ["schedlist", "schedules", "reminders"],
  category: "utility",
  description: "View all scheduled messages for this chat",
  usage: ".schedulelist",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderId = context.senderId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const schedules = await loadSchedules();
    const mine = schedules.filter((s) => s.chatId === chatId || s.senderId === senderId);
    if (mine.length === 0) {
      return await sock.sendMessage(chatId, {
        text: "\u{1F4ED} *No scheduled messages found*\n\nUse `.schedule <time> <message>` to schedule one!",
        ...channelInfo
      }, { quoted: message });
    }
    const now = Date.now();
    const lines = mine.map((s, i) => {
      const timeLeft = formatTimeLeft(s.sendAt - now);
      const preview = s.message.length > 40 ? s.message.substring(0, 40) + "..." : s.message;
      return `${i + 1}. \u{1F4CC} *ID:* ${s.id} | \u23F3 ${timeLeft}
    \u{1F4AC} ${preview}`;
    }).join("\n\n");
    await sock.sendMessage(chatId, {
      text: `*\u23F0 SCHEDULED MESSAGES (${mine.length})*

${lines}

_Use .schedulecancel <ID> to cancel_`,
      ...channelInfo
    }, { quoted: message });
  }
};
export {
  schedulelist_default as default
};
