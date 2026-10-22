import { channelInfo } from "../lib/messageConfig.js";
const extractPhoneNumber = (jid) => {
  if (!jid) return null;
  const number = jid.replace("@s.whatsapp.net", "").replace("@lid", "").replace("@g.us", "").split(":")[0];
  if (number.length < 10 && jid.includes("@lid")) return null;
  return number;
};
const _getDisplayName = async (jid, sock, pushName) => {
  try {
    if (pushName?.trim()) return pushName.trim();
    if (sock.store?.contacts?.[jid]) {
      const contact = sock.store.contacts[jid];
      if (contact.name || contact.notify) return contact.name || contact.notify;
    }
    const phone = extractPhoneNumber(jid);
    if (phone && phone.length >= 10) return `+${phone}`;
    return jid.split("@")[0].split(":")[0];
  } catch {
    return jid.split("@")[0].split(":")[0];
  }
};
const TRAITS = [
  "Intelligent",
  "Creative",
  "Determined",
  "Ambitious",
  "Caring",
  "Charismatic",
  "Confident",
  "Empathetic",
  "Energetic",
  "Friendly",
  "Generous",
  "Honest",
  "Humorous",
  "Imaginative",
  "Independent",
  "Intuitive",
  "Kind",
  "Logical",
  "Loyal",
  "Optimistic",
  "Passionate",
  "Patient",
  "Persistent",
  "Reliable",
  "Resourceful",
  "Sincere",
  "Thoughtful",
  "Understanding",
  "Versatile",
  "Wise"
];
var character_default = {
  command: "character",
  aliases: ["personality", "traits"],
  category: "group",
  description: "Analyze someone's character traits",
  usage: ".character @user",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const ctx = message.message?.extendedTextMessage?.contextInfo;
    let userJid = ctx?.mentionedJid?.[0] || ctx?.participant || message.key.participant;
    if (!userJid) {
      return sock.sendMessage(chatId, {
        text: "\u274C Please mention someone or reply to their message to analyze their character!",
        ...channelInfo
      }, { quoted: message });
    }
    if (userJid.includes("@lid") && sock.store?.contacts) {
      const resolved = Object.keys(sock.store.contacts).find(
        (k) => sock.store.contacts[k]?.lid === userJid
      );
      if (resolved) userJid = resolved;
    }
    try {
      let profilePic;
      try {
        profilePic = await sock.profilePictureUrl(userJid, "image");
      } catch {
        profilePic = "https://i.imgur.com/2wzGhpF.jpeg";
      }
      let displayName;
      if (userJid.includes("@lid")) {
        const fromContacts = sock.store?.contacts?.[userJid];
        displayName = fromContacts?.name || fromContacts?.notify || "Unknown User";
      } else {
        displayName = await sock.getName(userJid) || "+" + userJid.replace("@s.whatsapp.net", "");
      }
      const numTraits = Math.floor(Math.random() * 3) + 3;
      const selected = [];
      while (selected.length < numTraits) {
        const t = TRAITS[Math.floor(Math.random() * TRAITS.length)];
        if (!selected.includes(t)) selected.push(t);
      }
      const traitLines = selected.map((t) => `\u2022 ${t}: ${Math.floor(Math.random() * 41) + 60}%`);
      const analysis = `\u{1F52E} *Character Analysis* \u{1F52E}

\u{1F464} *User:* ${displayName}

\u2728 *Key Traits:*
${traitLines.join("\n")}

\u{1F3AF} *Overall Rating:* ${Math.floor(Math.random() * 21) + 80}%

_Note: This is a fun analysis, don't take it seriously!_`;
      await sock.sendMessage(chatId, {
        image: { url: profilePic },
        caption: analysis,
        mentions: [userJid],
        ...channelInfo
      }, { quoted: message });
    } catch {
      await sock.sendMessage(chatId, {
        text: "\u274C Failed to analyze character! Try again later.",
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  character_default as default
};
