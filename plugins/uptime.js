var uptime_default = {
  command: "uptime",
  aliases: ["runtime"],
  category: "general",
  description: "Show bot status information",
  usage: ".uptime",
  isPrefixless: true,
  async handler(sock, message) {
    const chatId = message.key.remoteJid;
    const commandHandler = (await import("../lib/commandHandler.js")).default;
    const uptimeMs = process.uptime() * 1e3;
    const formatUptime = (ms) => {
      const sec = Math.floor(ms / 1e3) % 60;
      const min = Math.floor(ms / (1e3 * 60)) % 60;
      const hr = Math.floor(ms / (1e3 * 60 * 60)) % 24;
      const day = Math.floor(ms / (1e3 * 60 * 60 * 24));
      const parts = [];
      if (day) parts.push(`${day}d`);
      if (hr) parts.push(`${hr}h`);
      if (min) parts.push(`${min}m`);
      parts.push(`${sec}s`);
      return parts.join(" ");
    };
    const startedAt = new Date(Date.now() - uptimeMs).toLocaleString();
    const ramMb = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
    const commandCount = commandHandler.commands.size;
    const text = `\u{1F916} *MEGA-MD STATUS*

\u23F1 Uptime: ${formatUptime(uptimeMs)}
\u{1F680} Started: ${startedAt}
\u{1F4E6} Plugins: ${commandCount}
\u{1F4BE} RAM: ${ramMb} MB`;
    await sock.sendMessage(chatId, { text });
  }
};
export {
  uptime_default as default
};
