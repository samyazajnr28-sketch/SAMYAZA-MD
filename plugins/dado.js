var dado_default = {
  command: "dado",
  aliases: ["dados", "dice"],
  category: "games",
  description: "Roll a random dice sticker",
  usage: ".dado",
  async handler(sock, message, _args, _context) {
    const chatId = message.key.remoteJid;
    const diceLinks = [
      "https://tinyurl.com/gdd01",
      "https://tinyurl.com/gdd02",
      "https://tinyurl.com/gdd003",
      "https://tinyurl.com/gdd004",
      "https://tinyurl.com/gdd05",
      "https://tinyurl.com/gdd006"
    ];
    const randomDice = diceLinks[Math.floor(Math.random() * diceLinks.length)];
    try {
      await sock.sendMessage(chatId, {
        sticker: { url: randomDice }
      }, { quoted: message });
    } catch (e) {
      console.error("Dice Plugin Error:", e);
      await sock.sendMessage(chatId, {
        image: { url: randomDice },
        caption: "\u{1F3B2} The dice rolled!"
      }, { quoted: message });
    }
  }
};
export {
  dado_default as default
};
