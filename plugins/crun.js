import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { TEMP_DIR } from "../lib/paths.js";
const execAsync = promisify(exec);
var crun_default = {
  command: "crun",
  aliases: ["cpp", "runcpp", "c++"],
  category: "utility",
  description: "Compile and run C++ code",
  usage: ".crun <c++ code>",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const quoted = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
    const hasDoc = !!quoted?.documentMessage;
    let code = "";
    if (hasDoc) {
      const { downloadMediaMessage } = await import("@whiskeysockets/baileys");
      const msgObj = { message: { documentMessage: quoted.documentMessage } };
      const buf = await downloadMediaMessage(msgObj, "buffer", {});
      code = buf.toString("utf8");
    } else {
      const rawText = message?.message?.conversation || message?.message?.extendedTextMessage?.text || "";
      const cmdMatch = rawText.match(/^[.!/]\w+\s*/);
      code = cmdMatch ? rawText.slice(cmdMatch[0].length) : args.join(" ");
      if (!code.trim()) code = quotedText;
    }
    code = code.trim();
    if (!code) {
      return await sock.sendMessage(chatId, {
        text: `\u26A1 *C++ Runner*

*Usage:* \`.crun <code>\`

*Example:*
\`.crun #include<iostream>
using namespace std;
int main(){cout<<"Hello World!"<<endl;return 0;}\`

\u2022 Max execution time: 10 seconds
\u2022 No file/network access
\u2022 Auto-wraps in main() if not present`,
        ...channelInfo
      }, { quoted: message });
    }
    if (!code.includes("main(") && !code.includes("main (")) {
      code = `#include<iostream>
#include<cmath>
#include<string>
#include<vector>
using namespace std;
int main(){
${code}
return 0;
}`;
    }
    const id = Date.now();
    const srcFile = path.join(TEMP_DIR, `crun_${id}.cpp`);
    const binFile = path.join(TEMP_DIR, `crun_${id}`);
    try {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
      fs.writeFileSync(srcFile, code);
      await sock.sendMessage(chatId, {
        text: "\u2699\uFE0F *Compiling...*",
        ...channelInfo
      }, { quoted: message });
      try {
        await execAsync(`g++ -o ${binFile} ${srcFile} -std=c++17 -O2`, { timeout: 15e3 });
      } catch (compileErr) {
        return await sock.sendMessage(chatId, {
          text: `\u274C *Compilation Error:*

\`\`\`
${compileErr.stderr || compileErr.message}
\`\`\``,
          ...channelInfo
        }, { quoted: message });
      }
      let output = "";
      try {
        const { stdout, stderr } = await execAsync(`timeout 10 ${binFile}`, { timeout: 12e3 });
        output = (stdout || stderr || "").trim();
      } catch (runErr) {
        output = runErr.stdout?.trim() || runErr.message || "Runtime error";
      }
      if (!output) output = "(no output)";
      if (output.length > 3e3) output = output.substring(0, 3e3) + "\n...(truncated)";
      await sock.sendMessage(chatId, {
        text: `\u26A1 *C++ Output:*

\`\`\`
${output}
\`\`\``,
        ...channelInfo
      }, { quoted: message });
    } finally {
      try {
        fs.unlinkSync(srcFile);
      } catch {
      }
      try {
        fs.unlinkSync(binFile);
      } catch {
      }
    }
  }
};
export {
  crun_default as default
};
