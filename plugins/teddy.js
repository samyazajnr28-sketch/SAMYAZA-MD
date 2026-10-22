const teddyUsers = {};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var teddy_default = {
  command: "teddy",
  aliases: [],
  category: "fun",
  description: "Send an animated teddy with cute emojis",
  usage: ".teddy",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const sender = message.key.participant || message.key.remoteJid;
    if (teddyUsers[sender]) return;
    teddyUsers[sender] = true;
    const teddyEmojis = [
      "\u2764",
      "\u{1F495}",
      "\u{1F63B}",
      "\u{1F9E1}",
      "\u{1F49B}",
      "\u{1F49A}",
      "\u{1F499}",
      "\u{1F49C}",
      "\u{1F5A4}",
      "\u2763",
      "\u{1F49E}",
      "\u{1F493}",
      "\u{1F497}",
      "\u{1F496}",
      "\u{1F498}",
      "\u{1F49D}",
      "\u{1F49F}",
      "\u2665",
      "\u{1F48C}",
      "\u{1F642}",
      "\u{1F917}",
      "\u{1F60C}",
      "\u{1F609}",
      "\u{1F917}",
      "\u{1F60A}",
      "\u{1F38A}",
      "\u{1F389}",
      "\u{1F381}",
      "\u{1F388}"
    ];
    try {
      const pingMsg = await sock.sendMessage(chatId, { text: `(\\_/)
( \u2022.\u2022)
/>\u{1F90D}` }, { quoted: message });
      for (let i = 0; i < teddyEmojis.length; i++) {
        await sleep(500);
        await sock.relayMessage(
          chatId,
          {
            protocolMessage: {
              key: pingMsg.key,
              type: 14,
              editedMessage: {
                conversation: `(\\_/)
( \u2022.\u2022)
/>${teddyEmojis[i]}`
              }
            }
          },
          {}
        );
      }
    } catch (err) {
      console.error("Error in teddy command:", err);
      try {
        await sock.sendMessage(chatId, { text: "\u274C Something went wrong while sending teddy emojis." }, { quoted: message });
      } catch {
      }
    } finally {
      delete teddyUsers[sender];
    }
  }
};
export {
  teddy_default as default
};
