import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);
var speedtest_default = {
  command: "speedtest",
  aliases: ["speed", "netspeed"],
  category: "utility",
  description: "Test internet speed of the server",
  usage: ".speedtest",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    await sock.sendMessage(chatId, {
      text: "\u{1F504} *Testing internet speed...*\n\nPlease wait, this may take a moment.",
      ...channelInfo
    }, { quoted: message });
    try {
      const { stdout, stderr } = await execAsync("python3 lib/speed.py", { timeout: 12e4 });
      const result = (stdout || stderr || "").trim();
      if (!result) {
        return await sock.sendMessage(chatId, {
          text: "\u274C No output from speed test.",
          ...channelInfo
        }, { quoted: message });
      }
      await sock.sendMessage(chatId, {
        text: result,
        ...channelInfo
      }, { quoted: message });
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C Speed test failed: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  speedtest_default as default
};
