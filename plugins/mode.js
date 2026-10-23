import store from "../lib/lightweight_store.js";
async function modeCommand(sock, message, args, context) {
  const { chatId, channelInfo } = context;
  const isOwner = message.key.fromMe || context.isOwner;
  if (!isOwner) {
    return await sock.sendMessage(chatId, {
      text: "\u274C Only the owner of this connected WhatsApp number can change bot mode!",
      ...channelInfo
    }, { quoted: message });
  }
  const subCommand = args[0]?.toLowerCase();
  const currentMode = await store.getBotMode() || "public";
  if (!subCommand || subCommand === "status" || subCommand === "check") {
    const modeEmojis2 = {
      public: "\u{1F30D}",
      private: "\u{1F512}",
      groups: "\u{1F465}",
      inbox: "\u{1F4AC}",
      self: "\u{1F464}"
    };
    const modeDescriptions = {
      public: "Everyone can use bot (groups + private chats)",
      private: "Only the owner of this connected WhatsApp number can use bot",
      groups: "Only works in group chats (everyone in groups)",
      inbox: "Only works in private chats (everyone in DMs)",
      self: "Owner and sudo only (same as private)"
    };
    let statusText = `\u{1F4CA} *BOT MODE STATUS*

`;
    statusText += `Current Mode: ${modeEmojis2[currentMode]} *${currentMode.toUpperCase()}*
`;
    statusText += `Description: ${modeDescriptions[currentMode]}

`;
    statusText += `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

`;
    statusText += `*Available Modes:*

`;
    Object.entries(modeDescriptions).forEach(([mode, desc]) => {
      const current = mode === currentMode ? "\u2713 " : "";
      statusText += `${current}${modeEmojis2[mode]} \`${mode}\`
${desc}

`;
    });
    statusText += `*Usage:*
`;
    statusText += `\u2022 \`.mode <mode>\` - Change mode
`;
    statusText += `\u2022 \`.mode status\` - Show current mode

`;
    statusText += `*Examples:*
`;
    statusText += `\u2022 \`.mode public\` - Enable for everyone
`;
    statusText += `\u2022 \`.mode groups\` - Groups only
`;
    statusText += `\u2022 \`.mode inbox\` - Private chats only
`;
    statusText += `\u2022 \`.mode private\` - Owner/sudo only`;
    return await sock.sendMessage(chatId, {
      text: statusText,
      ...channelInfo
    }, { quoted: message });
  }
  const validModes = ["public", "private", "groups", "inbox", "self"];
  if (!validModes.includes(subCommand)) {
    return await sock.sendMessage(chatId, {
      text: `\u274C Invalid mode: *${subCommand}*

Valid modes: ${validModes.join(", ")}

Use \`.mode\` to see all available modes.`,
      ...channelInfo
    }, { quoted: message });
  }
  await store.setBotMode(subCommand);
  const modeEmojis = {
    public: "\u{1F30D}",
    private: "\u{1F512}",
    groups: "\u{1F465}",
    inbox: "\u{1F4AC}",
    self: "\u{1F464}"
  };
  const modeMessages = {
    public: "Bot is now accessible to *everyone* in groups and private chats.",
    private: "Bot is now restricted to *the connected owner only*.",
    groups: "Bot now works *only in group chats* (all group members can use it).",
    inbox: "Bot now works *only in private chats* (all users can DM the bot).",
    self: "Bot is now restricted to *owner and sudo users only*."
  };
  await sock.sendMessage(chatId, {
    text: `${modeEmojis[subCommand]} *Mode Changed to ${subCommand.toUpperCase()}*

${modeMessages[subCommand]}

_Use \`.mode status\` to check current mode._`,
    ...channelInfo
  }, { quoted: message });
}
var mode_default = {
  command: "mode",
  aliases: ["botmode", "setmode"],
  category: "owner",
  description: "Advanced bot access control - Set who can use the bot and where",
  usage: ".mode [public|private|groups|inbox|self|status]",
  ownerOnly: true,
  handler: modeCommand
};
export {
  mode_default as default
};
