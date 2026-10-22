import axios from "axios";
var iplookup_default = {
  command: "whoisip",
  aliases: ["ip", "iplookup"],
  category: "search",
  description: "Get location info from an IP or Domain",
  usage: ".ip <address/domain>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args[0];
    if (!query) return await sock.sendMessage(chatId, { text: "Enter an IP or Domain (e.g., google.com)." });
    try {
      const res = await axios.get(`http://ip-api.com/json/${query}?fields=status,message,country,regionName,city,zip,isp,org,as,query`);
      const data = res.data;
      if (data.status === "fail") return await sock.sendMessage(chatId, { text: `\u274C Error: ${data.message}` });
      const info = `
\u{1F310} *IP/Domain Lookup*
---
\u{1F4CD} *Target:* ${data.query}
\u{1F30D} *Country:* ${data.country}
\u{1F3D9}\uFE0F *City/Region:* ${data.city}, ${data.regionName}
\u{1F4EE} *Zip:* ${data.zip}
\u{1F4E1} *ISP:* ${data.isp}
\u{1F3E2} *Organization:* ${data.org}
      `.trim();
      await sock.sendMessage(chatId, { text: info }, { quoted: message });
    } catch (err) {
      await sock.sendMessage(chatId, { text: "\u274C Network error." });
    }
  }
};
export {
  iplookup_default as default
};
