import axios from "axios";
var whois_default = {
  command: "whois",
  aliases: ["domaininfo"],
  category: "info",
  description: "Get WHOIS information of a domain",
  usage: ".whois <domain>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    let domain = args?.[0]?.trim();
    if (!domain) {
      return await sock.sendMessage(chatId, { text: "*Provide a domain.*\nExample: .whois google.com" }, { quoted: message });
    }
    domain = domain.replace(/^https?:\/\//i, "");
    try {
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
        return await sock.sendMessage(chatId, { text: "\u274C Invalid domain provided." }, { quoted: message });
      }
      const apiUrl = `https://discardapi.dpdns.org/api/tools/whois?apikey=guru&domain=${encodeURIComponent(domain)}`;
      const { data } = await axios.get(apiUrl, { timeout: 1e4 });
      if (!data?.status || !data.result?.domain) {
        return await sock.sendMessage(chatId, { text: "\u274C Could not fetch WHOIS information." }, { quoted: message });
      }
      const { domain: dom, registrar, registrant, technical } = data.result;
      const text = `\u{1F310} *WHOIS Information*

\u2022 Domain: ${dom.domain}
\u2022 Name: ${dom.name}
\u2022 Extension: .${dom.extension}
\u2022 WHOIS Server: ${dom.whois_server}
\u2022 Status: ${dom.status.join(", ")}
\u2022 Name Servers: ${dom.name_servers.join(", ")}
\u2022 Created: ${dom.created_date_in_time}
\u2022 Updated: ${dom.updated_date_in_time}
\u2022 Expires: ${dom.expiration_date_in_time}

\u{1F3E2} Registrar: ${registrar.name}
\u{1F4DE} Phone: ${registrar.phone}
\u{1F4E7} Email: ${registrar.email}
\u{1F517} Website: ${registrar.referral_url}

\u{1F464} Registrant: ${registrant.organization || "N/A"}
\u{1F30D} Country: ${registrant.country || "N/A"}
\u{1F4E7} Email: ${registrant.email || "N/A"}

\u2699 Technical Email: ${technical.email || "N/A"}`;
      await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (error) {
      console.error("WHOIS plugin error:", error);
      if (error.code === "ECONNABORTED") {
        await sock.sendMessage(chatId, { text: "\u274C Request timed out. The API may be slow or unreachable." }, { quoted: message });
      } else {
        await sock.sendMessage(chatId, { text: "\u274C Failed to fetch WHOIS information." }, { quoted: message });
      }
    }
  }
};
export {
  whois_default as default
};
