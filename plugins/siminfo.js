import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
const execAsync = promisify(exec);
var siminfo_default = {
  command: "siminfo",
  aliases: ["phoneinfo", "numinfo", "carrier", "phinfo"],
  category: "utility",
  description: "Lookup phone number country, carrier and type",
  usage: ".siminfo <phone number with country code>\nExample: .siminfo +923001234567",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const input = args.join("").trim().replace(/\s+/g, "");
    if (!input) {
      return await sock.sendMessage(chatId, {
        text: `\u{1F4F1} *SIM / Phone Info*

*Usage:* \`.siminfo <number>\`

*Examples:*
\u2022 \`.siminfo +923001234567\` \u2014 Pakistan
\u2022 \`.siminfo +14155552671\` \u2014 USA
\u2022 \`.siminfo +447911123456\` \u2014 UK
\u2022 \`.siminfo +971501234567\` \u2014 UAE

\u2139\uFE0F Include country code with or without +`,
        ...channelInfo
      }, { quoted: message });
    }
    try {
      const scriptPath = path.join(process.cwd(), "lib", "siminfo.py");
      const { stdout } = await execAsync(`python3 "${scriptPath}" "${input}"`, { timeout: 1e4 });
      const data = JSON.parse(stdout.trim());
      if (data.error) {
        return await sock.sendMessage(chatId, {
          text: `\u274C ${data.error}`,
          ...channelInfo
        }, { quoted: message });
      }
      const validIcon = data.valid ? "\u2705" : "\u26A0\uFE0F";
      const carrierLine = data.carrier !== "Unknown" ? `
\u{1F4F6} *Carrier:* ${data.carrier}` : "";
      await sock.sendMessage(chatId, {
        text: `\u{1F4F1} *Phone Number Info*

\u{1F522} *Number:* ${data.number}
${data.flag} *Country:* ${data.country}
\u{1F30D} *Region:* ${data.region}
\u{1F3F7}\uFE0F *Country Code:* ${data.country_code}
\u{1F4DE} *National Number:* ${data.national_number}
\u{1F4E1} *Line Type:* ${data.line_type}${carrierLine}
${validIcon} *Valid:* ${data.valid ? "Yes" : "Possibly invalid (check length)"}`,
        ...channelInfo
      }, { quoted: message });
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C Lookup failed: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  siminfo_default as default
};
