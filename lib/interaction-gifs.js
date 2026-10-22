import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const actionVerbs = {
    hug: 'hugs',
    kiss: 'kisses',
    cuddle: 'cuddles',
    pat: 'pats',
    wave: 'waves to',
    highfive: 'high-fives',
    dance: 'dances with'
};

function getContextInfo(message) {
    const content = message.message || {};
    return content.extendedTextMessage?.contextInfo
        || content.imageMessage?.contextInfo
        || content.videoMessage?.contextInfo
        || content.documentMessage?.contextInfo
        || {};
}

function getTargetJid(message) {
    const contextInfo = getContextInfo(message);
    const mention = contextInfo.mentionedJid?.[0];
    if (mention) return mention;
    if (contextInfo.stanzaId) {
        return contextInfo.participant || message.key?.remoteJid;
    }
    return null;
}

async function getAnimation(action) {
    const response = await fetch(`https://nekos.best/api/v2/${action}`, {
        signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`GIF service returned HTTP ${response.status}`);
    const data = await response.json();
    const url = data.results?.[0]?.url;
    if (!url) throw new Error('GIF service returned no animation');

    const mediaResponse = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!mediaResponse.ok) throw new Error(`GIF download returned HTTP ${mediaResponse.status}`);
    const contentType = mediaResponse.headers.get('content-type') || '';
    const buffer = Buffer.from(await mediaResponse.arrayBuffer());
    if (!buffer.length) throw new Error('Downloaded animation was empty');
    return { buffer, contentType, url };
}

export function createInteractionHandler(action) {
    if (!Object.hasOwn(actionVerbs, action)) {
        throw new RangeError(`Unknown interaction GIF: ${action}`);
    }

    return async (sock, message, _args, context) => {
        const chatId = context.chatId || message.key.remoteJid;
        const targetJid = getTargetJid(message);
        if (!targetJid) {
            await sock.sendMessage(chatId, {
                text: `Reply to someone's message or tag them to use .${action}.`
            }, { quoted: message });
            return;
        }

        let directory;
        try {
            const { buffer, contentType, url } = await getAnimation(action);
            directory = await mkdtemp(path.join(os.tmpdir(), 'samyaza-gif-'));
            const inputPath = path.join(directory, 'animation.gif');
            const outputPath = path.join(directory, 'animation.mp4');
            await writeFile(inputPath, buffer);

            if (contentType.includes('video/mp4') || /\.mp4(?:\?|$)/i.test(url)) {
                await writeFile(outputPath, buffer);
            } else {
                await execFileAsync('ffmpeg', [
                    '-y', '-i', inputPath, '-movflags', '+faststart',
                    '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
                    '-an', outputPath
                ]);
            }

            const video = await readFile(outputPath);
            const targetNumber = targetJid.split('@')[0].split(':')[0];
            await sock.sendMessage(chatId, {
                video,
                mimetype: 'video/mp4',
                gifPlayback: true,
                caption: `@${targetNumber} ${actionVerbs[action]}!`,
                mentions: [targetJid]
            }, { quoted: message });
        } catch (error) {
            console.error(`${action} GIF command failed:`, error);
            await sock.sendMessage(chatId, {
                text: `Couldn't send the ${action} GIF. Please try again later.`
            }, { quoted: message });
        } finally {
            if (directory) await rm(directory, { recursive: true, force: true });
        }
    };
}
