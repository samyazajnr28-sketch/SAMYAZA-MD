var translate_default = {
  command: "translate",
  aliases: ["trt"],
  category: "tools",
  description: "Translate text to the specified language.",
  usage: ".translate <text> <lang> or reply to a message with .translate <lang>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      await sock.presenceSubscribe(chatId);
      await sock.sendPresenceUpdate("composing", chatId);
      let textToTranslate = "";
      let lang = "";
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMessage) {
        textToTranslate = quotedMessage.conversation || quotedMessage.extendedTextMessage?.text || quotedMessage.imageMessage?.caption || quotedMessage.videoMessage?.caption || "";
        lang = args[0]?.trim();
      } else {
        if (args.length < 2) {
          return await sock.sendMessage(chatId, {
            text: `*TRANSLATOR*

Usage:
1. Reply to a message with: .translate <lang> or .trt <lang>
2. Or type: .translate <text> <lang> or .trt <text> <lang>

Example:
.translate hello fr
.trt hello fr

Language codes:
fr - French
es - Spanish
de - German
it - Italian
pt - Portuguese
ru - Russian
ja - Japanese
ko - Korean
zh - Chinese
ar - Arabic
hi - Hindi`,
            quoted: message
          });
        }
        lang = args.pop();
        textToTranslate = args.join(" ");
      }
      if (!textToTranslate) {
        return await sock.sendMessage(chatId, {
          text: "No text found to translate. Please provide text or reply to a message.",
          quoted: message
        });
      }
      let translatedText = null;
      try {
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(textToTranslate)}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data[0] && data[0][0] && data[0][0][0]) {
            translatedText = data[0][0][0];
          }
        }
      } catch (e) {
      }
      if (!translatedText) {
        try {
          const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=auto|${lang}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.responseData && data.responseData.translatedText) {
              translatedText = data.responseData.translatedText;
            }
          }
        } catch (e) {
        }
      }
      if (!translatedText) {
        try {
          const response = await fetch(`https://api.dreaded.site/api/translate?text=${encodeURIComponent(textToTranslate)}&lang=${lang}`);
          if (response.ok) {
            const data = await response.json();
            if (data && data.translated) {
              translatedText = data.translated;
            }
          }
        } catch (e) {
        }
      }
      if (!translatedText) {
        throw new Error("All translation APIs failed");
      }
      await sock.sendMessage(chatId, {
        text: `${translatedText}`
      }, {
        quoted: message
      });
    } catch (error) {
      console.error("\u274C Error in translate command:", error);
      await sock.sendMessage(chatId, {
        text: "\u274C Failed to translate text. Please try again later.\n\nUsage:\n1. Reply to a message with: .translate <lang> or .trt <lang>\n2. Or type: .translate <text> <lang> or .trt <text> <lang>",
        quoted: message
      });
    }
  }
};
export {
  translate_default as default
};
