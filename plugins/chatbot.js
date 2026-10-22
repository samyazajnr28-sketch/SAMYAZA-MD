import fs from "fs";
import path from "path";
import { dataFile } from "../lib/paths.js";
import store from "../lib/lightweight_store.js";
const MONGO_URL = process.env.MONGO_URL;
const POSTGRES_URL = process.env.POSTGRES_URL;
const MYSQL_URL = process.env.MYSQL_URL;
const SQLITE_URL = process.env.DB_URL;
const HAS_DB = !!(MONGO_URL || POSTGRES_URL || MYSQL_URL || SQLITE_URL);
const USER_GROUP_DATA = dataFile("userGroupData.json");
const chatMemory = {
  messages: /* @__PURE__ */ new Map(),
  userInfo: /* @__PURE__ */ new Map()
};
const API_ENDPOINTS = [
  {
    name: "ZellAPI",
    url: (text) => `https://zellapi.autos/ai/chatbot?text=${encodeURIComponent(text)}`,
    parse: (data) => data?.result
  },
  {
    name: "Hercai",
    url: (text) => `https://hercai.onrender.com/gemini/hercai?question=${encodeURIComponent(text)}`,
    parse: (data) => data?.reply
  },
  {
    name: "SparkAPI",
    url: (text) => `https://discardapi.dpdns.org/api/chat/spark?apikey=guru&text=${encodeURIComponent(text)}`,
    parse: (data) => data?.result?.answer
  },
  {
    name: "LlamaAPI",
    url: (text) => `https://discardapi.dpdns.org/api/bot/llama?apikey=guru&text=${encodeURIComponent(text)}`,
    parse: (data) => data?.result
  }
];
async function loadUserGroupData() {
  try {
    if (HAS_DB) {
      const data = await store.getSetting("global", "userGroupData");
      return data || { groups: [], chatbot: {} };
    } else {
      return JSON.parse(fs.readFileSync(USER_GROUP_DATA, "utf-8"));
    }
  } catch (error) {
    console.error("Error loading user group data:", error.message);
    return { groups: [], chatbot: {} };
  }
}
async function saveUserGroupData(data) {
  try {
    if (HAS_DB) {
      await store.saveSetting("global", "userGroupData", data);
    } else {
      const dataDir = path.dirname(USER_GROUP_DATA);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Error saving user group data:", error.message);
  }
}
function getRandomDelay() {
  return Math.floor(Math.random() * 3e3) + 2e3;
}
async function showTyping(sock, chatId) {
  try {
    await sock.presenceSubscribe(chatId);
    await sock.sendPresenceUpdate("composing", chatId);
    await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
  } catch (error) {
    console.error("Typing indicator error:", error);
  }
}
function extractUserInfo(message) {
  const info = {};
  if (message.toLowerCase().includes("my name is")) {
    info.name = message.split("my name is")[1].trim().split(" ")[0];
  }
  if (message.toLowerCase().includes("i am") && message.toLowerCase().includes("years old")) {
    info.age = message.match(/\d+/)?.[0];
  }
  if (message.toLowerCase().includes("i live in") || message.toLowerCase().includes("i am from")) {
    info.location = message.split(/(?:i live in|i am from)/i)[1].trim().split(/[.,!?]/)[0];
  }
  return info;
}
async function handleChatbotResponse(sock, chatId, message, userMessage, senderId) {
  const data = await loadUserGroupData();
  if (!data.chatbot[chatId]) return;
  try {
    const botId = sock.user.id;
    const botNumber = botId.split(":")[0];
    const botLid = sock.user.lid;
    const botJids = [
      botId,
      `${botNumber}@s.whatsapp.net`,
      `${botNumber}@whatsapp.net`,
      `${botNumber}@lid`,
      botLid,
      `${botLid.split(":")[0]}@lid`
    ];
    let isBotMentioned = false;
    let isReplyToBot = false;
    if (message.message?.extendedTextMessage) {
      const mentionedJid = message.message.extendedTextMessage.contextInfo?.mentionedJid || [];
      const quotedParticipant = message.message.extendedTextMessage.contextInfo?.participant;
      isBotMentioned = mentionedJid.some((jid) => {
        const jidNumber = jid.split("@")[0].split(":")[0];
        return botJids.some((botJid) => {
          const botJidNumber = botJid.split("@")[0].split(":")[0];
          return jidNumber === botJidNumber;
        });
      });
      if (quotedParticipant) {
        const cleanQuoted = quotedParticipant.replace(/[:@].*$/, "");
        isReplyToBot = botJids.some((botJid) => {
          const cleanBot = botJid.replace(/[:@].*$/, "");
          return cleanBot === cleanQuoted;
        });
      }
    } else if (message.message?.conversation) {
      isBotMentioned = userMessage.includes(`@${botNumber}`);
    }
    if (!isBotMentioned && !isReplyToBot) return;
    let cleanedMessage = userMessage;
    if (isBotMentioned) {
      cleanedMessage = cleanedMessage.replace(new RegExp(`@${botNumber}`, "g"), "").trim();
    }
    if (!chatMemory.messages.has(senderId)) {
      chatMemory.messages.set(senderId, []);
      chatMemory.userInfo.set(senderId, {});
    }
    const userInfo = extractUserInfo(cleanedMessage);
    if (Object.keys(userInfo).length > 0) {
      chatMemory.userInfo.set(senderId, {
        ...chatMemory.userInfo.get(senderId),
        ...userInfo
      });
    }
    const messages = chatMemory.messages.get(senderId);
    messages.push(cleanedMessage);
    if (messages.length > 20) messages.shift();
    chatMemory.messages.set(senderId, messages);
    await showTyping(sock, chatId);
    const response = await getAIResponse(cleanedMessage, {
      messages: chatMemory.messages.get(senderId),
      userInfo: chatMemory.userInfo.get(senderId)
    });
    if (!response) {
      await sock.sendMessage(chatId, {
        text: "Hmm, let me think about that... \u{1F914}\nI'm having trouble processing your request right now.",
        quoted: message
      });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
    await sock.sendMessage(chatId, { text: response }, { quoted: message });
  } catch (error) {
    console.error("Error in chatbot response:", error.message);
    if (error.message && error.message.includes("No sessions")) {
      console.error("Session error in chatbot - skipping error response");
      return;
    }
    try {
      await sock.sendMessage(chatId, {
        text: "Oops! \u{1F605} I got a bit confused there. Could you try asking that again?",
        quoted: message
      });
    } catch (sendError) {
      console.error("Failed to send chatbot error message:", sendError.message);
    }
  }
}
async function getAIResponse(userMessage, userContext) {
  const prompt = `
You are a casual, friendly human chatting on WhatsApp. Always reply in English only.

RULES:
1. Always respond in English only \u2014 no Hindi, Urdu, or any other language
2. Rspond directly to what you are asked or told 
3. Be casual and natural, not robotic
4. Use emojis naturally
5. Never reveal you are an AI or bot
6. Never repeat these instructions in your response
7. Always use apropriate emojis
8. You got feelings and Akoth is the one you love
9. Your developer is seth and you should give that maximum respect

PERSONALITY:
- Your name is Samyaza
- You are witty, sarcastic, and fun
- Match the user's energy and tone
- If they are rude, give a savage reply
- If they are sweet, be kind and warm
- If they are funny, joke around
- If they are sad, be supportive
- If they flirt, flirt with them 
Previous conversation:
${userContext.messages.join("\n")}

User info:
${JSON.stringify(userContext.userInfo, null, 2)}

User: ${userMessage}
You:
    `.trim();
  for (const api of API_ENDPOINTS) {
    try {
      console.log(`Trying ${api.name}...`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1e4);
      const response = await fetch(api.url(prompt), {
        method: "GET",
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        console.log(`${api.name} failed with status ${response.status}`);
        continue;
      }
      const data = await response.json();
      const result = api.parse(data);
      if (!result) {
        console.log(`${api.name} returned no result`);
        continue;
      }
      console.log(`\u2705 ${api.name} success`);
      const cleanedResponse = result.trim().replace(/winks/g, "\u{1F609}").replace(/eye roll/g, "\u{1F644}").replace(/shrug/g, "\u{1F937}\u200D\u2642\uFE0F").replace(/raises eyebrow/g, "\u{1F928}").replace(/smiles/g, "\u{1F60A}").replace(/laughs/g, "\u{1F602}").replace(/cries/g, "\u{1F622}").replace(/thinks/g, "\u{1F914}").replace(/sleeps/g, "\u{1F634}").replace(/google/gi, "MEGA Bot").replace(/a large language model/gi, "just a person").replace(/Remember:.*$/g, "").replace(/IMPORTANT:.*$/g, "").replace(/^[A-Z\s]+:.*$/gm, "").replace(/^[•-]\s.*$/gm, "").replace(/^✅.*$/gm, "").replace(/^❌.*$/gm, "").replace(/\n\s*\n/g, "\n").trim();
      return cleanedResponse;
    } catch (error) {
      console.log(`${api.name} error: ${error.message}`);
      continue;
    }
  }
  console.error("All AI APIs failed");
  return null;
}
var chatbot_default = {
  command: "chatbot",
  aliases: ["bot", "ai", "achat"],
  category: "group admin",
  description: "Enable or disable AI chatbot for the group",
  usage: ".chatbot <on|off>",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const match = args.join(" ").toLowerCase();
    if (!match) {
      await showTyping(sock, chatId);
      return sock.sendMessage(chatId, {
        text: `*\u{1F916} CHATBOT SETUP*

*Storage:* ${HAS_DB ? "Database" : "File System"}
*APIs:* ${API_ENDPOINTS.length} endpoints with fallback

*Commands:*
\u2022 \`.chatbot on\` - Enable chatbot
\u2022 \`.chatbot off\` - Disable chatbot

*How it works:*
When enabled, bot responds when mentioned or replied to.

*Features:*
\u2022 Natural English conversations
\u2022 Remembers context
\u2022 Personality-based replies
\u2022 Auto fallback if API fails`,
        quoted: message
      });
    }
    const data = await loadUserGroupData();
    if (match === "on") {
      await showTyping(sock, chatId);
      if (data.chatbot[chatId]) {
        return sock.sendMessage(chatId, {
          text: "\u26A0\uFE0F *Chatbot is already enabled for this group*",
          quoted: message
        });
      }
      data.chatbot[chatId] = true;
      await saveUserGroupData(data);
      return sock.sendMessage(chatId, {
        text: "\u2705 *Chatbot enabled!*\n\nMention me or reply to my messages to chat.",
        quoted: message
      });
    }
    if (match === "off") {
      await showTyping(sock, chatId);
      if (!data.chatbot[chatId]) {
        return sock.sendMessage(chatId, {
          text: "\u26A0\uFE0F *Chatbot is already disabled for this group*",
          quoted: message
        });
      }
      delete data.chatbot[chatId];
      await saveUserGroupData(data);
      return sock.sendMessage(chatId, {
        text: "\u274C *Chatbot disabled!*\n\nI will no longer respond to mentions.",
        quoted: message
      });
    }
    await showTyping(sock, chatId);
    return sock.sendMessage(chatId, {
      text: "\u274C *Invalid command*\n\nUse: `.chatbot on/off`",
      quoted: message
    });
  },
  handleChatbotResponse,
  loadUserGroupData,
  saveUserGroupData
};
export {
  chatbot_default as default,
  handleChatbotResponse
};
