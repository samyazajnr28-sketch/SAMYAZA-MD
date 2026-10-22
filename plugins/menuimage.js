import fs from "node:fs";
import path from "node:path";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

const assetDir = path.join(process.cwd(), "assets");
const imageExtensions = ["jpg", "jpeg", "png", "webp"];

function getSavedMenuImage() {
  for (const extension of imageExtensions) {
    const imagePath = path.join(assetDir, `menu-image.${extension}`);
    if (fs.existsSync(imagePath)) return imagePath;
  }
  const legacyImagePath = path.join(assetDir, "thumb.png");
  return fs.existsSync(legacyImagePath) ? legacyImagePath : null;
}

var menuimage_default = {
  command: "menuimage",
  aliases: ["setmenuimage"],
  category: "owner",
  description: "Change the image displayed with the bot menu",
  usage: ".menuimage (reply to an image) | .menuimage reset",
  ownerOnly: true,
  async handler(sock, message, args, context) {
    const chatId = context.chatId || message.key.remoteJid;
    if (!context.isGlobalOwner && !message.key.fromMe) {
      return await sock.sendMessage(chatId, {
        text: "This command is only available to the bot owner."
      }, { quoted: message });
    }

    const action = args[0]?.toLowerCase();
    if (action === "reset" || action === "remove") {
      for (const extension of imageExtensions) {
        const imagePath = path.join(assetDir, `menu-image.${extension}`);
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      }
      return await sock.sendMessage(chatId, {
        text: "Menu image reset. The default menu image will be used, if available."
      }, { quoted: message });
    }

    const quotedImage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
    const imageMessage = message.message?.imageMessage || quotedImage;
    if (!imageMessage) {
      const currentImage = getSavedMenuImage();
      return await sock.sendMessage(chatId, {
        text: currentImage
          ? `A custom menu image is set. Reply to an image with .menuimage to replace it, or use .menuimage reset to restore the default.`
          : `No custom menu image is set. Reply to an image with .menuimage to set one, or use .menuimage reset to restore the default.`
      }, { quoted: message });
    }

    const mimeType = (imageMessage.mimetype || "image/jpeg").toLowerCase();
    const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : mimeType === "image/jpeg" ? "jpg" : null;
    if (!extension) {
      return await sock.sendMessage(chatId, {
        text: "Please use a JPEG, PNG, or WebP image."
      }, { quoted: message });
    }

    try {
      fs.mkdirSync(assetDir, { recursive: true });
      const stream = await downloadContentFromMessage(imageMessage, "image");
      const chunks = [];
      for await (const chunk of stream) chunks.push(chunk);
      const imageBuffer = Buffer.concat(chunks);
      if (!imageBuffer.length) throw new Error("The uploaded image was empty.");

      for (const oldExtension of imageExtensions) {
        const oldPath = path.join(assetDir, `menu-image.${oldExtension}`);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      fs.writeFileSync(path.join(assetDir, `menu-image.${extension}`), imageBuffer);
      await sock.sendMessage(chatId, {
        text: "Menu image updated. Use .menu to preview it."
      }, { quoted: message });
    } catch (error) {
      console.error("Menu image update failed:", error);
      await sock.sendMessage(chatId, {
        text: "Could not save the menu image. Please try again with another image."
      }, { quoted: message });
    }
  }
};

export default menuimage_default;
