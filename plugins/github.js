import moment from "moment-timezone";
import fs from "fs";
import path from "path";
var github_default = {
  command: "script",
  aliases: ["repo", "sc"],
  category: "info",
  description: "Get information about the MEGA-MDX GitHub repository",
  usage: ".script",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const res = await fetch("https://api.github.com/repos/GlobalTechInfo/MEGA-MDX");
      if (!res.ok) throw new Error("Error fetching repository data");
      const json = await res.json();
      let txt = `*\u4E42  MEGA MDX  \u4E42*

`;
      txt += `\u2729  *Name* : ${json.name}
`;
      txt += `\u2729  *Watchers* : ${json.watchers_count}
`;
      txt += `\u2729  *Size* : ${(json.size / 1024).toFixed(2)} MB
`;
      txt += `\u2729  *Last Updated* : ${moment(json.updated_at).format("DD/MM/YY - HH:mm:ss")}
`;
      txt += `\u2729  *URL* : ${json.html_url}
`;
      txt += `\u2729  *Forks* : ${json.forks_count}
`;
      txt += `\u2729  *Stars* : ${json.stargazers_count}

`;
      txt += `\u{1F4A5} *MEGA MD*`;
      const imgPath = path.join(process.cwd(), "assets/thumb.png");
      const imgBuffer = fs.readFileSync(imgPath);
      await sock.sendMessage(chatId, { image: imgBuffer, caption: txt }, { quoted: message });
    } catch (error) {
      console.error("Error in github command:", error);
      await sock.sendMessage(chatId, { text: "\u274C Error fetching repository information." }, { quoted: message });
    }
  }
};
export {
  github_default as default
};
