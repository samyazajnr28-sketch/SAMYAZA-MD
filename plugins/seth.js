import { File } from 'megajs';
import path from 'node:path';

const formatBytes = bytes => {
    if (bytes === 0) return '0 Bytes';
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / 1024 ** index).toFixed(2))} ${units[index]}`;
};

const generateBar = percentage => {
    const totalBars = 10;
    const filledBars = Math.floor(percentage / 100 * totalBars);
    return '\u2588'.repeat(filledBars) + '\u2591'.repeat(totalBars - filledBars);
};

const mimeTypes = {
    '.mp4': 'video/mp4',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.apk': 'application/vnd.android.package-archive',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.mp3': 'audio/mpeg',
    '.mkv': 'video/x-matroska'
};

export default {
    command: 'seth',
    aliases: ['megadl'],
    category: 'download',
    description: 'Download a file from a MEGA link with progress updates',
    usage: '.seth <mega-url>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const url = args.join(' ').trim();
        if (!url) {
            return sock.sendMessage(chatId, {
                text: 'Usage: .seth https://mega.nz/file/xxxx#xxxx'
            }, { quoted: message });
        }

        try {
            const file = File.fromURL(url);
            await file.loadAttributes();
            if (file.size >= 500 * 1024 * 1024) {
                return sock.sendMessage(chatId, {
                    text: '\u274C File too large (limit: 500 MB).'
                }, { quoted: message });
            }

            const { key } = await sock.sendMessage(chatId, {
                text: `\u{1F4E5} *SETH DOWNLOAD*\n\n*File:* ${file.name}\n*Size:* ${formatBytes(file.size)}\n\n*Progress:* 0% [\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591]`
            }, { quoted: message });
            const stream = file.download();
            const chunks = [];
            let lastUpdate = Date.now();

            stream.on('progress', async ({ bytesLoaded, bytesTotal }) => {
                const percentage = bytesTotal ? Math.floor(bytesLoaded / bytesTotal * 100) : 0;
                if (Date.now() - lastUpdate > 3000 || percentage === 100) {
                    await sock.sendMessage(chatId, {
                        text: `\u{1F4E5} *SETH DOWNLOAD*\n\n*File:* ${file.name}\n*Size:* ${formatBytes(bytesTotal)}\n\n*Progress:* ${percentage}% [${generateBar(percentage)}]`,
                        edit: key
                    });
                    lastUpdate = Date.now();
                }
            });
            stream.on('data', chunk => chunks.push(chunk));
            stream.on('end', async () => {
                const buffer = Buffer.concat(chunks);
                const extension = path.extname(file.name || '').toLowerCase();
                await sock.sendMessage(chatId, {
                    document: buffer,
                    fileName: file.name,
                    mimetype: mimeTypes[extension] || 'application/octet-stream',
                    caption: `\u2705 *Download complete*\n*File:* ${file.name}\n*Size:* ${formatBytes(file.size)}`
                }, { quoted: message });
            });
            stream.on('error', async error => {
                await sock.sendMessage(chatId, {
                    text: `\u274C Download error: ${error.message}`
                }, { quoted: message });
            });
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `\u274C Download error: ${error.message}`
            }, { quoted: message });
        }
    }
};
