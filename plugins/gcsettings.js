var gcsettings_default = {
  command: "gcset",
  aliases: ["gsetting", "groupset", "gpset"],
  category: "group admin",
  description: "Change group settings (lock/unlock messages or settings)",
  usage: ".gcset <setting>",
  groupOnly: true,
  adminOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const channelInfo = context.channelInfo || {};
    const isBotAdmin = context.isBotAdmin || false;
    if (!isBotAdmin) {
      return await sock.sendMessage(chatId, {
        text: `\u274C Bot needs to be an admin to change group settings.`,
        ...channelInfo
      }, { quoted: message });
    }
    const setting = args[0]?.toLowerCase();
    if (!setting) {
      return await sock.sendMessage(chatId, {
        text: `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551\u2699\uFE0F *GROUP SETTINGS*   \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

\u{1F4CC} *Usage:* \`.gcset <option>\`

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
*\u{1F4AC} MESSAGE PERMISSIONS*
\u{1F512} *lock* \u2014 Only admins can send messages

\u{1F513} *unlock* \u2014 Everyone can send messages

*\u{1F6E0}\uFE0F SETTINGS PERMISSIONS*
\u{1F512} *lockset* \u2014 Only admins can edit group info

\u{1F513} *unlockset* \u2014 Everyone can edit group info
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`,
        ...channelInfo
      }, { quoted: message });
    }
    const settingsMap = {
      lock: { value: "announcement", label: "\u{1F512} Only admins can send messages" },
      unlock: { value: "not_announcement", label: "\u{1F513} Everyone can send messages" },
      lockset: { value: "locked", label: "\u{1F512} Only admins can edit group info" },
      unlockset: { value: "unlocked", label: "\u{1F513} Everyone can edit group info" }
    };
    const config = settingsMap[setting];
    if (!config) {
      return await sock.sendMessage(chatId, {
        text: `\u274C Unknown setting: *${setting}*

Use \`.groupsettings\` to see options.`,
        ...channelInfo
      }, { quoted: message });
    }
    try {
      await sock.groupSettingUpdate(chatId, config.value);
      return await sock.sendMessage(chatId, {
        text: `\u2705 ${config.label}`,
        ...channelInfo
      }, { quoted: message });
    } catch (e) {
      console.error("[GROUPSETTINGS] Error:", e.message);
      return await sock.sendMessage(chatId, {
        text: `\u274C Failed to update setting: ${e.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  gcsettings_default as default
};
