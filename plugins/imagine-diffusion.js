import axios from "axios";
const IMAGE_APIS = [
  (p) => `https://stable.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
  (p) => `https://dalle.stacktoy.workers.dev/?apikey=Suhail&prompt=${encodeURIComponent(p)}`,
  (p) => `https://flux.gtech-apiz.workers.dev/?apikey=Suhail&text=${encodeURIComponent(p)}`
];
const generateImage = async (prompt) => {
  for (const apiUrl of IMAGE_APIS) {
    try {
      const { data } = await axios.get(apiUrl(prompt), {
        responseType: "arraybuffer",
        timeout: 3e4
      });
      const buf = Buffer.from(data);
      if (buf[0] === 137 || buf[0] === 255) return buf;
    } catch {
      continue;
    }
  }
  throw new Error("All image generation APIs failed");
};
const enhancePrompt = (prompt) => {
  const enhancers = [
    "high quality",
    "detailed",
    "masterpiece",
    "best quality",
    "ultra realistic",
    "4k",
    "highly detailed",
    "cinematic lighting"
  ];
  const selected = enhancers.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 2) + 3);
  return `${prompt}, ${selected.join(", ")}`;
};
var imagine_diffusion_default = {
  command: "diffusion",
  aliases: ["aiimage", "draw", "genimage"],
  category: "ai",
  description: "Generate an AI image based on your prompt",
  usage: ".diffusion <prompt>",
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    const imagePrompt = args.join(" ").trim();
    if (!imagePrompt) {
      return sock.sendMessage(
        chatId,
        { text: "\u{1F3A8} *AI Image Generator*\n\nUsage: `.diffusion <prompt>`\nExample: `.diffusion a beautiful sunset over mountains`" },
        { quoted: message }
      );
    }
    await sock.sendMessage(chatId, { react: { text: "\u{1F3A8}", key: message.key } });
    await sock.sendMessage(chatId, { text: "\u{1F3A8} Generating your image... Please wait." }, { quoted: message });
    try {
      const enhanced = enhancePrompt(imagePrompt);
      const imageBuffer = await generateImage(enhanced);
      await sock.sendMessage(chatId, {
        image: imageBuffer,
        caption: `\u{1F3A8} *Generated Image*
\u{1F4DD} Prompt: _${imagePrompt}_`
      }, { quoted: message });
    } catch (error) {
      console.error("Imagine error:", error.message);
      await sock.sendMessage(
        chatId,
        { text: "\u274C Failed to generate image. Please try again later." },
        { quoted: message }
      );
    }
  }
};
export {
  imagine_diffusion_default as default
};
