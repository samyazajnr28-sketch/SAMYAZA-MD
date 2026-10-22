import { createRequire } from "module";
import fs from "fs";
import path from "path";
const acrcloud = createRequire(import.meta.url)("acrcloud");
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
const acr = new acrcloud({
  host: "identify-eu-west-1.acrcloud.com",
  access_key: "c33c767d683f78bd17d4bd4991955d81",
  access_secret: "bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu"
});
function getAudioOrVideo(message) {
  const m = message.message || {};
  if (m.audioMessage) return { msg: m.audioMessage, type: "audio", ext: ".mp3" };
  if (m.videoMessage) return { msg: m.videoMessage, type: "video", ext: ".mp4" };
  const quoted = m.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return null;
  if (quoted.audioMessage) return { msg: quoted.audioMessage, type: "audio", ext: ".mp3" };
  if (quoted.videoMessage) return { msg: quoted.videoMessage, type: "video", ext: ".mp4" };
  return null;
}
async function downloadMedia(msg, type) {
  const stream = await downloadContentFromMessage(msg, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}
var shazam_default = {
  command: "shazam",
  aliases: ["whatmusic", "songid"],
  category: "info",
  description: "Identify a song from audio or video",
  usage: ".shazam (reply to audio or video)",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    try {
      const media = getAudioOrVideo(message);
      if (!media) {
        return await sock.sendMessage(
          chatId,
          { text: "\u26A0\uFE0F *RESPOND TO AN AUDIO OR VIDEO*" },
          { quoted: message }
        );
      }
      const buffer = await downloadMedia(media.msg, media.type);
      const tmpDir = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const tmpPath = path.join(tmpDir, `${Date.now()}${media.ext}`);
      fs.writeFileSync(tmpPath, buffer);
      const res = await acr.identify(fs.readFileSync(tmpPath));
      fs.unlinkSync(tmpPath);
      const { code, msg } = res.status;
      if (code !== 0) throw msg;
      const music = res.metadata.music?.[0];
      if (!music) throw new Error("No match found");
      const text = `
\u{1D681}\u{1D674}\u{1D682}\u{1D684}\u{1D67B}\u{1D683}
\u2022 \u{1F4CC} *TITLE*: ${music.title || "NOT FOUND"}
\u2022 \u{1F468}\u200D\u{1F3A4} *ARTIST*: ${music.artists?.map((a) => a.name).join(", ") || "NOT FOUND"}
\u2022 \u{1F4BE} *ALBUM*: ${music.album?.name || "NOT FOUND"}
\u2022 \u{1F310} *GENRE*: ${music.genres?.map((g) => g.name).join(", ") || "NOT FOUND"}
\u2022 \u{1F4C6} *RELEASE DATE*: ${music.release_date || "NOT FOUND"}
`.trim();
      await sock.sendMessage(chatId, { text }, { quoted: message });
    } catch (err) {
      console.error("[SHZ]", err);
      await sock.sendMessage(
        chatId,
        { text: `\u274C Error: ${err}` },
        { quoted: message }
      );
    }
  }
};
export {
  shazam_default as default
};
