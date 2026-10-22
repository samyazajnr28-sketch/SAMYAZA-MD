import axios from "axios";
const supportedAnimes = [
  "akira",
  "akiyama",
  "anna",
  "asuna",
  "ayuzawa",
  "boruto",
  "chiho",
  "chitoge",
  "deidara",
  "erza",
  "elaina",
  "eba",
  "emilia",
  "hestia",
  "hinata",
  "inori",
  "isuzu",
  "itachi",
  "itori",
  "kaga",
  "kagura",
  "kaori",
  "keneki",
  "kotori",
  "kurumi",
  "madara",
  "mikasa",
  "miku",
  "minato",
  "naruto",
  "nezuko",
  "sagiri",
  "sasuke",
  "sakura"
];
function pickRandom(arr, count = 1) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
const animuMenu = "\u{1F380} *Animes Menu* \u{1F380}\n\n\u2022 *akira*\n\u2022 *akiyama*\n\u2022 *anna*\n\u2022 *asuna*\n\u2022 *ayuzawa*\n\u2022 *boruto*\n\u2022 *chiho*\n\u2022 *chitoge*\n\u2022 *deidara*\n\u2022 *erza*\n\u2022 *elaina*\n\u2022 *eba*\n\u2022 *emilia*\n\u2022 *hestia*\n\u2022 *hinata*\n\u2022 *inori*\n\u2022 *isuzu*\n\u2022 *itachi*\n\u2022 *itori*\n\u2022 *kaga*\n\u2022 *kagura*\n\u2022 *kaori*\n\u2022 *keneki*\n\u2022 *kotori*\n\u2022 *kurumi*\n\u2022 *madara*\n\u2022 *mikasa*\n\u2022 *miku*\n\u2022 *minato*\n\u2022 *naruto*\n\u2022 *nezuko*\n\u2022 *sagiri*\n\u2022 *sasuke*\n\u2022 *sakura*\n\n\u{1F4CC} *Usage:*\n.animes <name>\nExample: *.animes naruto*";
var animes_default = {
  command: "animes",
  aliases: [],
  category: "anime",
  description: "Send random anime images",
  usage: ".animes <anime_name>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const input = args[0] ? args[0] : "";
    const typeLower = input.toLowerCase();
    if (!input || !supportedAnimes.includes(typeLower)) {
      const replyText = input && !supportedAnimes.includes(typeLower) ? `Unsupported anime: ${typeLower}

` : "";
      return await sock.sendMessage(chatId, { text: replyText + animuMenu }, { quoted: message });
    }
    try {
      const apiUrl = `https://raw.githubusercontent.com/Guru322/api/Guru/BOT-JSON/anime-${typeLower}.json`;
      const res = await axios.get(apiUrl, { timeout: 15e3, validateStatus: (s) => s < 500 });
      const images = res.data;
      if (!Array.isArray(images) || images.length === 0) throw new Error("No images found");
      const randomImages = pickRandom(images, Math.min(3, images.length));
      for (const img of randomImages) {
        try {
          const imageData = await axios.get(img, { responseType: "arraybuffer", timeout: 15e3 });
          await sock.sendMessage(chatId, { image: Buffer.from(imageData.data), caption: `_${typeLower}_` }, { quoted: message });
        } catch {
        }
      }
    } catch (err) {
      await sock.sendMessage(chatId, { text: "\u274C Failed to fetch anime images. Please try again later." }, { quoted: message });
    }
  }
};
export {
  animes_default as default
};
