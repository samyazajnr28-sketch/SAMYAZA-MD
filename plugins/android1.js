import axios from "axios";
const QasimAny = {
  apksearch: query => axios.get(`https://discardapi.dpdns.org/api/apk/search?apikey=guru&query=${encodeURIComponent(query)}`)
};
var android1_default = {
  command: "apkdl",
  aliases: ["apk", "an1apk", "appdl", "app"],
  category: "download",
  description: "Search APKs and download by reply",
  usage: ".apkdl <apk_name>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const query = args.join(" ").trim();
    try {
      if (!query) {
        return await sock.sendMessage(chatId, { text: "*Please provide an APK name.*\nExample: .apkdl Telegram" }, { quoted: message });
      }
      await sock.sendMessage(chatId, { text: "\u{1F50E} Searching for APKs..." }, { quoted: message });
      const res = await QasimAny.apksearch(query);
      if (!res?.data || !Array.isArray(res.data) || res.data.length === 0) {
        return await sock.sendMessage(chatId, { text: "\u274C No APKs found." }, { quoted: message });
      }
      const results = res.data;
      const first = results[0];
      let caption = `\u{1F4F1} *APK Search Results for:* *${query}*

`;
      caption += `\u21A9\uFE0F *Reply with a number to download*

`;
      results.forEach((item, i) => {
        caption += `*${i + 1}.* ${item.judul}
\u{1F468}\u200D\u{1F4BB} Developer: ${item.dev}
\u2B50 Rating: ${item.rating}
\u{1F517} ${item.link}

`;
      });
      const sentMsg = await sock.sendMessage(chatId, { image: { url: first.thumb }, caption }, { quoted: message });
      const timeout = setTimeout(async () => {
        sock.ev.off("messages.upsert", listener);
        await sock.sendMessage(chatId, { text: "\u23F1 APK selection expired. Please search again." }, { quoted: sentMsg });
      }, 5 * 60 * 1e3);
      const listener = async ({ messages }) => {
        const m = messages[0];
        if (!m?.message || m.key.remoteJid !== chatId) return;
        const ctx = m.message?.extendedTextMessage?.contextInfo;
        if (!ctx?.stanzaId || ctx.stanzaId !== sentMsg.key.id) return;
        const replyText = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const choice = parseInt(replyText.trim(), 10);
        if (isNaN(choice) || choice < 1 || choice > results.length) {
          return await sock.sendMessage(chatId, { text: `\u274C Invalid choice. Pick 1-${results.length}.` }, { quoted: m });
        }
        clearTimeout(timeout);
        sock.ev.off("messages.upsert", listener);
        const selected = results[choice - 1];
        await sock.sendMessage(chatId, { text: `\u2B07\uFE0F Downloading *${selected.judul}*...
\u23F1 Please wait...` }, { quoted: m });
        const apiUrl = `https://discardapi.dpdns.org/api/apk/dl/android1?apikey=guru&url=` + encodeURIComponent(selected.link);
        const dlRes = await axios.get(apiUrl);
        const apk = dlRes.data?.result;
        if (!apk?.url) {
          return await sock.sendMessage(chatId, { text: "\u274C Failed to get APK download link." }, { quoted: m });
        }
        const safeName = apk.name.replace(/[^\w.-]/g, "_");
        const apkCaption = `\u{1F4E6} *APK Downloaded*

\u{1F4DB} Name: ${apk.name}
\u2B50 Rating: ${apk.rating}
\u{1F4E6} Size: ${apk.size}
\u{1F4F1} Android: ${apk.requirement}
\u{1F9D2} Age: ${apk.rated}
\u{1F4C5} Published: ${apk.published}

\u{1F4DD} Description:
${apk.description}`;
        await sock.sendMessage(chatId, { document: { url: apk.url }, fileName: `${safeName}.apk`, mimetype: "application/vnd.android.package-archive", caption: apkCaption }, { quoted: m });
      };
      sock.ev.on("messages.upsert", listener);
    } catch (err) {
      console.error("\u274C Android Plugin Error:", err);
      await sock.sendMessage(chatId, { text: "\u274C Failed to process APK request." }, { quoted: message });
    }
  }
};
export {
  android1_default as default
};
