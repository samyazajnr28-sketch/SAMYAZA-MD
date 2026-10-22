import CommandHandler from "../lib/commandHandler.js";
var stats_default = {
  command: "perf",
  aliases: ["metrics", "diagnostics"],
  category: "general",
  description: "View command performance and error metrics",
  usage: ".perf",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const report = CommandHandler.getDiagnostics();
      if (!report || report.length === 0) {
        return await sock.sendMessage(chatId, { text: "_No performance data collected yet._" }, { quoted: message });
      }
      let text = `\u{1F4CA} *PLUGINS PERFORMANCE*

`;
      report.forEach((cmd, index) => {
        const errorText = cmd.errors > 0 ? `\u2757 Errors: ${cmd.errors}` : `\u2705 Smooth`;
        text += `${index + 1}. *${cmd.command.toUpperCase()}*
`;
        text += `   \u21B3 Calls: ${cmd.usage}
`;
        text += `   \u21B3 Latency: ${cmd.average_speed}
`;
        text += `   \u21B3 Status: ${errorText}

`;
      });
      await sock.sendMessage(chatId, {
        text: text.trim(),
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363319098372999@newsletter",
            newsletterName: "MEGA MD PERFORMANCE",
            serverMessageId: -1
          }
        }
      }, { quoted: message });
    } catch (error) {
      console.error("Error in perf command:", error);
      await sock.sendMessage(chatId, { text: "\u274C Failed to fetch performance metrics." }, { quoted: message });
    }
  }
};
export {
  stats_default as default
};
