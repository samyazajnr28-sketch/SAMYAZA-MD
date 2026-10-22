import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
const execAsync = promisify(exec);
const WA_LIMIT = 6e4;
function getQuoted(message) {
  return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}
async function sendResult(sock, chatId, channelInfo, message, text, filename) {
  if (text.length > WA_LIMIT) {
    const tmpFile = path.join(process.cwd(), "temp", filename);
    fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
    fs.writeFileSync(tmpFile, text);
    await sock.sendMessage(chatId, {
      document: fs.readFileSync(tmpFile),
      mimetype: "text/plain",
      fileName: filename,
      caption: "\u{1F310} Result too large for WhatsApp, sent as file.",
      ...channelInfo
    }, { quoted: message });
    try {
      fs.unlinkSync(tmpFile);
    } catch {
    }
  } else {
    await sock.sendMessage(chatId, { text, ...channelInfo }, { quoted: message });
  }
}
var urldecode_default = {
  command: "urldecode",
  aliases: ["urlencode", "urlextract", "links", "extractlinks"],
  category: "utility",
  description: "Encode/decode URLs or extract all links from text/files",
  usage: ".urldecode <url>\n.urlencode <text>\n.extractlinks <text or reply to file>",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo, userMessage } = context;
    const scriptPath = path.join(process.cwd(), "lib", "urltool.py");
    if (!fs.existsSync(scriptPath)) {
      return await sock.sendMessage(chatId, {
        text: `\u274C urltool.py not found in lib/.`,
        ...channelInfo
      }, { quoted: message });
    }
    const quoted = getQuoted(message);
    const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
    const hasDoc = !!quoted?.documentMessage;
    let mode = "decode";
    if (userMessage.startsWith("urlencode") || userMessage.startsWith("/urlencode") || userMessage.startsWith(".urlencode") || userMessage.startsWith("!urlencode")) {
      mode = "encode";
    } else if (userMessage.startsWith("extractlinks") || userMessage.startsWith("/extractlinks") || userMessage.startsWith(".extractlinks") || userMessage.startsWith("!extractlinks") || userMessage.startsWith("links")) {
      mode = "extract";
    } else if (args[0]?.toLowerCase() === "encode") {
      mode = "encode";
      args = args.slice(1);
    } else if (args[0]?.toLowerCase() === "extract" || args[0]?.toLowerCase() === "links") {
      mode = "extract";
      args = args.slice(1);
    } else if (args[0]?.toLowerCase() === "decode") {
      mode = "decode";
      args = args.slice(1);
    }
    const textInput = args.join(" ").trim() || quotedText;
    if (!textInput && !hasDoc) {
      return await sock.sendMessage(chatId, {
        text: `\u{1F310} *URL Tools*

*Decode a URL:*
\`.urldecode https://example.com/path%20with%20spaces\`

*Encode text to URL:*
\`.urlencode hello world & more\`

*Extract all links from text:*
\`.extractlinks <paste text>\`
Or reply to any text message or file with \`.extractlinks\`

*Shortcut modes:*
\`.urldecode encode <text>\`
\`.urldecode extract <text>\``,
        ...channelInfo
      }, { quoted: message });
    }
    const tempDir = path.join(process.cwd(), "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    const id = Date.now();
    try {
      let stdout;
      if (hasDoc && quoted && mode === "extract") {
        await sock.sendMessage(chatId, { text: "\u23F3 Reading file...", ...channelInfo }, { quoted: message });
        const msgObj = { message: { documentMessage: quoted.documentMessage } };
        const buf = await downloadMediaMessage(msgObj, "buffer", {});
        const tmpFile = path.join(tempDir, `url_in_${id}.txt`);
        fs.writeFileSync(tmpFile, buf);
        const result = await execAsync(`python3 "${scriptPath}" extract --file "${tmpFile}"`, { timeout: 3e4 });
        stdout = result.stdout;
        try {
          fs.unlinkSync(tmpFile);
        } catch {
        }
      } else {
        const safeText = textInput.replace(/'/g, `'"'"'`);
        const result = await execAsync(
          `python3 "${scriptPath}" ${mode} '${safeText}'`,
          { timeout: 3e4 }
        );
        stdout = result.stdout;
      }
      const data = JSON.parse(stdout.trim());
      if (data.error) {
        return await sock.sendMessage(chatId, { text: `\u274C ${data.error}`, ...channelInfo }, { quoted: message });
      }
      let resultText = "";
      if (mode === "decode") {
        resultText = `\u{1F310} *URL Decoder*

\u{1F4E5} *Original:*
\`${data.original}\`

\u{1F4E4} *Decoded:*
\`${data.decoded}\``;
        if (data.scheme) resultText += `

\u{1F50D} *Breakdown:*
\u2022 Scheme: ${data.scheme}
\u2022 Host: ${data.host}
\u2022 Path: ${data.path}`;
        if (data.query_params) {
          const params = Object.entries(data.query_params).map(([k, v]) => `  \u2022 ${k}: ${v}`).join("\n");
          resultText += `
\u2022 Params:
${params}`;
        }
        if (data.fragment) resultText += `
\u2022 Fragment: ${data.fragment}`;
      } else if (mode === "encode") {
        resultText = `\u{1F310} *URL Encoder*

\u{1F4E5} *Original:*
\`${data.original}\`

\u{1F512} *Fully Encoded:*
\`${data.fully_encoded}\`

\u{1F513} *Safe Encoded:*
\`${data.safe_encoded}\``;
      } else {
        if (data.total === 0) {
          resultText = `\u{1F310} *Link Extractor*

\u274C No links found in the text.`;
        } else {
          const lines = [`\u{1F310} *Link Extractor \u2014 ${data.total} links found*
`];
          if (data.social?.length) {
            lines.push(`\u{1F4F1} *Social Media (${data.social.length}):*`);
            data.social.forEach((u) => lines.push(`\u2022 ${u}`));
            lines.push("");
          }
          if (data.media?.length) {
            lines.push(`\u{1F5BC}\uFE0F *Media Files (${data.media.length}):*`);
            data.media.forEach((u) => lines.push(`\u2022 ${u}`));
            lines.push("");
          }
          if (data.documents?.length) {
            lines.push(`\u{1F4C4} *Documents (${data.documents.length}):*`);
            data.documents.forEach((u) => lines.push(`\u2022 ${u}`));
            lines.push("");
          }
          if (data.other?.length) {
            lines.push(`\u{1F517} *Other Links (${data.other.length}):*`);
            data.other.forEach((u) => lines.push(`\u2022 ${u}`));
          }
          resultText = lines.join("\n");
        }
      }
      await sendResult(sock, chatId, channelInfo, message, resultText, `urls_${id}.txt`);
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C Failed: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  urldecode_default as default
};
