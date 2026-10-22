import store from "../lib/lightweight_store.js";
import axios from "axios";
const QUOTE_URLS = [
  "https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/text/random_quotes.txt",
  "https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/text/motivational_quotes.txt",
  "https://raw.githubusercontent.com/GlobalTechInfo/Islamic-Database/main/text/pickup_quotes.txt"
];
let cachedQuotes = [];
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1e3;
async function fetchQuotes() {
  try {
    if (cachedQuotes.length > 0 && Date.now() - lastFetchTime < CACHE_DURATION) {
      return cachedQuotes;
    }
    const allQuotes = [];
    for (const url of QUOTE_URLS) {
      try {
        const response = await axios.get(url, { timeout: 15e3 });
        const lines = response.data.split("\n").map((line) => line.trim()).filter((line) => line.length > 10);
        allQuotes.push(...lines);
      } catch (error) {
      }
    }
    if (allQuotes.length === 0) {
      return [
        "\u{1F48E} By MEGA-MD - Your WhatsApp Bot",
        "\u{1F31F} Stay positive, work hard, make it happen.",
        "\u2728 Believe in yourself and all that you are.",
        "\u{1F680} The future belongs to those who believe in the beauty of their dreams.",
        "\u{1F4AA} Success is not final, failure is not fatal.",
        "\u{1F3AF} Dream big, work hard, stay focused.",
        "\u2B50 Every day is a new beginning.",
        "\u{1F308} Be the reason someone smiles today."
      ];
    }
    cachedQuotes = allQuotes;
    lastFetchTime = Date.now();
    return allQuotes;
  } catch (error) {
    return cachedQuotes.length > 0 ? cachedQuotes : ["\u{1F48E} By MEGA-MD - Your WhatsApp Bot"];
  }
}
function getRandomQuote(quotes) {
  if (!quotes || quotes.length === 0) return "\u{1F48E} By MEGA-MD";
  return quotes[Math.floor(Math.random() * quotes.length)];
}
async function updateAutoBio(sock) {
  try {
    const autoBioSettings = await store.getSetting("global", "autoBio");
    if (!autoBioSettings?.enabled) return;
    const quotes = await fetchQuotes();
    const randomQuote = getRandomQuote(quotes);
    let bio;
    if (autoBioSettings.customBio) {
      bio = autoBioSettings.customBio.replace("{quote}", randomQuote);
    } else {
      bio = `${randomQuote}

\u{1F48E} MEGA-MD`;
    }
    if (bio.length > 139) {
      bio = bio.substring(0, 136) + "...";
    }
    await sock.updateProfileStatus(bio);
  } catch (error) {
  }
}
let autoBioInterval = null;
function startAutoBio(sock) {
  if (autoBioInterval) return;
  fetchQuotes().then(() => {
  });
  autoBioInterval = setInterval(() => {
    updateAutoBio(sock);
  }, 10 * 60 * 1e3);
  updateAutoBio(sock);
}
function stopAutoBio() {
  if (autoBioInterval) {
    clearInterval(autoBioInterval);
    autoBioInterval = null;
  }
}
var setbio_default = {
  command: "setbio",
  aliases: ["autobio", "bio"],
  category: "owner",
  description: "Set custom WhatsApp bio with random quotes",
  usage: ".setbio <on|off|set|reset>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const action = args[0]?.toLowerCase();
    try {
      const autoBioSettings = await store.getSetting("global", "autoBio") || { enabled: false, customBio: null };
      if (!action) {
        const quotes = await fetchQuotes();
        return await sock.sendMessage(chatId, {
          text: `*\u{1F4DD} AUTO BIO SETTINGS*

*Status:* ${autoBioSettings.enabled ? "\u2705 Enabled" : "\u274C Disabled"}
*Custom Bio:* ${autoBioSettings.customBio ? "Set" : "Default"}
*Quotes Loaded:* ${quotes.length}
*Update Interval:* Every 10 minute

*Commands:*
\u2022 \`.setbio on\` - Enable auto bio
\u2022 \`.setbio off\` - Disable auto bio
\u2022 \`.setbio set <text>\` - Set custom bio
\u2022 \`.setbio reset\` - Reset to default bio
\u2022 \`.setbio preview\` - Preview random quote

*Default Bio:*
{quote}
\u{1F48E} MEGA-MD

*Custom Bio:*
${autoBioSettings.customBio || "Not set"}

*Note:* Use \`{quote}\` in custom bio to insert random quotes.

*Sources:*
\u2022 Famous Quotes
\u2022 Motivational Quotes
\u2022 Pickup Lines`
        }, { quoted: message });
      }
      if (action === "preview") {
        const quotes = await fetchQuotes();
        const randomQuote = getRandomQuote(quotes);
        return await sock.sendMessage(chatId, {
          text: `*\u{1F4DD} Preview Quote*

${randomQuote}

\u{1F48E} MEGA-MD

_This is how your bio will look with random quotes_`
        }, { quoted: message });
      }
      if (action === "on") {
        if (autoBioSettings.enabled) {
          return await sock.sendMessage(chatId, {
            text: "\u26A0\uFE0F *Auto bio is already enabled*"
          }, { quoted: message });
        }
        autoBioSettings.enabled = true;
        await store.saveSetting("global", "autoBio", autoBioSettings);
        startAutoBio(sock);
        return await sock.sendMessage(chatId, {
          text: "\u2705 *Auto bio enabled!*\n\nYour bio will now update every 1 minute with random quotes from:\n\u2022 Islamic Quotes\n\u2022 Motivational Quotes\n\u2022 Pickup Lines"
        }, { quoted: message });
      }
      if (action === "off") {
        if (!autoBioSettings.enabled) {
          return await sock.sendMessage(chatId, {
            text: "\u26A0\uFE0F *Auto bio is already disabled*"
          }, { quoted: message });
        }
        autoBioSettings.enabled = false;
        await store.saveSetting("global", "autoBio", autoBioSettings);
        stopAutoBio();
        return await sock.sendMessage(chatId, {
          text: "\u274C *Auto bio disabled!*\n\nYour bio will no longer auto-update."
        }, { quoted: message });
      }
      if (action === "set") {
        let customBio = null;
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
          customBio = quoted.conversation || quoted.extendedTextMessage?.text || null;
        } else {
          customBio = args.slice(1).join(" ").trim();
        }
        if (!customBio) {
          return await sock.sendMessage(chatId, {
            text: "\u274C *Please provide bio text!*\n\n*Usage:*\n\u2022 `.setbio set Your bio here`\n\u2022 Reply to a message with `.setbio set`\n\n*Tip:* Use `{quote}` to insert random quotes in your bio."
          }, { quoted: message });
        }
        autoBioSettings.customBio = customBio;
        await store.saveSetting("global", "autoBio", autoBioSettings);
        if (autoBioSettings.enabled) {
          await updateAutoBio(sock);
        }
        return await sock.sendMessage(chatId, {
          text: `\u2705 *Custom bio set!*

*Your bio:*
${customBio}

${autoBioSettings.enabled ? "\u2705 Auto bio is enabled - Bio updated!" : "\u26A0\uFE0F Auto bio is disabled - Use `.setbio on` to enable"}`
        }, { quoted: message });
      }
      if (action === "reset") {
        autoBioSettings.customBio = null;
        await store.saveSetting("global", "autoBio", autoBioSettings);
        if (autoBioSettings.enabled) {
          await updateAutoBio(sock);
        }
        return await sock.sendMessage(chatId, {
          text: "\u2705 *Bio reset to default!*\n\n*Default bio:*\n{quote}\n\u{1F48E} MEGA-MD"
        }, { quoted: message });
      }
      return await sock.sendMessage(chatId, {
        text: "\u274C *Invalid command!*\n\nUse `.setbio` to see available options."
      }, { quoted: message });
    } catch (error) {
      console.error("SetBio Error:", error);
      await sock.sendMessage(chatId, {
        text: `\u274C *Error:* ${error.message}`
      }, { quoted: message });
    }
  },
  startAutoBio,
  stopAutoBio,
  updateAutoBio
};
export {
  setbio_default as default,
  startAutoBio
};
