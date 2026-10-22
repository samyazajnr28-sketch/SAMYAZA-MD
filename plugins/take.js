import { downloadMediaMessage } from "@whiskeysockets/baileys";
import webp from "node-webpmux";
import crypto from "crypto";
var take_default = {
  command: "take",
  aliases: ["steal", "wm"],
  category: "stickers",
  description: "Change sticker pack name",
  usage: ".take <packname> (reply to sticker)",
  async handler(sock, message, args, context) {
    const { chatId, channelInfo } = context;
    try {
      const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMessage?.stickerMessage) {
        await sock.sendMessage(chatId, {
          text: "\u274C Reply to a sticker with .take <packname>",
          ...channelInfo
        }, { quoted: message });
        return;
      }
      const packname = args.join(" ") || "MEGA AI";
      try {
        const stickerBuffer = await downloadMediaMessage(
          {
            key: message.message.extendedTextMessage.contextInfo.stanzaId,
            message: quotedMessage
            // messageType: 'stickerMessage'
          },
          "buffer",
          {},
          {
            logger: console,
            reuploadRequest: sock.updateMediaMessage
          }
        );
        if (!stickerBuffer) {
          await sock.sendMessage(chatId, {
            text: "\u274C Failed to download sticker",
            ...channelInfo
          }, { quoted: message });
          return;
        }
        const img = new webp.Image();
        await img.load(stickerBuffer);
        const json = {
          "sticker-pack-id": crypto.randomBytes(32).toString("hex"),
          "sticker-pack-name": packname,
          "emojis": ["\u{1F916}"]
        };
        const exifAttr = Buffer.from([73, 73, 42, 0, 8, 0, 0, 0, 1, 0, 65, 87, 7, 0, 0, 0, 0, 0, 22, 0, 0, 0]);
        const jsonBuffer = Buffer.from(JSON.stringify(json), "utf8");
        const exif = Buffer.concat([exifAttr, jsonBuffer]);
        exif.writeUIntLE(jsonBuffer.length, 14, 4);
        img.exif = exif;
        const finalBuffer = await img.save(null);
        await sock.sendMessage(chatId, {
          sticker: finalBuffer,
          ...channelInfo
        }, {
          quoted: message
        });
      } catch (error) {
        console.error("Sticker processing error:", error);
        await sock.sendMessage(chatId, {
          text: "\u274C Error processing sticker",
          ...channelInfo
        }, { quoted: message });
      }
    } catch (error) {
      console.error("Error in take command:", error);
      await sock.sendMessage(chatId, {
        text: "\u274C Error processing command",
        ...channelInfo
      }, { quoted: message });
    }
  }
};
export {
  take_default as default
};
