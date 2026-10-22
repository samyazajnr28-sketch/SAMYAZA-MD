const privacySettings = {
  lastseen: { update: (sock, value) => sock.updateLastSeenPrivacy(value), label: "Last Seen", allowed: ["all", "contacts", "contact_blacklist", "blacklist", "none"] },
  online: { update: (sock, value) => sock.updateOnlinePrivacy(value), label: "Online Status", allowed: ["all", "match_last_seen"] },
  profile: { update: (sock, value) => sock.updateProfilePicturePrivacy(value), label: "Profile Picture", allowed: ["all", "contacts", "contact_blacklist", "blacklist", "none"] },
  status: { update: (sock, value) => sock.updateStatusPrivacy(value), label: "Status", allowed: ["all", "contacts", "contact_blacklist", "blacklist", "none"] },
  receipts: { update: (sock, value) => sock.updateReadReceiptsPrivacy(value), label: "Read Receipts", allowed: ["all", "none"] },
  groups: { update: (sock, value) => sock.updateGroupsAddPrivacy(value), label: "Groups Add", allowed: ["all", "contacts", "contact_blacklist", "blacklist"] }
};

const privacyMenu = `🔐 *PRIVACY SETTINGS*

*Privacy controls*
• lastseen — all / contacts / blacklist / none
• online — all / match_last_seen
• profile — all / contacts / blacklist / none
• status — all / contacts / blacklist / none
• receipts — all / none
• groups — all / contacts / blacklist
• timer — off / 24h / 7d / 90d

*Block controls*
• block <number> (or reply to their message)
• unblock <number> (or reply to their message)
• blocklist

*Examples*
.privacy lastseen all
.privacy receipts none
.privacy timer 7d
.privacy block 254700000000`;

export default {
  command: "privacy",
  aliases: [],
  category: "privacy",
  description: "Manage WhatsApp privacy settings and block controls",
  usage: ".privacy [setting] [value]",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const setting = args[0]?.toLowerCase();
    const value = args[1]?.toLowerCase();

    if (!setting) {
      return sock.sendMessage(chatId, { text: privacyMenu, ...channelInfo }, { quoted: message });
    }

    if (setting === "status") {
      try {
        const current = await sock.fetchPrivacySettings(true);
        const lines = [
          "🔐 *CURRENT PRIVACY SETTINGS*",
          `Last seen: ${current.last || "unknown"}`,
          `Online: ${current.online || "unknown"}`,
          `Profile picture: ${current.profile || "unknown"}`,
          `Status: ${current.status || "unknown"}`,
          `Read receipts: ${current.readreceipts || "unknown"}`,
          `Groups: ${current.groupadd || "unknown"}`
        ];
        return sock.sendMessage(chatId, { text: lines.join("\n"), ...channelInfo }, { quoted: message });
      } catch (error) {
        return sock.sendMessage(chatId, { text: `❌ Could not fetch privacy settings: ${error.message}`, ...channelInfo }, { quoted: message });
      }
    }

    if (setting === "blocklist") {
      try {
        const blocklist = await sock.fetchBlocklist();
        const text = blocklist?.length
          ? `🚫 *BLOCK LIST*\n\n${blocklist.map((jid, index) => `${index + 1}. +${jid.split("@")[0]}`).join("\n")}`
          : "📋 No blocked users.";
        return sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
      } catch (error) {
        return sock.sendMessage(chatId, { text: `❌ Could not fetch block list: ${error.message}`, ...channelInfo }, { quoted: message });
      }
    }

    if (setting === "block" || setting === "unblock") {
      const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;
      const number = (value || quotedParticipant?.split("@")[0]?.split(":")[0] || "").replace(/\D/g, "");
      const targetJid = number.length >= 7 ? `${number}@s.whatsapp.net` : null;
      if (!targetJid) {
        return sock.sendMessage(chatId, { text: "Provide a valid number or reply to that person's message." }, { quoted: message });
      }
      try {
        await sock.updateBlockStatus(targetJid, setting);
        return sock.sendMessage(chatId, { text: `✅ ${setting === "block" ? "Blocked" : "Unblocked"} +${number}`, ...channelInfo }, { quoted: message });
      } catch (error) {
        return sock.sendMessage(chatId, { text: `❌ Could not ${setting} this number: ${error.message}`, ...channelInfo }, { quoted: message });
      }
    }

    if (setting === "timer") {
      const durations = { off: 0, "0": 0, "24h": 86400, "1d": 86400, "7d": 604800, "1w": 604800, "90d": 7776000, "3m": 7776000 };
      if (!value || !Object.hasOwn(durations, value)) {
        return sock.sendMessage(chatId, { text: "Choose a timer: off, 24h, 7d, or 90d." }, { quoted: message });
      }
      try {
        await sock.updateDefaultDisappearingMode(durations[value]);
        return sock.sendMessage(chatId, { text: `✅ Disappearing-message timer updated: ${value}.`, ...channelInfo }, { quoted: message });
      } catch (error) {
        return sock.sendMessage(chatId, { text: `❌ Could not update timer: ${error.message}`, ...channelInfo }, { quoted: message });
      }
    }

    const config = privacySettings[setting];
    if (!config) {
      return sock.sendMessage(chatId, { text: `Unknown option: ${setting}. Use .privacy to see available options.`, ...channelInfo }, { quoted: message });
    }
    if (!value || !config.allowed.includes(value)) {
      return sock.sendMessage(chatId, { text: `Allowed values for ${setting}: ${config.allowed.filter(item => item !== "contact_blacklist").join(", ")}.`, ...channelInfo }, { quoted: message });
    }

    try {
      await config.update(sock, value === "blacklist" ? "contact_blacklist" : value);
      return sock.sendMessage(chatId, { text: `✅ ${config.label} privacy set to ${value}.`, ...channelInfo }, { quoted: message });
    } catch (error) {
      console.error("Privacy setting update failed:", error);
      return sock.sendMessage(chatId, { text: `❌ Could not update ${config.label}: ${error.message}`, ...channelInfo }, { quoted: message });
    }
  }
};
