import path from 'node:path';1
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import CONFIG from './config.js';
import { getMessageText, handleMessage, loadCommands } from './handler.js';
import { getAutomationSettings } from './setting.js';
import store from './lib/lightweight_store.js';
import { handleIncomingCall } from './plugins/anticall.js';
import { handleMessageRevocation, storeMessage } from './plugins/antidelete.js';
import { handleAutoread } from './plugins/autoread.js';
import { handleStatusUpdate } from './plugins/autostatus.js';
import { handleAutotypingForCommand, isAutotypingEnabled } from './plugins/autotyping.js';
import { handleAutoReply } from './plugins/autoreply.js';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const authDir = path.join(rootDir, 'auth_info');
const pluginDir = path.join(rootDir, 'plugins');
const logger = pino({ level: CONFIG.LOG_LEVEL || 'silent' });

const commands = await loadCommands(pluginDir);
let selectedAuthOptions;

async function chooseAuthOptions(isRegistered) {
    if (isRegistered) return { method: 'qr' };
    if (selectedAuthOptions) return selectedAuthOptions;

    if (!process.stdin.isTTY || !process.stdout.isTTY) {
        console.log('No interactive terminal detected; using QR-code linking.');
        selectedAuthOptions = { method: 'qr' };
        return selectedAuthOptions;
    }

    const terminal = createInterface({ input: process.stdin, output: process.stdout });
    try {
        console.log('\nChoose how to link WhatsApp:');
        console.log('1. QR code (default)');
        console.log('2. Pairing code (enter your phone number with country code)');
        console.log('On WhatsApp, open Linked devices > Link a device.');
        const choice = (await terminal.question('Choose 1 or 2: ')).trim();

        if (choice !== '2' && choice.toLowerCase() !== 'pair' && choice.toLowerCase() !== 'pairing') {
            selectedAuthOptions = { method: 'qr' };
            return selectedAuthOptions;
        }

        while (true) {
            const input = await terminal.question('Phone number with country code (for example, +254700000000): ');
            const phoneNumber = input.replace(/\D/g, '');
            if (phoneNumber.length >= 7 && phoneNumber.length <= 15) {
                selectedAuthOptions = { method: 'pairing', phoneNumber };
                return selectedAuthOptions;
            }
            console.log('Enter a valid international phone number (7–15 digits).');
        }
    } finally {
        terminal.close();
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const authOptions = await chooseAuthOptions(state.creds.registered);
    let onlinePresenceInterval;
    const sock = makeWASocket({
        auth: state,
        logger,
        printQRInTerminal: false
    });
    const refreshOnlinePresence = () => {
        try {
            if (getAutomationSettings().alwaysonline) {
                sock.sendPresenceUpdate('available').catch(error => {
                    console.error('Could not refresh online presence:', error);
                });
            }
        } catch (error) {
            console.error('Could not read always-online settings:', error);
        }
    };

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('call', async calls => {
        for (const call of calls) {
            await handleIncomingCall(sock, call);
        }
    });

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr && authOptions.method === 'qr') {
            console.log('Scan this QR code with WhatsApp to connect:');
            console.log('On your phone, open Linked devices > Link a device, then scan it.');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log('SAMYAZA-MD connected.');
            refreshOnlinePresence();
            if (!onlinePresenceInterval) {
                onlinePresenceInterval = setInterval(refreshOnlinePresence, 25000);
            }
        }

        if (connection === 'close') {
            clearInterval(onlinePresenceInterval);
            onlinePresenceInterval = undefined;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                console.error('WhatsApp logged out. Remove auth_info and restart to pair again.');
                return;
            }

            console.warn('WhatsApp connection closed; reconnecting in 3 seconds.');
            setTimeout(() => {
                startBot().catch(error => {
                    console.error('Reconnect failed:', error);
                });
            }, 3000);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (msg.key?.remoteJid === 'status@broadcast') {
                await handleStatusUpdate(sock, msg);
                continue;
            }

            const chatMessages = store.messages[msg.key.remoteJid] || (store.messages[msg.key.remoteJid] = []);
            chatMessages.push(msg);
            if (chatMessages.length > 200) chatMessages.splice(0, chatMessages.length - 200);

            if (msg.message?.protocolMessage?.key?.id) {
                await handleMessageRevocation(sock, msg);
                continue;
            }

            await storeMessage(sock, msg);
            await handleAutoread(sock, msg);
            await handleAutoReply(sock, msg, getMessageText(msg.message));
            await handleMessage({
                sock,
                msg,
                commands,
                config: CONFIG,
                onCommandStart: async ({ from }) => {
                    if (getAutomationSettings().autorecording) {
                        await sock.sendPresenceUpdate('recording', from);
                        return () => sock.sendPresenceUpdate('paused', from);
                    }
                    if (await isAutotypingEnabled()) {
                        if (await handleAutotypingForCommand(sock, from)) {
                            return () => sock.sendPresenceUpdate('paused', from);
                        }
                    }
                }
            });
        }
    });

    if (!state.creds.registered && authOptions.method === 'pairing') {
        try {
            const pairingCode = await sock.requestPairingCode(authOptions.phoneNumber);
            console.log(`\nWhatsApp pairing code: ${pairingCode}`);
            console.log('On your phone, open Linked devices > Link a device > Link with phone number, then enter this code.');
        } catch (error) {
            console.error('Could not generate a WhatsApp pairing code:', error);
        }
    }

    return sock;
}

startBot().catch(error => {
    console.error('Bot startup failed:', error);
    process.exitCode = 1;
});
