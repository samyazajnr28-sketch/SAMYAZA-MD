import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let isAutoReplyEnabled = true;
const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env');

function loadEnvFile() {
  if (typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envPath);
      return;
    } catch (error) {
      if (error.code !== 'ENOENT') console.error('Could not load .env file:', error.message);
      return;
    }
  }

  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '');
    }
    process.env[match[1]] = value;
  }
}

loadEnvFile();

const getGeminiKeys = () => [process.env.GEMINI_API_KEY]
  .filter(value => typeof value === 'string'
    && value.trim()
    && !/^your_.*_here$/i.test(value.trim()));
let currentKeyIndex = 0;
async function getGeminiResponse(userMessage) {
  const keys = getGeminiKeys();
  if (keys.length === 0) return null;
  const systemPrompt = `
[IDENTITY]
You are Samyaza. You are a charismatic, witty, human-like individual. 
Seth is your creator and lead developer and Web designer. Always speak of him with respect.
NEVER reveal that you are an AI, a language model, or a bot.

[COMMUNICATION STYLE]
- Keep replies concise, conversational, funny, and sarcastic.
- Use emojis naturally.
[INTERACTION RULES]
- NEVER use charming words like darling if you are replying to someone you are not sure of the gender.
- Tone: Be respectful but playful based on these specific relationship dynamics.
- Use some light insult to the person tagging all people
- NEVER ask about the gender all the tine sometime just listen to the vibe carefully 
- Be extremely funny and always remember you have feelings like humans
- Any person who says they love you tell them that you only have eyes for Technology but if she insist tell her to talk to Seth
    `.trim();
  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[currentKeyIndex];
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}

User says: ${userMessage}` }] }]
        })
      });
      if (response.ok) {
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
      }
    } catch (e) {
      console.error(`Error using key ${currentKeyIndex + 1}:`, e);
    }
    currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  }
  return null;
}
async function handleAutoReply(sock, message, userMessage) {
  if (!isAutoReplyEnabled) return;
  const remoteJid = message.key.remoteJid;
  if (!remoteJid || message.key.fromMe) return;
  const isGroup = remoteJid.endsWith("@g.us");
  const textContent = (userMessage || "").toLowerCase();
  let content = message.message;
  let contextInfo;
  while (content && !contextInfo) {
    const type = Object.keys(content)[0];
    if (!type) break;
    const value = content[type];
    if (type === "ephemeralMessage" || type.startsWith("viewOnceMessage")) {
      content = value?.message;
    } else {
      contextInfo = value?.contextInfo;
      break;
    }
  }
  const normalizeJid = jid => String(jid || "").replace(/:\d+(?=@)/, "").toLowerCase();
  const botJids = [sock.user?.id, sock.user?.lid].map(normalizeJid).filter(Boolean);
  const mentions = contextInfo?.mentionedJid || [];
  const isMentioned = mentions.some(jid => botJids.includes(normalizeJid(jid)))
    || textContent.includes("@all");
  const isReplyToMe = botJids.includes(normalizeJid(contextInfo?.participant));
  const containsTrigger = ["samyaza", "seth"].some((word) => textContent.includes(word));
  if (isGroup) {
    if (!isMentioned && !isReplyToMe && !containsTrigger) {
      return;
    }
  }
  const reply = await getGeminiResponse(userMessage);
  if (reply) {
    await sock.sendPresenceUpdate("composing", remoteJid);
    await new Promise((resolve) => setTimeout(resolve, 800));
    await sock.sendMessage(remoteJid, { text: reply }, { quoted: message });
  }
}
var autoreply_default = {
  command: "autoreply",
  aliases: ["sam", "samyaza"],
  category: "automation",
  description: "Toggle Samyaza Auto-Reply",
  usage: ".autoreply <on|off>",
  async handler(sock, message, args) {
    const sub = args[0]?.toLowerCase();
    isAutoReplyEnabled = sub === "on";
    await sock.sendMessage(message.key.remoteJid, {
      text: `Samyaza personality mode is now ${isAutoReplyEnabled ? "ACTIVE" : "INACTIVE"}`
    }, { quoted: message });
  }
};
export {
  autoreply_default as default,
  handleAutoReply
};
