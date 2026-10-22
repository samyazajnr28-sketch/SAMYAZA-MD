import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
const execAsync = promisify(exec);
var sysinfo_default = {
  command: "sysinfo",
  aliases: ["system", "serverstats", "serverinfo"],
  category: "owner",
  description: "Show detailed server system information",
  usage: ".sysinfo",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const fmt = (b) => b > 1073741824 ? (b / 1073741824).toFixed(2) + " GB" : (b / 1048576).toFixed(0) + " MB";
      const memTotal = fmt(totalMem);
      const memUsed = fmt(usedMem);
      const memFree = fmt(freeMem);
      let diskTotal = "N/A", diskUsed = "N/A", diskFree = "N/A", diskPct = "N/A";
      try {
        const diskOut = (await execAsync("df -h /")).stdout.trim();
        const diskVals = diskOut.split("\n")[1]?.split(/\s+/) || [];
        diskTotal = diskVals[1] || "N/A";
        diskUsed = diskVals[2] || "N/A";
        diskFree = diskVals[3] || "N/A";
        diskPct = diskVals[4] || "N/A";
      } catch {
      }
      const uptimeSec = Math.floor(process.uptime());
      const uptimeDays = Math.floor(uptimeSec / 86400);
      const uptimeHrs = Math.floor(uptimeSec % 86400 / 3600);
      const uptimeMins = Math.floor(uptimeSec % 3600 / 60);
      const uptimeSecs = uptimeSec % 60;
      const uptimeOut = uptimeDays > 0 ? `${uptimeDays}d ${uptimeHrs}h ${uptimeMins}m` : uptimeHrs > 0 ? `${uptimeHrs}h ${uptimeMins}m ${uptimeSecs}s` : `${uptimeMins}m ${uptimeSecs}s`;
      const cpus = os.cpus();
      const cpuModel = cpus[0]?.model?.trim() || "Unknown";
      const cpuCores = cpus.length;
      const loadAvg = os.loadavg().map((l) => l.toFixed(2)).join(", ");
      const platform = os.platform();
      const arch = os.arch();
      const nodeVer = process.version;
      const hostname = os.hostname();
      const text = `\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551     \u{1F5A5}\uFE0F  *SERVER STATS*        \u2551
\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D

\u{1F3E0} *Host:* ${hostname}
\u{1F427} *OS:* ${platform} (${arch})
\u23F1\uFE0F *Bot Uptime:* ${uptimeOut}
\u{1F7E2} *Node.js:* ${nodeVer}

\u2501\u2501\u2501\u2501\u2501\u2501 \u{1F9E0} CPU \u2501\u2501\u2501\u2501\u2501\u2501
\u{1F527} *Model:* ${cpuModel}
\u2699\uFE0F *Cores:* ${cpuCores}
\u{1F4CA} *Load Avg:* ${loadAvg}

\u2501\u2501\u2501\u2501\u2501\u2501 \u{1F4BE} Memory \u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4E6} *Total:* ${memTotal}
\u{1F534} *Used:* ${memUsed}
\u{1F7E2} *Free:* ${memFree}

\u2501\u2501\u2501\u2501\u2501\u2501 \u{1F4BF} Disk (/) \u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4E6} *Total:* ${diskTotal}
\u{1F534} *Used:* ${diskUsed} (${diskPct})
\u{1F7E2} *Free:* ${diskFree}`;
      await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C Failed to get system info: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  sysinfo_default as default
};
