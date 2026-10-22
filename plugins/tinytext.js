var tinytext_default = {
  command: "smallcaps",
  aliases: ["tinytext", "mini"],
  category: "tools",
  description: "Convert text to small-capital style",
  usage: ".smallcaps <text> OR reply to a message",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      let txt = args?.join(" ") || "";
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) {
        txt = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || txt;
      }
      txt = txt.replace(/^\.\w+\s*/, "").trim();
      if (!txt) {
        return await sock.sendMessage(chatId, {
          text: "Please provide text or reply to a message to convert.\nExample: `.smallcaps Hello World`"
        }, { quoted: message });
      }
      const capsMap = {
        "a": "\u1D00",
        "b": "\u0299",
        "c": "\u1D04",
        "d": "\u1D05",
        "e": "\u1D07",
        "f": "\uA730",
        "g": "\u0262",
        "h": "\u029C",
        "i": "\u026A",
        "j": "\u1D0A",
        "k": "\u1D0B",
        "l": "\u029F",
        "m": "\u1D0D",
        "n": "\u0274",
        "o": "\u1D0F",
        "p": "\u1D18",
        "q": "\u01EB",
        "r": "\u0280",
        "s": "s",
        "t": "\u1D1B",
        "u": "\u1D1C",
        "v": "\u1D20",
        "w": "\u1D21",
        "x": "x",
        "y": "\u028F",
        "z": "\u1D22",
        "A": "\u1D00",
        "B": "\u0299",
        "C": "\u1D04",
        "D": "\u1D05",
        "E": "\u1D07",
        "F": "\uA730",
        "G": "\u0262",
        "H": "\u029C",
        "I": "\u026A",
        "J": "\u1D0A",
        "K": "\u1D0B",
        "L": "\u029F",
        "M": "\u1D0D",
        "N": "\u0274",
        "O": "\u1D0F",
        "P": "\u1D18",
        "Q": "\u01EB",
        "R": "\u0280",
        "S": "s",
        "T": "\u1D1B",
        "U": "\u1D1C",
        "V": "\u1D20",
        "W": "\u1D21",
        "X": "x",
        "Y": "\u028F",
        "Z": "\u1D22",
        "0": "\u2070",
        "1": "\xB9",
        "2": "\xB2",
        "3": "\xB3",
        "4": "\u2074",
        "5": "\u2075",
        "6": "\u2076",
        "7": "\u2077",
        "8": "\u2078",
        "9": "\u2079"
      };
      const result = txt.split("").map((char) => capsMap[char] || char).join("");
      await sock.sendMessage(chatId, { text: result }, { quoted: message });
    } catch (err) {
      console.error("SmallCaps Error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Failed to process text." });
    }
  }
};
export {
  tinytext_default as default
};
