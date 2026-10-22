const flirtMessages = [
  "Are you a magician? Because whenever I look at you, everyone else disappears.",
  "Do you have a map? I keep getting lost in your eyes.",
  "If smiles were stars, your face would light up the whole sky.",
  "You must be a great book, because I could spend all day getting to know you.",
  "Is your name Wi-Fi? Because I feel a strong connection.",
  "You make ordinary moments feel special.",
  "I was having a good day, and then you made it even better.",
  "If kindness had a face, I think it would look a lot like yours.",
  "You have a way of making the whole room brighter.",
  "I would gladly get lost in a conversation with you.",
  "Your laugh might be my new favorite sound.",
  "You are proof that a simple hello can make someone's day.",
  "If charm were a superpower, you would be unstoppable.",
  "I think my day just improved by at least 100 percent.",
  "You have the kind of energy people remember.",
  "I was looking for a reason to smile, and then you showed up.",
  "You make being yourself look wonderfully effortless.",
  "I would choose your company over a perfect playlist.",
  "You seem like someone who makes every story more interesting.",
  "Just so you know, your presence is seriously delightful."
];

var flirt_default = {
  command: "flirt",
  aliases: ["flirty", "pickuplines"],
  category: "fun",
  description: "Get a random flirt message",
  usage: ".flirt",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const flirtMessage = flirtMessages[Math.floor(Math.random() * flirtMessages.length)];
    await sock.sendMessage(chatId, { text: flirtMessage }, { quoted: message });
  }
};
export {
  flirt_default as default
};
