import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { exec } from "child_process";
import { promisify } from "util";
import { getBin } from "../lib/compile.js";
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
      caption: "\u{1F4C8} Result too large for WhatsApp, sent as file.",
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
var analyze_default = {
  command: "analyze",
  aliases: ["textanalyze", "textanalyser", "analyse", "readability"],
  category: "utility",
  description: "Deep text analysis: reading level, sentiment, word stats (C++ powered)",
  usage: ".analyze <text or reply to any message/file>",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const binPath = getBin("analyze");
    if (!fs.existsSync(binPath)) {
      return await sock.sendMessage(chatId, {
        text: `\u274C Analyze binary not available on this server (g++ not installed or not yet compiled).`,
        ...channelInfo
      }, { quoted: message });
    }
    const quoted = getQuoted(message);
    const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
    const hasDoc = !!quoted?.documentMessage;
    const textInput = args.join(" ").trim() || quotedText;
    if (!textInput && !hasDoc) {
      return await sock.sendMessage(chatId, {
        text: `\u{1F4C8} *Text Analyzer*

*Usage:* \`.analyze <paste any text>\`

*Or reply to:*
\u2022 Any text message
\u2022 A .txt or document file

*Output includes:*
\u{1F4CA} Word/sentence/paragraph count
\u{1F4D6} Flesch Reading Ease score & level
\u{1F60A} Sentiment analysis (positive/negative/neutral)
\u23F1\uFE0F Reading time estimate
\u{1F3C6} Top 20 keywords`,
        ...channelInfo
      }, { quoted: message });
    }
    await sock.sendMessage(chatId, { text: "\u{1F50D} Analyzing...", ...channelInfo }, { quoted: message });
    const tempDir = path.join(process.cwd(), "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    const id = Date.now();
    try {
      let stdout;
      if (hasDoc && quoted) {
        const msgObj = { message: { documentMessage: quoted.documentMessage } };
        const buf = await downloadMediaMessage(msgObj, "buffer", {});
        const tmpFile = path.join(tempDir, `analyze_in_${id}.txt`);
        fs.writeFileSync(tmpFile, buf);
        const result = await execAsync(`"${binPath}" --file "${tmpFile}"`, { timeout: 3e4 });
        stdout = result.stdout;
        try {
          fs.unlinkSync(tmpFile);
        } catch {
        }
      } else {
        const tmpFile = path.join(tempDir, `analyze_in_${id}.txt`);
        fs.writeFileSync(tmpFile, textInput);
        const result = await execAsync(`"${binPath}" --file "${tmpFile}"`, { timeout: 3e4 });
        stdout = result.stdout;
        try {
          fs.unlinkSync(tmpFile);
        } catch {
        }
      }
      const data = JSON.parse(stdout.trim());
      const bar = (score) => {
        const filled = Math.round(score / 10);
        return "\u2588".repeat(filled) + "\u2591".repeat(10 - filled);
      };
      const fleschBar = bar(data.flesch_score / 10);
      const sentBar = data.sentiment_score >= 0 ? "\u{1F7E2}".repeat(Math.min(5, Math.round(data.sentiment_score / 20))) : "\u{1F534}".repeat(Math.min(5, Math.round(Math.abs(data.sentiment_score) / 20)));
      const topWordsText = data.top_words?.length ? data.top_words.slice(0, 15).map(
        (w, i) => `${String(i + 1).padStart(2)}. ${w.word.padEnd(15)} ${w.count}x`
      ).join("\n") : "N/A";
      const resultText = `\u{1F4C8} *Text Analysis Report*

\u2501\u2501\u2501\u2501\u2501\u2501 \u{1F4CA} Counts \u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4D6} *Words:* ${data.total_words?.toLocaleString()} (${data.unique_words?.toLocaleString()} unique)
\u{1F4DD} *Characters:* ${data.total_chars?.toLocaleString()} (${data.chars_no_spaces?.toLocaleString()} no spaces)
\u{1F4DC} *Sentences:* ${data.sentences}
\u{1F4C4} *Paragraphs:* ${data.paragraphs}
\u{1F524} *Syllables:* ${data.syllables?.toLocaleString()}
\u{1F4CF} *Avg word length:* ${data.avg_word_length} chars
\u{1F4D0} *Avg sentence length:* ${data.avg_sentence_length} words
\u{1F520} *Complex words (>6 chars):* ${data.long_words}

\u2501\u2501\u2501\u2501\u2501\u2501 \u{1F4D6} Readability \u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4CA} *Flesch Score:* ${data.flesch_score}/100
${fleschBar}
\u{1F393} *Reading Level:* ${data.reading_level}
\u23F1\uFE0F *Reading Time:* ${data.reading_time}

\u2501\u2501\u2501\u2501\u2501\u2501 \u{1F60A} Sentiment \u2501\u2501\u2501\u2501\u2501\u2501
${sentBar || "\u2B1C\u2B1C\u2B1C\u2B1C\u2B1C"}
\u{1F3AD} *Overall:* ${data.sentiment}
\u2705 *Positive words:* ${data.positive_words}
\u274C *Negative words:* ${data.negative_words}

\u2501\u2501\u2501\u2501\u2501\u2501 \u{1F3C6} Top Keywords \u2501\u2501\u2501\u2501\u2501\u2501
\`\`\`
${topWordsText}
\`\`\``;
      await sendResult(sock, chatId, channelInfo, message, resultText, `analysis_${id}.txt`);
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C Analysis failed: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  analyze_default as default
};
