import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

async function convertToSticker(buffer, type) {
  if (type === "imageMessage") {
    return sharp(buffer)
      .rotate()
      .resize(512, 512, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 85, effort: 5 })
      .toBuffer();
  }

  const directory = await mkdtemp(path.join(os.tmpdir(), "samyaza-sticker-"));
  const inputPath = path.join(directory, "input.mp4");
  const outputPath = path.join(directory, "sticker.webp");
  try {
    await writeFile(inputPath, buffer);
    await execFileAsync("ffmpeg", [
      "-y", "-i", inputPath, "-t", "6",
      "-vf", "fps=15,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000",
      "-c:v", "libwebp", "-loop", "0", "-an", "-vsync", "0",
      "-quality", "75", "-compression_level", "6", outputPath
    ]);
    return await readFile(outputPath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

var sticker_alt_default = {
  command: "sticker",
  aliases: ["stik", "s"],
  category: "stickers",
  description: "Convert an image or video into a sticker",
  usage: ".sticker (reply to image/video)",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    let tempDirectory;
    try {
      const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const mediaMessage = quotedMsg?.imageMessage || quotedMsg?.videoMessage
        || message.message?.imageMessage || message.message?.videoMessage;
      if (!mediaMessage) {
        await sock.sendMessage(chatId, { text: "\u26A0\uFE0F Please reply to an image or video!" }, { quoted: message });
        return;
      }
      const type = message.message?.imageMessage === mediaMessage
        || quotedMsg?.imageMessage === mediaMessage
        ? "imageMessage"
        : "videoMessage";
      const stream = await downloadContentFromMessage(mediaMessage, type === "imageMessage" ? "image" : "video");
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const sticker = await convertToSticker(Buffer.concat(chunks), type);
      await sock.sendMessage(chatId, { sticker }, { quoted: message });
    } catch (error) {
      console.error("Sticker Command Error:", error);
      const text = error.code === "ENOENT"
        ? "\u274C Video sticker conversion requires FFmpeg. Install FFmpeg or reply to a still image."
        : "\u274C Failed to create sticker! Check that the replied media is valid.";
      await sock.sendMessage(chatId, { text }, { quoted: message });
    }
  }
};
export {
  sticker_alt_default as default
};
