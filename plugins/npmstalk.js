import pkg from "api-qasim";
const QasimAny = pkg;
var npmstalk_default = {
  command: "npmstalk",
  aliases: ["npmstlk"],
  category: "stalk",
  description: "Get details about an NPM package",
  usage: ".npmstalk <package-name>",
  async handler(sock, message, args, context) {
    const { chatId } = context;
    if (!args[0]) {
      return await sock.sendMessage(chatId, {
        text: `\u2733\uFE0F Please provide an NPM package name.

Example:
.npmstalk axios`
      }, { quoted: message });
    }
    try {
      const res = await QasimAny.npmStalk(args[0]);
      if (!res || !res.result) {
        throw new Error("Package not found or API error.");
      }
      const data = res.result;
      const authorName = typeof data.author === "object" ? data.author.name : data.author || "Unknown";
      const versionCount = data.versions ? Object.keys(data.versions).length : 0;
      let te = `\u250C\u2500\u2500\u300C *NPM PACKAGE INFO* \u300D
`;
      te += `\u25A2 *\u{1F516}Name:* ${data.name}
`;
      te += `\u25A2 *\u{1F516}Creator:* ${authorName}
`;
      te += `\u25A2 *\u{1F465}Total Versions:* ${versionCount}
`;
      te += `\u25A2 *\u{1F4CC}Description:* ${data.description || "No description"}
`;
      te += `\u25A2 *\u{1F9E9}Repository:* ${data.repository?.url || "No repository available"}
`;
      te += `\u25A2 *\u{1F30D}Homepage:* ${data.homepage || "No homepage available"}
`;
      te += `\u25A2 *\u{1F3F7}\uFE0FLatest:* ${data["dist-tags"]?.latest || "N/A"}
`;
      te += `\u25A2 *\u{1F517}Link:* https://npmjs.com/package/${data.name}
`;
      te += `\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`;
      await sock.sendMessage(chatId, { text: te }, { quoted: message });
    } catch (error) {
      console.error("NPM Stalk Error:", error);
      await sock.sendMessage(chatId, { text: `\u2733\uFE0F Error: Package not found or API issue.` }, { quoted: message });
    }
  }
};
export {
  npmstalk_default as default
};
