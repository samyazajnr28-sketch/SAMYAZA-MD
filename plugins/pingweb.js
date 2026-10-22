import axios from "axios";
var pingweb_default = {
  command: "pingweb",
  aliases: ["pweb"],
  category: "general",
  description: "Check bot response time and ping a website",
  usage: ".pingweb [website URL]",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo, rawText } = context;
    const prefix = rawText.match(/^[.!#]/)?.[0] || ".";
    const commandPart = rawText.slice(prefix.length).trim();
    const parts = commandPart.split(/\s+/);
    const url = parts.slice(1).join(" ").trim();
    const startBot = Date.now();
    const sent = await sock.sendMessage(chatId, {
      text: "\u{1F3D3} Pinging...",
      ...channelInfo
    }, { quoted: message });
    const endBot = Date.now();
    const botLatency = endBot - startBot;
    let responseText = `\u{1F3D3} *Pong!*

\u{1F4F6} *Bot Latency:* ${botLatency}ms`;
    if (url) {
      try {
        let testUrl = url;
        if (!testUrl.startsWith("http://") && !testUrl.startsWith("https://")) {
          testUrl = "https://" + testUrl;
        }
        const urlObj = new URL(testUrl);
        const startWeb = Date.now();
        const response = await axios.get(testUrl, {
          timeout: 1e4,
          validateStatus: () => true,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        });
        const endWeb = Date.now();
        const webLatency = endWeb - startWeb;
        responseText += `

\u{1F310} *Website:* ${urlObj.hostname}`;
        responseText += `
\u26A1 *Response Time:* ${webLatency}ms`;
        responseText += `
\u{1F4E1} *Status:* ${response.status} ${response.statusText}`;
        responseText += `
\u2705 *Reachable:* Yes`;
      } catch (error) {
        if (error.code === "ENOTFOUND") {
          responseText += `

\u{1F310} *Website:* ${url}`;
          responseText += `
\u274C *Error:* Domain not found`;
        } else if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") {
          responseText += `

\u{1F310} *Website:* ${url}`;
          responseText += `
\u274C *Error:* Connection timeout`;
        } else if (error.message.includes("Invalid URL")) {
          responseText += `

\u274C *Invalid URL format*`;
          responseText += `
\u{1F4A1} Example: .ping google.com`;
        } else {
          responseText += `

\u{1F310} *Website:* ${url}`;
          responseText += `
\u274C *Error:* ${error.message}`;
        }
      }
    } else {
      responseText += `

\u{1F4A1} *Tip:* Use \`.ping <url>\` to test website response time`;
      responseText += `
\u{1F4DD} *Example:* .ping google.com`;
    }
    await sock.sendMessage(chatId, {
      text: responseText,
      edit: sent.key,
      ...channelInfo
    });
  }
};
export {
  pingweb_default as default
};
