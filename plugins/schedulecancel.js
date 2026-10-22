import { loadSchedules, saveSchedules } from "./schedule.js";
var schedulecancel_default = {
  command: "schedulecancel",
  aliases: ["schedcancel", "cancelschedule", "unschedule"],
  category: "utility",
  description: "Cancel a scheduled message by its ID",
  usage: ".schedulecancel <ID>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const senderId = context.senderId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    if (!args || args.length === 0) {
      return await sock.sendMessage(chatId, {
        text: "\u274C Please provide the schedule ID.\n\nUsage: `.schedulecancel <ID>`\nGet IDs: `.schedulelist`",
        ...channelInfo
      }, { quoted: message });
    }
    const targetId = args[0].toUpperCase();
    const schedules = await loadSchedules();
    const index = schedules.findIndex(
      (s) => s.id === targetId && (s.chatId === chatId || s.senderId === senderId)
    );
    if (index === -1) {
      return await sock.sendMessage(chatId, {
        text: `\u274C No scheduled message found with ID *${targetId}*

Use \`.schedulelist\` to see your scheduled messages.`,
        ...channelInfo
      }, { quoted: message });
    }
    const cancelled = schedules.splice(index, 1)[0];
    await saveSchedules(schedules);
    await sock.sendMessage(chatId, {
      text: `\u{1F5D1}\uFE0F *Schedule Cancelled!*

\u{1F4CC} *ID:* ${cancelled.id}
\u{1F4AC} *Message:* ${cancelled.message}`,
      ...channelInfo
    }, { quoted: message });
  }
};
export {
  schedulecancel_default as default
};
