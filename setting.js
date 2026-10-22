import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
const settingsPath = path.join(dataDir, 'automation.json');
const defaultSettings = {
    autorecording: false,
    alwaysonline: false
};

export function getAutomationSettings() {
    if (!fs.existsSync(settingsPath)) return { ...defaultSettings };

    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
        throw new TypeError('Settings must contain a JSON object.');
    }

    for (const key of Object.keys(defaultSettings)) {
        if (settings[key] !== undefined && typeof settings[key] !== 'boolean') {
            throw new TypeError(`Setting "${key}" must be a boolean.`);
        }
    }

    return { ...defaultSettings, ...settings };
}

export function setAutomationSetting(name, enabled) {
    if (!Object.hasOwn(defaultSettings, name)) {
        throw new RangeError(`Unknown setting: ${name}`);
    }

    const settings = getAutomationSettings();
    settings[name] = Boolean(enabled);
    fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`);
    return settings;
}
