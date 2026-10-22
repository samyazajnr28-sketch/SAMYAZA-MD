var flip_default = {
  command: "flip",
  aliases: ["mirror", "upside"],
  category: "tools",
  description: "Flip text upside down (supports Uppercase)",
  usage: ".flip <text> OR reply to a message",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    let txt = args?.join(" ") || "";
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted) {
      txt = quoted.conversation || quoted.extendedTextMessage?.text || quoted.imageMessage?.caption || txt;
    }
    txt = txt.replace(/^\.\w+\s*/, "").trim();
    if (!txt) return await sock.sendMessage(chatId, { text: "*What should I flip?*" });
    const charMap = {
      "a": "\u0250",
      "b": "q",
      "c": "\u0254",
      "d": "p",
      "e": "\u01DD",
      "f": "\u025F",
      "g": "\u0183",
      "h": "\u0265",
      "i": "\u1D09",
      "j": "\u027E",
      "k": "\u029E",
      "l": "l",
      "m": "\u026F",
      "n": "u",
      "o": "o",
      "p": "d",
      "q": "b",
      "r": "\u0279",
      "s": "s",
      "t": "\u0287",
      "u": "n",
      "v": "\u028C",
      "w": "\u028D",
      "x": "x",
      "y": "\u028E",
      "z": "z",
      "A": "\u2200",
      "B": "\u15FA",
      "C": "\u0186",
      "D": "p",
      "E": "\u018E",
      "F": "\u2132",
      "G": "\u05E4",
      "H": "H",
      "I": "I",
      "J": "\u017F",
      "K": "\u029E",
      "L": "\u02E5",
      "M": "W",
      "N": "N",
      "O": "O",
      "P": "\u0500",
      "Q": "\u038C",
      "R": "\u1D1A",
      "S": "S",
      "T": "\u22A5",
      "U": "\u2229",
      "V": "\u039B",
      "W": "M",
      "X": "X",
      "Y": "\u2144",
      "Z": "Z",
      "1": "\u0196",
      "2": "\u1105",
      "3": "\u0190",
      "4": "\u3123",
      "5": "\u03DB",
      "6": "9",
      "7": "\u3125",
      "8": "8",
      "9": "6",
      "0": "0",
      ".": "\u02D9",
      ",": "'",
      "'": ",",
      '"': "\u201E",
      "!": "\xA1",
      "?": "\xBF",
      "(": ")",
      ")": "(",
      "[": "]",
      "]": "[",
      "{": "}",
      "}": "{",
      "<": ">",
      ">": "<",
      "_": "\u203E",
      "&": "\u214B"
    };
    const flipped = txt.split("").map((char) => charMap[char] || char).reverse().join("");
    await sock.sendMessage(chatId, { text: flipped }, { quoted: message });
  }
};
export {
  flip_default as default
};
