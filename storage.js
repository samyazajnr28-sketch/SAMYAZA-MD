import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');

export function dataFile(name) {
    return path.join(dataDir, name);
}

function readSettings() {
    const settingsPath = dataFile('settings.json');
    if (!fs.existsSync(settingsPath)) return {};

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        throw new TypeError('Settings storage must contain a JSON object.');
    }
    return settings;
}

function writeSettings(settings) {
    fs.mkdirSync(dataDir, { recursive: true });
    const settingsPath = dataFile('settings.json');
    const temporaryPath = `${settingsPath}.tmp`;
    fs.writeFileSync(temporaryPath, `${JSON.stringify(settings, null, 2)}\n`);
    fs.renameSync(temporaryPath, settingsPath);
}

export const store = {
    async getSetting(namespace, key) {
        return readSettings()[namespace]?.[key] ?? null;
    },

    async saveSetting(namespace, key, value) {
        const settings = readSettings();
        settings[namespace] = {
            ...(settings[namespace] || {}),
            [key]: value
        };
        writeSettings(settings);
    },

    async getAllSettings(namespace) {
        return { ...(readSettings()[namespace] || {}) };
    },

    async getBotMode() {
        return (await this.getSetting('global', 'botMode')) || 'public';
    },

    async setBotMode(mode) {
        await this.saveSetting('global', 'botMode', mode);
    },

    async incrementMessageCount(chatId, userId) {
        const messageCount = (await this.getSetting('global', 'messageCount')) || {};
        const chatCounts = messageCount[chatId] || {};
        chatCounts[userId] = (chatCounts[userId] || 0) + 1;
        messageCount[chatId] = chatCounts;
        await this.saveSetting('global', 'messageCount', messageCount);
    },

    async getAllMessageCounts() {
        return {
            messageCount: (await this.getSetting('global', 'messageCount')) || {}
        };
    }
};

store.messages = Object.create(null);
