import path from 'node:path';
import { createServer } from 'node:http';
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState
} from '@whiskeysockets/baileys';
import pino from 'pino';
import QRCode from 'qrcode';
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
import commandHandler from './lib/commandHandler.js';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const authDir = path.join(rootDir, 'auth_info');
const pluginDir = path.join(rootDir, 'plugins');
const logger = pino({ level: CONFIG.LOG_LEVEL || 'silent' });

const commands = await loadCommands(pluginDir);
commandHandler.commands = commands;
commandHandler.aliases = new Map();
commandHandler.categories = new Map();
for (const command of commands.values()) {
    for (const alias of command.aliases || []) commandHandler.aliases.set(alias.toLowerCase(), command.name);
    const category = command.category || 'general';
    if (!commandHandler.categories.has(category)) commandHandler.categories.set(category, []);
    commandHandler.categories.get(category).push(command);
}
let socket;
const sessions = new Map();

function normalizePhone(value) {
    return String(value || '').replace(/\D/g, '');
}
let webState = {
    status: 'starting',
    qr: null,
    qrAvailable: false,
    qrVersion: 0,
    pairingCode: null,
    message: 'Starting WhatsApp…'
};
let qrImageBuffer;

const webPage = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SAMYAZA-MD pairing</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        :root { color-scheme: dark; font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        * { box-sizing: border-box; }
        #starfield { position: fixed; inset: 0; z-index: -2; width: 100%; height: 100%; pointer-events: none; }
        body { position: relative; isolation: isolate; overflow-x: hidden; margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #030910; color: #f4f7f9; }
        body::before, body::after { content: ''; position: fixed; z-index: -1; width: 520px; height: 520px; border-radius: 50%; filter: blur(70px); opacity: .38; pointer-events: none; animation: float 12s ease-in-out infinite alternate; }
        body::before { top: -190px; left: -160px; background: #00e676; }
        body::after { right: -190px; bottom: -220px; background: #2979ff; animation-delay: -5s; }
        body { background-image: linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px), radial-gradient(circle at 50% 0%, #123d40 0, transparent 52%); background-size: 42px 42px, 42px 42px, 100% 100%; }
        @keyframes float { to { transform: translate3d(35px, 24px, 0) scale(1.12); } }
        main { position: relative; width: min(92vw, 560px); padding: clamp(24px, 5vw, 38px); border: 1px solid #ffffff1c; border-radius: 26px; background: linear-gradient(145deg, #172a2be8, #101b25e8); box-shadow: 0 30px 90px #0009, inset 0 1px #ffffff18; backdrop-filter: blur(22px); transition: transform .35s ease, box-shadow .35s ease; }
        main:hover { transform: translateY(-4px); box-shadow: 0 38px 100px #000b, 0 0 50px #00e67616, inset 0 1px #ffffff24; }
        h1 { margin: 0; font-family: 'Orbitron', sans-serif; letter-spacing: .04em; font-size: clamp(30px, 7vw, 44px); background: linear-gradient(90deg, #fff, #7fffc0); -webkit-background-clip: text; background-clip: text; color: transparent; } p { color: #b6c2ca; line-height: 1.5; }
        .tabs { display: flex; gap: 10px; margin: 24px 0 16px; } button { cursor: pointer; border: 1px solid transparent; border-radius: 12px; padding: 12px 17px; font-weight: 750; background: linear-gradient(135deg, #4dff9a, #19c968); color: #06140b; box-shadow: 0 8px 20px #00d76528; transition: transform .22s ease, box-shadow .22s ease, filter .22s ease, background .22s ease; }
        button:hover { transform: translateY(-3px); filter: brightness(1.12); box-shadow: 0 12px 28px #00e67655; } button:active { transform: translateY(0) scale(.97); } button:focus-visible, input:focus-visible { outline: 3px solid #4dff9a88; outline-offset: 3px; }
        button.secondary { background: #ffffff0b; border-color: #ffffff1c; color: #f4f7f9; box-shadow: none; } button.secondary:hover { background: #ffffff18; box-shadow: 0 10px 24px #0004; }
        input { width: 100%; box-sizing: border-box; padding: 14px 15px; border: 1px solid #ffffff22; border-radius: 12px; background: #071218aa; color: inherit; font-size: 16px; transition: border-color .22s ease, box-shadow .22s ease, background .22s ease; } input:hover { border-color: #ffffff45; background: #071218dd; } input:focus { border-color: #4dff9a; box-shadow: 0 0 0 4px #4dff9a1c, 0 8px 22px #0004; }
        .panel { padding: 20px; border: 1px solid #ffffff1c; border-radius: 18px; background: #0712185c; box-shadow: inset 0 1px #ffffff0d; transition: border-color .3s ease, background .3s ease; } .panel:hover { border-color: #4dff9a45; background: #07121880; } .hidden { display: none; }
        #qr { display: block; width: min(100%, 320px); margin: 18px auto 4px; padding: 8px; border-radius: 15px; background: white; box-shadow: 0 12px 35px #0008; transition: transform .3s ease, box-shadow .3s ease; } #qr:hover { transform: scale(1.025) rotate(.5deg); box-shadow: 0 18px 45px #000a; }
        #code { font: 700 28px ui-monospace, monospace; letter-spacing: 4px; text-align: center; margin: 20px 0; color: #4dff9a; text-shadow: 0 0 20px #00e67677; }
        .status { margin-top: 18px; padding: 10px 13px; border-radius: 10px; background: #ffffff0a; color: #d7e5e8; font-size: 14px; } .hint { font-size: 13px; }
        @media (max-width: 480px) { body { padding: 12px; } .tabs { flex-direction: column; } .tabs button { width: 100%; } main:hover { transform: none; } }
    </style>
</head>
<body><canvas id="starfield" aria-hidden="true"></canvas><main>
    <h1>SAMYAZA-MD</h1>
    <p>Link WhatsApp by scanning the QR code or using a phone-number pairing code.</p>
    <div class="tabs"><button id="qrTab">QR code</button><button class="secondary" id="pairTab">Pairing code</button></div>
    <section id="qrPanel" class="panel"><div id="qrMessage">Waiting for a QR code…</div><img id="qr" class="hidden" alt="WhatsApp QR code"></section>
    <section id="pairPanel" class="panel hidden"><form id="pairForm"><label for="phone">Phone number with country code</label><p class="hint">Use digits only or include +, for example +254700000000.</p><input id="phone" name="phone" required minlength="7" maxlength="16" placeholder="+254700000000"><br><br><button type="submit">Get pairing code</button></form><div id="code"></div><p id="pairMessage"></p></section>
    <div class="status" id="status">Connecting…</div>
    <p class="hint">On WhatsApp: Linked devices → Link a device, or Link with phone number.</p>
</main>
<script>
const qrPanel = document.querySelector('#qrPanel'), pairPanel = document.querySelector('#pairPanel');
const qrTab = document.querySelector('#qrTab'), pairTab = document.querySelector('#pairTab');
document.querySelector('#qr').onerror = () => { document.querySelector('#qr').classList.add('hidden'); document.querySelector('#qrMessage').textContent = 'The QR image could not be loaded. Waiting for the next QR code…'; };
function setTab(tab) {
    const qrActive = tab === 'qr';
    qrPanel.classList.toggle('hidden', !qrActive); pairPanel.classList.toggle('hidden', qrActive);
    qrTab.classList.toggle('secondary', !qrActive); pairTab.classList.toggle('secondary', qrActive);
}
qrTab.onclick = () => setTab('qr');
pairTab.onclick = () => setTab('pair');
async function refresh() {
    try {
        const state = await (await fetch('/api/status')).json();
        document.querySelector('#status').textContent = state.message || state.status;
        const qr = document.querySelector('#qr');
        if (state.qrAvailable) { qr.src = '/api/qr.png?v=' + state.qrVersion; qr.classList.remove('hidden'); document.querySelector('#qrMessage').textContent = 'Scan this with WhatsApp.'; }
        else { qr.classList.add('hidden'); document.querySelector('#qrMessage').textContent = state.status === 'connected' ? 'WhatsApp is already connected.' : 'Waiting for a QR code…'; }
        if (state.pairingCode) document.querySelector('#code').textContent = state.pairingCode;
    } catch { document.querySelector('#status').textContent = 'Web server is waiting for the bot…'; }
}
document.querySelector('#pairForm').onsubmit = async event => {
    event.preventDefault();
    const message = document.querySelector('#pairMessage'); message.textContent = 'Requesting code…';
    const response = await fetch('/api/pairing', { method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({ phone: document.querySelector('#phone').value }) });
    const result = await response.json();
    message.textContent = result.message || (response.ok ? 'Code generated.' : 'Could not generate a code.');
    if (result.code) document.querySelector('#code').textContent = result.code;
};
refresh(); setInterval(refresh, 2000);
const canvas = document.querySelector('#starfield'), ctx = canvas.getContext('2d');
let stars = [];
function resizeStars() { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); stars = Array.from({length: Math.min(150, Math.floor(innerWidth / 8))}, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 1.8 + .3, v: Math.random() * .35 + .08, phase: Math.random() * 7 })); }
function drawStars(time = 0) {
    const w = innerWidth, h = innerHeight;
    ctx.clearRect(0, 0, w, h);
    for (const star of stars) {
        star.y -= star.v;
        star.x += Math.sin(time / 2400 + star.phase) * .08;
        if (star.y < -4) { star.y = h + 4; star.x = Math.random() * w; }
    }
    ctx.lineWidth = .7;
    for (let i = 0; i < stars.length; i += 1) {
        for (let j = i + 1; j < stars.length; j += 1) {
            const a = stars[i], b = stars[j], dx = a.x - b.x, dy = a.y - b.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 145) continue;
            const alpha = (1 - distance / 145) * .32;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(74, 205, 255, ' + alpha + ')';
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
    }
    for (const star of stars) {
        const glow = .35 + Math.sin(time / 700 + star.phase) * .25;
        ctx.beginPath(); ctx.fillStyle = 'rgba(99, 236, 255, ' + glow + ')';
        ctx.shadowBlur = 10; ctx.shadowColor = '#31e6ff';
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.shadowBlur = 0;
    requestAnimationFrame(drawStars);
}
resizeStars(); addEventListener('resize', resizeStars); requestAnimationFrame(drawStars);
</script></body></html>`;

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(payload));
}

const webServer = createServer(async (request, response) => {
    if (request.method === 'GET' && request.url === '/') {
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end(webPage);
        return;
    }
    if (request.method === 'GET' && request.url === '/api/status') {
        sendJson(response, 200, webState);
        return;
    }
    if (request.method === 'GET' && request.url?.startsWith('/api/qr.png')) {
        if (!qrImageBuffer) {
            response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
            response.end('QR code is not available');
            return;
        }
        response.writeHead(200, { 'content-type': 'image/png', 'content-length': qrImageBuffer.length, 'cache-control': 'no-store, max-age=0' });
        response.end(qrImageBuffer);
        return;
    }
    if (request.method === 'POST' && request.url === '/api/pairing') {
        let body = '';
        for await (const chunk of request) body += chunk;
        try {
            const phoneNumber = String(JSON.parse(body).phone || '').replace(/\D/g, '');
            if (phoneNumber.length < 7 || phoneNumber.length > 15) {
                sendJson(response, 400, { message: 'Enter a valid international phone number (7–15 digits).' });
                return;
            }
            const existingSession = [...sessions.values()].find(session =>
                session.phoneNumber === phoneNumber
                || normalizePhone(session.sock?.user?.id) === phoneNumber
            );
            if (existingSession) {
                sendJson(response, 409, {
                    message: `+${phoneNumber} is already connected. Delete that linked device/session before pairing it again.`
                });
                return;
            }

            const sessionKey = `account:${phoneNumber}`;
            const sessionDir = path.join(authDir, 'accounts', phoneNumber);
            webState = { ...webState, pairingCode: null, message: 'Starting a new WhatsApp session…' };
            const pairingSocket = await startBot(sessionDir, sessionKey, phoneNumber, false);
            const code = await pairingSocket.requestPairingCode(phoneNumber);
            webState = { ...webState, pairingCode: code, message: 'Enter this code in WhatsApp → Linked devices → Link with phone number.' };
            sendJson(response, 200, { code, message: webState.message });
        } catch (error) {
            console.error('Could not generate a web pairing code:', error);
            const statusCode = error.code === 'ALREADY_CONNECTED' ? 409 : 500;
            sendJson(response, statusCode, { message: error.message || 'Could not generate a pairing code.' });
        }
        return;
    }
    response.writeHead(404); response.end('Not found');
});

const webPort = Number(process.env.PORT || 3000);
const webHost = process.env.HOST || '0.0.0.0';
webServer.listen(webPort, webHost, () => console.log(`Pairing web server: http://localhost:${webPort}`));

async function chooseAuthOptions(isRegistered) {
    return { method: 'qr' };
}

async function startBot(sessionDir = authDir, sessionKey = 'default', requestedPhone = null, allowExisting = true) {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    if (requestedPhone && state.creds.registered && !allowExisting) {
        const error = new Error(`+${requestedPhone} is already connected. Delete that linked device/session before pairing it again.`);
        error.code = 'ALREADY_CONNECTED';
        throw error;
    }
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

    if (sessionKey === 'default') socket = sock;
    sessions.set(sessionKey, { sock, phoneNumber: requestedPhone, status: 'connecting' });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('call', async calls => {
        for (const call of calls) {
            await handleIncomingCall(sock, call);
        }
    });

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr && authOptions.method === 'qr') {
            qrImageBuffer = await QRCode.toBuffer(qr, { type: 'png', width: 360, margin: 2, errorCorrectionLevel: 'M' });
            webState = { ...webState, status: 'qr', qr: true, qrAvailable: true, qrVersion: webState.qrVersion + 1, message: 'Scan the QR code with WhatsApp.' };
            console.log('Scan this QR code with WhatsApp to connect:');
            console.log('On your phone, open Linked devices > Link a device, then scan it.');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            const session = sessions.get(sessionKey);
            if (session) {
                session.status = 'connected';
                session.phoneNumber = normalizePhone(sock.user?.id) || session.phoneNumber;
            }
            qrImageBuffer = undefined;
            webState = { ...webState, status: 'connected', qr: null, qrAvailable: false, message: 'WhatsApp connected.' };
            console.log('SAMYAZA-MD connected.');
            refreshOnlinePresence();
            if (!onlinePresenceInterval) {
                onlinePresenceInterval = setInterval(refreshOnlinePresence, 25000);
            }
        }

        if (connection === 'close') {
            const session = sessions.get(sessionKey);
            qrImageBuffer = undefined;
            webState = { ...webState, status: 'disconnected', qr: null, qrAvailable: false, message: 'WhatsApp disconnected; reconnecting…' };
            clearInterval(onlinePresenceInterval);
            onlinePresenceInterval = undefined;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode === DisconnectReason.loggedOut) {
                sessions.delete(sessionKey);
                console.error('WhatsApp logged out. Remove auth_info and restart to pair again.');
                return;
            }

            console.warn('WhatsApp connection closed; reconnecting in 3 seconds.');
            setTimeout(() => {
                startBot(sessionDir, sessionKey, requestedPhone, true).catch(error => {
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

            const messageStoreKey = `${sessionKey}:${msg.key.remoteJid}`;
            const chatMessages = store.messages[messageStoreKey] || (store.messages[messageStoreKey] = []);
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

    return sock;
}

startBot()
    .then(async () => {
        const accountsDir = path.join(authDir, 'accounts');
        try {
            const entries = await readdir(accountsDir, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory() || !/^\d{7,15}$/.test(entry.name)) continue;
                startBot(
                    path.join(accountsDir, entry.name),
                    `account:${entry.name}`,
                    entry.name,
                    true
                ).catch(error => console.error(`Could not restore account +${entry.name}:`, error));
            }
        } catch (error) {
            if (error.code !== 'ENOENT') console.error('Could not restore saved accounts:', error);
        }
    })
    .catch(error => {
        console.error('Bot startup failed:', error);
        process.exitCode = 1;
    });
