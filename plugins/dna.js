import { downloadMediaMessage } from "@whiskeysockets/baileys";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
const execAsync = promisify(exec);
function getQuoted(message) {
  return message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null;
}
function getMediaType(quoted) {
  if (quoted?.imageMessage) return "image";
  if (quoted?.videoMessage) return "video";
  if (quoted?.audioMessage) return "audio";
  if (quoted?.documentMessage) return "document";
  if (quoted?.stickerMessage) return "sticker";
  return null;
}
var dna_default = {
  command: "dna",
  aliases: ["dnaencode", "dnadecode"],
  category: "utility",
  description: "Encode any text or media to DNA sequence (ATCG) or decode it back",
  usage: ".dna encode <text or reply to media>\n.dna decode <DNA or reply to DNA file>",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    const quoted = getQuoted(message);
    const quotedText = quoted?.conversation || quoted?.extendedTextMessage?.text || "";
    const mediaType = getMediaType(quoted);
    if (!args.length) {
      return await sock.sendMessage(chatId, {
        text: `\u{1F9EC} *DNA Encoder / Decoder*

*Text:*
\`.dna encode Hello World\`
\`.dna decode ATCGATCG...\`

*Media/File (reply to any media):*
\`.dna encode\` \u2014 reply to image/video/audio/doc
\`.dna decode\` \u2014 reply to a .txt file with DNA

\u2139\uFE0F Each byte becomes 4 DNA bases (A, T, C, G)`,
        ...channelInfo
      }, { quoted: message });
    }
    const mode = args[0]?.toLowerCase();
    if (mode !== "encode" && mode !== "decode") {
      return await sock.sendMessage(chatId, {
        text: `\u274C Use \`encode\` or \`decode\``,
        ...channelInfo
      }, { quoted: message });
    }
    const binPath = path.join(process.cwd(), "lib", "bin", "dna");
    if (!fs.existsSync(binPath)) {
      return await sock.sendMessage(chatId, {
        text: `\u274C DNA binary not available on this server (g++ not installed).`,
        ...channelInfo
      }, { quoted: message });
    }
    const tempDir = path.join(process.cwd(), "temp");
    fs.mkdirSync(tempDir, { recursive: true });
    const id = Date.now();
    try {
      if (mode === "encode") {
        let inputBuffer;
        let sourceLabel;
        if (mediaType && quoted) {
          await sock.sendMessage(chatId, { text: "\u23F3 Downloading media...", ...channelInfo }, { quoted: message });
          const msgObj = { message: { [`${mediaType}Message`]: quoted[`${mediaType}Message`] } };
          inputBuffer = await downloadMediaMessage(msgObj, "buffer", {});
          sourceLabel = `${mediaType} file (${inputBuffer.length} bytes)`;
        } else {
          const textInput = args.slice(1).join(" ").trim() || quotedText;
          if (!textInput) {
            return await sock.sendMessage(chatId, {
              text: `\u274C No input. Provide text or reply to a media message.`,
              ...channelInfo
            }, { quoted: message });
          }
          inputBuffer = Buffer.from(textInput, "utf8");
          sourceLabel = `text (${inputBuffer.length} bytes)`;
        }
        const inFile = path.join(tempDir, `dna_in_${id}.bin`);
        const outFile = path.join(tempDir, `dna_out_${id}.txt`);
        fs.writeFileSync(inFile, inputBuffer);
        await sock.sendMessage(chatId, { text: "\u{1F9EC} Encoding to DNA...", ...channelInfo }, { quoted: message });
        const b64 = inputBuffer.toString("base64");
        const b64File = path.join(tempDir, `dna_b64_${id}.txt`);
        fs.writeFileSync(b64File, b64);
        const result = await execAsync(`"${binPath}" encode "${b64}"`, { timeout: 3e4, maxBuffer: 50 * 1024 * 1024 });
        const dnaResult = result.stdout.trim();
        fs.writeFileSync(outFile, dnaResult);
        await sock.sendMessage(chatId, {
          document: fs.readFileSync(outFile),
          mimetype: "text/plain",
          fileName: `dna_encoded_${id}.txt`,
          caption: `\u{1F9EC} *DNA Encoded*

\u{1F4E5} *Source:* ${sourceLabel}
\u{1F4E4} *DNA bases:* ${dnaResult.length.toLocaleString()}

_Reply to this file with \`.dna decode\` to restore_`,
          ...channelInfo
        }, { quoted: message });
        for (const f of [inFile, outFile, b64File]) try {
          fs.unlinkSync(f);
        } catch {
        }
      } else {
        let dnaInput;
        if (quoted?.documentMessage) {
          await sock.sendMessage(chatId, { text: "\u23F3 Reading DNA file...", ...channelInfo }, { quoted: message });
          const msgObj = { message: { documentMessage: quoted.documentMessage } };
          const buf = await downloadMediaMessage(msgObj, "buffer", {});
          dnaInput = buf.toString("utf8").trim();
        } else {
          dnaInput = args.slice(1).join(" ").trim() || quotedText;
        }
        if (!dnaInput) {
          return await sock.sendMessage(chatId, {
            text: `\u274C No DNA input. Provide DNA text or reply to a DNA .txt file.`,
            ...channelInfo
          }, { quoted: message });
        }
        if (!/^[ATCGatcg\s]+$/.test(dnaInput)) {
          return await sock.sendMessage(chatId, {
            text: `\u274C Invalid DNA sequence. Only A, T, C, G allowed.`,
            ...channelInfo
          }, { quoted: message });
        }
        const cleanDna = dnaInput.replace(/\s/g, "");
        await sock.sendMessage(chatId, { text: "\u{1F52C} Decoding DNA...", ...channelInfo }, { quoted: message });
        const { stdout, stderr } = await execAsync(
          `"${binPath}" decode "${cleanDna}"`,
          { timeout: 3e4, maxBuffer: 50 * 1024 * 1024 }
        );
        if (stderr && !stdout) {
          return await sock.sendMessage(chatId, { text: `\u274C ${stderr.trim()}`, ...channelInfo }, { quoted: message });
        }
        const decoded = stdout.trim();
        const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(decoded) && decoded.length % 4 === 0;
        if (isBase64 && decoded.length > 100) {
          const fileBuffer = Buffer.from(decoded, "base64");
          const outFile = path.join(tempDir, `dna_decoded_${id}.bin`);
          fs.writeFileSync(outFile, fileBuffer);
          await sock.sendMessage(chatId, {
            document: fileBuffer,
            mimetype: "application/octet-stream",
            fileName: `dna_decoded_${id}`,
            caption: `\u{1F9EC} *DNA Decoded*

\u{1F4E6} *Restored file:* ${fileBuffer.length.toLocaleString()} bytes`,
            ...channelInfo
          }, { quoted: message });
          try {
            fs.unlinkSync(outFile);
          } catch {
          }
        } else {
          if (decoded.length > 800) {
            const outFile = path.join(tempDir, `dna_decoded_${id}.txt`);
            fs.writeFileSync(outFile, decoded);
            await sock.sendMessage(chatId, {
              document: fs.readFileSync(outFile),
              mimetype: "text/plain",
              fileName: `dna_decoded_${id}.txt`,
              caption: `\u{1F9EC} *DNA Decoded* \u2014 ${decoded.length} chars`,
              ...channelInfo
            }, { quoted: message });
            try {
              fs.unlinkSync(outFile);
            } catch {
            }
          } else {
            await sock.sendMessage(chatId, {
              text: `\u{1F9EC} *DNA Decoded*

\u{1F4E4} *Result:*
\`\`\`
${decoded}
\`\`\``,
              ...channelInfo
            }, { quoted: message });
          }
        }
      }
    } catch (error) {
      await sock.sendMessage(chatId, {
        text: `\u274C Failed: ${error.message}`,
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  dna_default as default
};
