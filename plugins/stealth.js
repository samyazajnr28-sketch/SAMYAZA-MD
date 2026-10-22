import store from "../lib/lightweight_store.js";
var stealth_default = {
  command: "stealth",
  aliases: ["stealthmode"],
  category: "automation",
  description: "Toggle online status - bot will not send presence updates if off",
  usage: ".stealth <on|off>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const { chatId } = context;
    const action = args[0]?.toLowerCase();
    if (!action || !["on", "off"].includes(action)) {
      const currentState = await store.getSetting("global", "stealthMode");
      const status = currentState?.enabled ? "ON" : "OFF";
      let autotypingWarning = "";
      try {
        const autotypingState = await store.getSetting("global", "autotyping");
        if (autotypingState?.enabled && currentState?.enabled) {
          autotypingWarning = "\n\n\u26A0\uFE0F *Autotyping is enabled* but will be blocked by stealth mode.";
        }
      } catch (e) {
      }
      let autoreadWarning = "";
      try {
        const autoreadState = await store.getSetting("global", "autoread");
        if (autoreadState?.enabled && currentState?.enabled) {
          autoreadWarning = "\n\u26A0\uFE0F *Autoread is enabled* but will be blocked by stealth mode.";
        }
      } catch (e) {
      }
      return await sock.sendMessage(chatId, {
        text: `\u{1F47B} *Stealth Mode Status:* ${status}

*Usage:* .stealth <on|off>

*What it does:*
\u2022 Blocks all presence updates (typing, online, last seen)
\u2022 Makes the bot completely invisible

*When enabled:*
\u2713 No "typing..." indicator
\u2713 No "online" status
\u2713 Complete stealth mode${autotypingWarning}${autoreadWarning}`
      }, { quoted: message });
    }
    const enabled = action === "on";
    await store.saveSetting("global", "stealthMode", { enabled });
    let warnings = "";
    if (enabled) {
      try {
        const autotypingState = await store.getSetting("global", "autotyping");
        const autoreadState = await store.getSetting("global", "autoread");
        if (autotypingState?.enabled || autoreadState?.enabled) {
          warnings = "\n\n*\u26A0\uFE0F Note:*\n";
          if (autotypingState?.enabled) warnings += "\u2022 Autotyping is enabled but will be blocked\n";
          if (autoreadState?.enabled) warnings += "\u2022 Autoread is enabled but will be blocked\n";
        }
      } catch (e) {
      }
    }
    await sock.sendMessage(chatId, {
      text: `\u{1F47B} Stealth mode has been turned *${enabled ? "ON" : "OFF"}*

${enabled ? "\u2713 Bot is now in complete stealth mode\n\u2713 No presence updates\n\u2713 No typing indicators" : "\u2713 Presence updates enabled\n\u2713 Typing indicators enabled (if autotyping is on)"}${warnings}`
    }, { quoted: message });
  }
};
export {
  stealth_default as default
};
