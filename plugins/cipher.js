import { getBin } from "../lib/compile.js";
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
var cipher_default = {
  command: "cipher",
  aliases: ["encrypt", "decrypt", "encode", "crypt"],
  category: "utility",
  description: "Encrypt or decrypt text using Caesar, Vigenere, or XOR cipher",
  usage: ".cipher <type> <encode|decode> <key> <text>",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    if (args.length < 4) {
      return await sock.sendMessage(chatId, {
        text: `\u{1F510} *Text Cipher*

*Usage:* \`.cipher <type> <encode|decode> <key> <text>\`

*Cipher types:*

*caesar* \u2014 shift letters by a number (key = number)
\u2022 \`.cipher caesar encode 13 Hello World\`
\u2022 \`.cipher caesar decode 13 Uryyb Jbeyq\`

*vigenere* \u2014 polyalphabetic cipher (key = word)
\u2022 \`.cipher vigenere encode SECRET Hello World\`
\u2022 \`.cipher vigenere decode SECRET Zincs Pgvnu\`

*xor* \u2014 XOR byte cipher, output is hex (key = any text)
\u2022 \`.cipher xor encode mykey Hello\`
\u2022 \`.cipher xor decode mykey 25090a0e06\``,
        ...channelInfo
      }, { quoted: message });
    }
    const cipherType = args[0].toLowerCase();
    const mode = args[1].toLowerCase();
    const key = args[2];
    const text = args.slice(3).join(" ").trim();
    if (!["caesar", "vigenere", "xor"].includes(cipherType)) {
      return await sock.sendMessage(chatId, {
        text: `\u274C Unknown cipher: *${cipherType}*
Use: \`caesar\`, \`vigenere\`, or \`xor\``,
        ...channelInfo
      }, { quoted: message });
    }
    if (!["encode", "decode", "encrypt", "decrypt"].includes(mode)) {
      return await sock.sendMessage(chatId, {
        text: `\u274C Unknown mode: *${mode}*
Use: \`encode\` or \`decode\``,
        ...channelInfo
      }, { quoted: message });
    }
    if (!text) {
      return await sock.sendMessage(chatId, {
        text: `\u274C No text provided.`,
        ...channelInfo
      }, { quoted: message });
    }
    if (cipherType === "caesar" && isNaN(parseInt(key, 10))) {
      return await sock.sendMessage(chatId, {
        text: `\u274C Caesar cipher key must be a number (e.g. 13)`,
        ...channelInfo
      }, { quoted: message });
    }
    try {
      const bin = getBin("cipher");
      const safeText = text.replace(/"/g, '\\"');
      const safeKey = key.replace(/"/g, '\\"');
      const { stdout, stderr } = await execAsync(
        `"${bin}" ${cipherType} ${mode} "${safeKey}" "${safeText}"`,
        { timeout: 1e4 }
      );
      if (stderr && !stdout) {
        return await sock.sendMessage(chatId, {
          text: `\u274C ${stderr.trim()}`,
          ...channelInfo
        }, { quoted: message });
      }
      const result = stdout.trim();
      const cipherNames = {
        caesar: "Caesar",
        vigenere: "Vigen\xE8re",
        xor: "XOR"
      };
      const modeLabel = mode === "encode" || mode === "encrypt" ? "\u{1F512} Encrypted" : "\u{1F513} Decrypted";
      await sock.sendMessage(chatId, {
        text: `\u{1F510} *${cipherNames[cipherType]} Cipher*

\u{1F4E5} *Input:* \`${text}\`
\u{1F511} *Key:* \`${key}\`
${modeLabel}: \`${result}\``,
        ...channelInfo
      }, { quoted: message });
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C Failed: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  cipher_default as default
};
