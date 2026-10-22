import config from "../config.js";
import { igdl } from "ruhend-scraper";
import axios from "axios";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import webp from "node-webpmux";
import crypto from "crypto";
import { stickercropFromBuffer } from "./stickercrop.js";
async function _convertBufferToStickerWebp(inputBuffer, isAnimated, cropSquare) {
  const tmpDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const tempInputBase = path.join(tmpDir, `igs_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const tempInput = isAnimated ? `${tempInputBase}.mp4` : `${tempInputBase}.jpg`;
  const tempOutput = path.join(tmpDir, `igs_out_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`);
  fs.writeFileSync(tempInput, inputBuffer);
  const scheduleDelete = (p) => {
    if (!p) return;
    setTimeout(() => {
      try {
        fs.unlinkSync(p);
      } catch {
      }
    }, 5e3);
  };
  const vfCropSquareImg = "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512";
  const vfPadSquareImg = "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000";
  let ffmpegCommand;
  if (isAnimated) {
    const isLargeVideo = inputBuffer.length > 5 * 1024 * 1024;
    if (cropSquare) {
      ffmpegCommand = isLargeVideo ? `ffmpeg -y -i "${tempInput}" -t 2 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 30 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"` : `ffmpeg -y -i "${tempInput}" -t 3 -vf "crop=min(iw\\,ih):min(iw\\,ih),scale=512:512,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 50 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
    } else {
      ffmpegCommand = isLargeVideo ? `ffmpeg -y -i "${tempInput}" -t 2 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=8" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 35 -compression_level 6 -b:v 100k -max_muxing_queue_size 1024 "${tempOutput}"` : `ffmpeg -y -i "${tempInput}" -t 3 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,fps=12" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 45 -compression_level 6 -b:v 150k -max_muxing_queue_size 1024 "${tempOutput}"`;
    }
  } else {
    const vf = `${cropSquare ? vfCropSquareImg : vfPadSquareImg},format=rgba`;
    ffmpegCommand = `ffmpeg -y -i "${tempInput}" -vf "${vf}" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 40 -compression_level 6 "${tempOutput}"`;
  }
  await new Promise((resolve, reject) => {
    exec(ffmpegCommand, (error) => error ? reject(error) : resolve(void 0));
  });
  const webpBuffer = fs.readFileSync(tempOutput);
  scheduleDelete(tempOutput);
  scheduleDelete(tempInput);
  const img = new webp.Image();
  await img.load(webpBuffer);
  const json = {
    "sticker-pack-id": crypto.randomBytes(32).toString("hex"),
    "sticker-pack-name": config.packname || "MegaBot",
    "emojis": ["\u{1F4F8}"]
  };
  const exifAttr = Buffer.from([73, 73, 42, 0, 8, 0, 0, 0, 1, 0, 65, 87, 7, 0, 0, 0, 0, 0, 22, 0, 0, 0]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  img.exif = exif;
  return await img.save(null);
}
async function fetchBufferFromUrl(url) {
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*"
      },
      timeout: 3e4,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    return Buffer.from(res.data);
  } catch (e) {
    throw e;
  }
}
var igsc_default = {
  command: "igsc",
  aliases: ["igstickercrop", "instacrop"],
  category: "stickers",
  description: "Convert Instagram post/reel to cropped sticker",
  usage: ".igsc <instagram URL>",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    try {
      const text = message.message?.conversation || message.message?.extendedTextMessage?.text || "";
      const urlMatch = text.match(/https?:\/\/\S+/);
      if (!urlMatch) {
        await sock.sendMessage(chatId, {
          text: `Send an Instagram post/reel link.
Usage: .igsc <url>`,
          ...channelInfo
        }, { quoted: message });
        return;
      }
      await sock.sendMessage(chatId, { react: { text: "\u{1F504}", key: message.key } });
      const downloadData = await igdl(urlMatch[0]).catch(() => null);
      if (!downloadData || !downloadData.data) {
        await sock.sendMessage(chatId, {
          text: "\u274C Failed to fetch media from Instagram link.",
          ...channelInfo
        }, { quoted: message });
        return;
      }
      const rawItems = (downloadData?.data || []).filter((m) => m && m.url);
      const seenUrls = /* @__PURE__ */ new Set();
      const items = [];
      for (const m of rawItems) {
        if (!seenUrls.has(m.url)) {
          seenUrls.add(m.url);
          items.push(m);
        }
      }
      if (items.length === 0) {
        await sock.sendMessage(chatId, {
          text: "\u274C No media found at the provided link.",
          ...channelInfo
        }, { quoted: message });
        return;
      }
      const maxItems = Math.min(items.length, 10);
      const seenHashes = /* @__PURE__ */ new Set();
      for (let i = 0; i < maxItems; i++) {
        try {
          const media = items[i];
          const mediaUrl = media.url;
          const isVideo = media?.type === "video" || /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl);
          const buffer = await fetchBufferFromUrl(mediaUrl);
          const { createHash } = await import("crypto");
          const hash = createHash("sha1").update(buffer).digest("hex");
          if (seenHashes.has(hash)) continue;
          seenHashes.add(hash);
          const stickerBuffer = await stickercropFromBuffer(buffer, isVideo);
          await sock.sendMessage(chatId, {
            sticker: stickerBuffer,
            ...channelInfo
          }, { quoted: message });
          if (i < maxItems - 1) {
            await new Promise((r) => setTimeout(r, 800));
          }
        } catch (perItemErr) {
          console.error("IGSC item error:", perItemErr);
        }
      }
    } catch (err) {
      console.error("Error in igsc command:", err);
      await sock.sendMessage(chatId, {
        text: "Failed to create cropped sticker from Instagram link.",
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  igsc_default as default
};
