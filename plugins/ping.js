var ping_default = {
  command: "ping",
  aliases: ["p", "pong"],
  category: "general",
  description: "Check bot response time",
  usage: ".ping",
  isPrefixless: true,
  async handler(sock, message, _args) {
    const start = Date.now();
    const chatId = message.key.remoteJid;
    const sent = await sock.sendMessage(chatId, {
      text: "Pinging..."
    });
    const end = Date.now();
    await sock.sendMessage(chatId, {
      text: `\u{1F3D3} Pong!
Latency: ${end - start}ms`,
      edit: sent.key
    });
  }
};
export {
  ping_default as default
};
