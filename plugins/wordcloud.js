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
      caption: "\u{1F4DD} Result too large for WhatsApp, sent as file.",
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
var wordcloud_default = {
  command: "wordcloud",
  aliases: ["wordfreq", "topwords", "wordcount"],
  category: "utility",
  description: "Analyze text and show top 20 most used words with stats",
  usage: ".wordcloud <text or reply to any message/file>",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const scriptPath = path.join(process.cwd(), "lib", "wordcloud.py");
    if (!fs.existsSync(scriptPath)) {
      return await sock.sendMessage(chatId, {
        text: `\u274C wordcloud.py not found in lib/. Please check installation.`,
        ...channelInfo
      }, { quoted: message });
    }
    const quoted = getQuoted(message);
    const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
    const hasDoc = !!quoted?.documentMessage;
    const textInput = args.join(" ").trim() || quotedText;
    if (!textInput && !hasDoc) {
      return await sock.sendMessage(chatId, {
        text: `\u{1F4DD} *Word Cloud Analyzer*

*Usage:*
\`.wordcloud <paste any text here>\`

*Or reply to:*
\u2022 Any text message
\u2022 A .txt or document file

*Output includes:*
\u{1F4CA} Word count, unique words, sentences
\u{1F3C6} Top 20 most used words
\u23F1\uFE0F Reading time estimate
\u{1F4D6} Lexical diversity score`,
        ...channelInfo
      }, { quoted: message });
    }
    await sock.sendMessage(chatId, { text: "\u{1F50D} Analyzing text...", ...channelInfo }, { quoted: message });
    const tempDir = path.join(process.cwd(), "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    const id = Date.now();
    try {
      let cmd;
      if (hasDoc && quoted) {
        const msgObj = { message: { documentMessage: quoted.documentMessage } };
        const buf = await downloadMediaMessage(msgObj, "buffer", {});
        const tmpFile = path.join(tempDir, `wc_in_${id}.txt`);
        fs.writeFileSync(tmpFile, buf);
        cmd = `python3 "${scriptPath}" --file "${tmpFile}"`;
        const { stdout } = await execAsync(cmd, { timeout: 3e4 });
        try {
          fs.unlinkSync(tmpFile);
        } catch {
        }
        const data = JSON.parse(stdout.trim());
        if (data.error) {
          return await sock.sendMessage(chatId, { text: `\u274C ${data.error}`, ...channelInfo }, { quoted: message });
        }
        await sendResult(sock, chatId, channelInfo, message, formatResult(data), `wordcloud_${id}.txt`);
      } else {
        const tmpFile = path.join(tempDir, `wc_in_${id}.txt`);
        fs.writeFileSync(tmpFile, textInput);
        cmd = `python3 "${scriptPath}" --file "${tmpFile}"`;
        const { stdout } = await execAsync(cmd, { timeout: 3e4 });
        try {
          fs.unlinkSync(tmpFile);
        } catch {
        }
        const data = JSON.parse(stdout.trim());
        if (data.error) {
          return await sock.sendMessage(chatId, { text: `\u274C ${data.error}`, ...channelInfo }, { quoted: message });
        }
        await sendResult(sock, chatId, channelInfo, message, formatResult(data), `wordcloud_${id}.txt`);
      }
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C Analysis failed: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
function formatResult(d) {
  const bar = (count, max) => {
    const filled = Math.round(count / max * 10);
    return "\u2588".repeat(filled) + "\u2591".repeat(10 - filled);
  };
  const maxCount = d.top_words?.[0]?.count || 1;
  let topWordsText = "";
  if (d.top_words?.length) {
    topWordsText = d.top_words.map(
      (w, i) => `${String(i + 1).padStart(2, " ")}. ${w.word.padEnd(15)} ${bar(w.count, maxCount)} ${w.count}x`
    ).join("\n");
  }
  return `\u{1F4DD} *Word Cloud Analysis*

\u2501\u2501\u2501\u2501\u2501\u2501 \u{1F4CA} Stats \u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4D6} *Total words:* ${d.total_words?.toLocaleString()}
\u{1F524} *Unique words:* ${d.unique_words?.toLocaleString()}
\u{1F4DD} *Characters:* ${d.total_chars?.toLocaleString()}
\u{1F4DC} *Sentences:* ${d.sentences}
\u{1F4C4} *Paragraphs:* ${d.paragraphs}
\u23F1\uFE0F *Reading time:* ${d.reading_time}
\u{1F3AF} *Lexical diversity:* ${d.lexical_diversity}%
\u{1F4CF} *Avg word length:* ${d.avg_word_len} chars

\u2501\u2501\u2501\u2501\u2501\u2501 \u{1F3C6} Top Words \u2501\u2501\u2501\u2501\u2501\u2501
\`\`\`
${topWordsText}
\`\`\``;
}
export {
  wordcloud_default as default
};
