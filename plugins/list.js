import config from "../config.js";
import commandHandler from "../lib/commandHandler.js";
import path from "path";
import fs from "fs";
function formatTime() {
  const now = /* @__PURE__ */ new Date();
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: config.timeZone || "UTC"
  };
  return now.toLocaleTimeString("en-US", options);
}
const menuStyles = [
  {
    render({ _title, info, categories, prefix }) {
      let t = `\u256D\u2501\u2501\u300E *MEGA MENU* \u300F\u2501\u2B23
`;
      t += `\u2503 \u2728 *Bot: ${info.bot}*
`;
      t += `\u2503 \u{1F527} *Prefix: ${info.prefix}*
`;
      t += `\u2503 \u{1F4E6} *Plugin: ${info.total}*
`;
      t += `\u2503 \u{1F48E} *Version: ${info.version}*
`;
      t += `\u2503 \u23F0 *Time: ${info.time}*
`;
      for (const [cat, cmds] of categories) {
        t += `\u2503\u2501\u2501\u2501 *${cat.toUpperCase()}* \u2501\u2726
`;
        for (const c of cmds)
          t += `\u2503 \u27A4 ${prefix}${c}
`;
      }
      t += `\u2570\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2B23`;
      return t;
    }
  },
  {
    render({ _title, info, categories, prefix }) {
      let t = `\u25C8\u256D\u2500\u274D\u300C *MEGA MENU* \u300D\u274D
`;
      t += `\u25C8\u251C\u2022 \u{1F31F} *Bot: ${info.bot}*
`;
      t += `\u25C8\u251C\u2022 \u2699\uFE0F *Prefix: ${info.prefix}*
`;
      t += `\u25C8\u251C\u2022 \u{1F36B} *Plugins: ${info.total}*
`;
      t += `\u25C8\u251C\u2022 \u{1F48E} *Version: ${info.version}*
`;
      t += `\u25C8\u251C\u2022 \u23F0 *Time: ${info.time}*
`;
      for (const [cat, cmds] of categories) {
        t += `\u25C8\u251C\u2500\u274D\u300C *${cat.toUpperCase()}* \u300D\u274D
`;
        for (const c of cmds)
          t += `\u25C8\u251C\u2022 ${prefix}${c}
`;
      }
      t += `\u25C8\u2570\u2500\u2500\u2605\u2500\u2606\u2500\u2500\u266A\u266A\u2500\u274D`;
      return t;
    }
  },
  {
    render({ _title, info, categories, prefix }) {
      let t = `\u250F\u2501\u2501\u2501\u2501 *MEGA MENU* \u2501\u2501\u2501\u2513
`;
      t += `\u2503\u2022 *Bot : ${info.bot}*
`;
      t += `\u2503\u2022 *Prefixes : ${info.prefix}*
`;
      t += `\u2503\u2022 *Plugins : ${info.total}*
`;
      t += `\u2503\u2022 *Version : ${info.version}*
`;
      t += `\u2503\u2022 *Time : ${info.time}*
`;
      for (const [cat, cmds] of categories) {
        t += `\u2503\u2501\u2501\u2501\u2501 *${cat.toUpperCase()}* \u2501\u2501\u25C6
`;
        for (const c of cmds)
          t += `\u2503 \u25B8 ${prefix}${c}
`;
      }
      t += `\u2517\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u251B`;
      return t;
    }
  },
  {
    render({ _title, info, categories, prefix }) {
      let t = `\u2726\u2550\u2550\u2550 *MEGA MENU* \u2550\u2550\u2550\u2726
`;
      t += `\u2551\u27A9 *Bot: ${info.bot}*
`;
      t += `\u2551\u27A9 *Prefixes: ${info.prefix}*
`;
      t += `\u2551\u27A9 *Plugins: ${info.total}*
`;
      t += `\u2551\u27A9 *Version: ${info.version}*
`;
      t += `\u2551\u27A9 *Time: ${info.time}*
`;
      for (const [cat, cmds] of categories) {
        t += `\u2551\u2550\u2550 *${cat.toUpperCase()}* \u2550\u2550\u2727
`;
        for (const c of cmds)
          t += `\u2551 \u2726 ${prefix}${c}
`;
      }
      t += `\u2726\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2726`;
      return t;
    }
  },
  {
    render({ _title, info, categories, prefix }) {
      let t = `\u2740\u2501\u2501\u2501 *MEGA MENU* \u2501\u2501\u2501\u2740
`;
      t += `\u2503\u261E *Bot: ${info.bot}*
`;
      t += `\u2503\u261E *Prefixes: ${info.prefix}*
`;
      t += `\u2503\u261E *Plugins: ${info.total}*
`;
      t += `\u2503\u261E *Version: ${info.version}*
`;
      t += `\u2503\u261E *Time: ${info.time}*
`;
      for (const [cat, cmds] of categories) {
        t += `\u2503\u2501\u2501\u2501\u3014 *${cat.toUpperCase()}* \u3015\u2501\u2740
`;
        for (const c of cmds)
          t += `\u2503\u261E ${prefix}${c}
`;
      }
      t += `\u2740\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2740`;
      return t;
    }
  },
  {
    render({ _title, info, categories, prefix }) {
      let t = `\u25C6\u2501\u2501\u2501 *MEGA MENU* \u2501\u2501\u2501\u25C6
`;
      t += `\u2503 \xA4 *Bot: ${info.bot}*
`;
      t += `\u2503 \xA4 *Prefixes: ${info.prefix}*
`;
      t += `\u2503 \xA4 *Plugins: ${info.total}*
`;
      t += `\u2503 \xA4 *Version: ${info.version}*
`;
      t += `\u2503 \xA4 *Time: ${info.time}*
`;
      for (const [cat, cmds] of categories) {
        t += `\u2503\u2501\u2501 *${cat.toUpperCase()}* \u2501\u2501\u25C6\u25C6
`;
        for (const c of cmds)
          t += `\u2503 \xA4 ${prefix}${c}
`;
      }
      t += `\u25C6\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u25C6`;
      return t;
    }
  },
  {
    render({ _title, info, categories, prefix }) {
      let t = `\u256D\u2500\u2500\u2500\u2B23 *MEGA MENU* \u2500\u2500\u2B23
`;
      t += ` | \u25CF *Bot: ${info.bot}*
`;
      t += ` | \u25CF *Prefixes: ${info.prefix}*
`;
      t += ` | \u25CF *Plugins: ${info.total}*
`;
      t += ` | \u25CF *Version: ${info.version}*
`;
      t += ` | \u25CF *Time: ${info.time}*
`;
      for (const [cat, cmds] of categories) {
        t += ` |\u2500\u2500\u2500\u2B23 *${cat.toUpperCase()}* \u2500\u2500\u2B23
`;
        for (const c of cmds)
          t += ` | \u25CF ${prefix}${c}
`;
      }
      t += `\u2570\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2B23`;
      return t;
    }
  }
];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
var list_default = {
  command: "menu",
  aliases: ["help", "commands", "h", "list"],
  category: "general",
  description: "Show all commands",
  usage: ".menu [command]",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const prefix = config.prefixes[0];
    const imagePath = path.join(process.cwd(), "assets/thumb.png");
    if (args.length) {
      const searchTerm = args[0].toLowerCase();
      let cmd = commandHandler.commands.get(searchTerm);
      if (!cmd && commandHandler.aliases.has(searchTerm)) {
        const mainCommand = commandHandler.aliases.get(searchTerm);
        cmd = commandHandler.commands.get(mainCommand);
      }
      if (!cmd) {
        return sock.sendMessage(chatId, {
          text: `\u274C Command "${args[0]}" not found.

Use ${prefix}menu to see all commands.`,
          ...channelInfo
        }, { quoted: message });
      }
      const text2 = `\u256D\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2B23
\u2503 \u{1F4CC} *COMMAND INFO*
\u2503
\u2503 \u26A1 *Command:* ${prefix}${cmd.command}
\u2503 \u{1F4DD} *Desc:* ${cmd.description || "No description"}
\u2503 \u{1F4D6} *Usage:* ${cmd.usage || `${prefix}${cmd.command}`}
\u2503 \u{1F3F7}\uFE0F *Category:* ${cmd.category || "misc"}
\u2503 \u{1F516} *Aliases:* ${cmd.aliases?.length ? cmd.aliases.map((a) => prefix + a).join(", ") : "None"}
\u2503
\u2570\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2B23`;
      if (fs.existsSync(imagePath)) {
        return sock.sendMessage(chatId, {
          image: { url: imagePath },
          caption: text2,
          ...channelInfo
        }, { quoted: message });
      }
      return sock.sendMessage(chatId, { text: text2, ...channelInfo }, { quoted: message });
    }
    const style = pick(menuStyles);
    const text = style.render({
      title: config.botName,
      prefix,
      info: {
        bot: config.botName,
        prefix: config.prefixes.join(", "),
        total: commandHandler.commands.size,
        version: config.version || "6.0.0",
        time: formatTime()
      },
      categories: commandHandler.categories
    });
    if (fs.existsSync(imagePath)) {
      await sock.sendMessage(chatId, {
        image: { url: imagePath },
        caption: text,
        ...channelInfo
      }, { quoted: message });
    } else {
      await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    }
  }
};
export {
  list_default as default
};
