import { store } from '../storage.js';

function replaceTokens(template, chatId, message) {
    const user = message.key.participant || message.key.remoteJid;
    return template.replaceAll('{user}', `@${user.split('@')[0]}`).replaceAll('{group}', chatId);
}

export async function handleWelcome(sock, chatId, message, input) {
    const value = input.trim();
    if (value === 'on' || value === 'off') {
        await store.saveSetting(chatId, 'welcome', { enabled: value === 'on' });
        return sock.sendMessage(chatId, { text: `✅ Welcome messages turned ${value}.` }, { quoted: message });
    }
    if (value) await store.saveSetting(chatId, 'welcome', { enabled: true, message: value });
    return sock.sendMessage(chatId, { text: '✅ Welcome settings updated. Use `on`, `off`, or provide a message.' }, { quoted: message });
}

export async function handleGoodbye(sock, chatId, message, input) {
    const value = input.trim();
    if (value === 'on' || value === 'off') {
        await store.saveSetting(chatId, 'goodbye', { enabled: value === 'on' });
        return sock.sendMessage(chatId, { text: `✅ Goodbye messages turned ${value}.` }, { quoted: message });
    }
    if (value) await store.saveSetting(chatId, 'goodbye', { enabled: true, message: value });
    return sock.sendMessage(chatId, { text: '✅ Goodbye settings updated. Use `on`, `off`, or provide a message.' }, { quoted: message });
}

export function renderWelcome(template, chatId, message) {
    return replaceTokens(template, chatId, message);
}
