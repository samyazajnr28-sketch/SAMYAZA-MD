import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const filters = {
    bass: 'equalizer=f=94:width_type=o:width=2:g=12',
    blown: 'acrusher=.1:1:64:0:log',
    deep: 'asetrate=32000,aresample=48000',
    earrape: 'volume=6',
    fast: 'atempo=1.63',
    fat: 'atempo=1.6',
    nightcore: 'asetrate=52000,aresample=48000,atempo=1.08',
    audioreverse: 'areverse',
    robot: "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)'",
    slow: 'atempo=0.7',
    chipmunk: 'asetrate=64000,aresample=48000,atempo=0.75'
};

async function getAudioBuffer(message) {
    const content = message.message || {};
    const quoted = content.extendedTextMessage?.contextInfo?.quotedMessage;
    const audioMessage = content.audioMessage
        || content.voiceMessage
        || quoted?.audioMessage
        || quoted?.voiceMessage;
    if (!audioMessage) return null;

    const stream = await downloadContentFromMessage(audioMessage, 'audio');
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

export function createAudioEffectHandler(effect) {
    const filter = filters[effect];
    if (!filter) throw new RangeError(`Unknown audio effect: ${effect}`);

    return async (sock, message, _args, context) => {
        const chatId = context.chatId || message.key.remoteJid;
        let directory;
        try {
            const audio = await getAudioBuffer(message);
            if (!audio) {
                await sock.sendMessage(chatId, {
                    text: `Reply to an audio or voice note with .${effect}.`
                }, { quoted: message });
                return;
            }

            directory = await mkdtemp(path.join(os.tmpdir(), 'samyaza-audio-'));
            const inputPath = path.join(directory, 'input.ogg');
            const outputPath = path.join(directory, 'output.ogg');
            await writeFile(inputPath, audio);
            await execFileAsync('ffmpeg', [
                '-y', '-i', inputPath,
                '-af', `${filter},aresample=48000,asetpts=N/SR`,
                '-c:a', 'libopus', '-b:a', '48k', '-ac', '1',
                outputPath
            ]);
            const output = await readFile(outputPath);
            await sock.sendMessage(chatId, {
                audio: output,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: message });
        } catch (error) {
            console.error(`Audio effect ${effect} failed:`, error);
            await sock.sendMessage(chatId, {
                text: 'Audio processing failed. Check that ffmpeg is installed and try again.'
            }, { quoted: message });
        } finally {
            if (directory) await rm(directory, { recursive: true, force: true });
        }
    };
}
