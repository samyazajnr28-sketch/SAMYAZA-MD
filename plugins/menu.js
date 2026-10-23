import os from 'node:os';
import fs from 'node:fs';
import path from 'node:path';
import CONFIG from '../config.js';

const startedAt = Date.now();

function getGreeting(hour) {
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    if (hour < 21) return 'Good evening';
    return 'Good night';
}

function getTimeInfo(timezone) {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hourCycle: 'h23'
    }).formatToParts(now);
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));

    return {
        hour: Number(values.hour),
        time: `${values.hour}:${values.minute}:${values.second}`,
        date: `${values.day}/${values.month}/${values.year}`
    };
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    const parts = [];

    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (remainingSeconds || parts.length === 0) parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
}

function groupCommands(commands) {
    const grouped = new Map();

    for (const command of commands.values()) {
        const rawCategory = String(command.category || 'General').trim();
        const category = rawCategory.toLowerCase() === 'download' ? 'Downloads' : rawCategory;
        if (!grouped.has(category)) grouped.set(category, []);
        grouped.get(category).push(command);
    }

    return [...grouped.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([category, items]) => [
            category,
            items.filter(command => command.name)
                .sort((left, right) => left.name.localeCompare(right.name))
        ]);
}

async function sendMenuMessage(sock, from, msg, text) {
    const assetDir = path.join(process.cwd(), 'assets');
    const customImage = ['jpg', 'jpeg', 'png', 'webp']
        .map(extension => path.join(assetDir, `menu-image.${extension}`))
        .find(imagePath => fs.existsSync(imagePath));
    const defaultImage = path.join(assetDir, 'thumb.png');
    const localImage = customImage || (fs.existsSync(defaultImage) ? defaultImage : null);

    if (localImage) {
        try {
            await sock.sendMessage(from, {
                image: { url: localImage },
                caption: text
            }, { quoted: msg });
            return;
        } catch (error) {
            console.error('Could not send local menu image:', error);
        }
    }

    const images = Array.isArray(CONFIG.MENU_IMAGES)
        ? CONFIG.MENU_IMAGES.filter(image => typeof image === 'string' && image.trim())
        : [];
    const image = images[Math.floor(Math.random() * images.length)];

    if (image) {
        try {
            await sock.sendMessage(from, {
                image: { url: image },
                caption: text
            }, { quoted: msg });
            return;
        } catch (error) {
            console.error('Could not send configured menu image:', error);
        }
    }

    await sock.sendMessage(from, { text }, { quoted: msg });
}

export const commands = [
    {
        name: 'menu',
        aliases: ['commands'],
        description: 'Show all available SAMYAZA-MD commands.',
        category: 'general',
        execute: async ({ sock, from, msg, commands, auteurMessage, nomAuteurMessage }) => {
            const commandList = [...commands.values()];
            if (!commandList.length) {
                await sock.sendMessage(from, {
                    text: 'No commands are currently available.'
                }, { quoted: msg });
                return;
            }

            const timezone = CONFIG.TZ || 'UTC';
            const timeInfo = getTimeInfo(timezone);
            const botName = CONFIG.BOT_NAME || 'SAMYAZA-MD';
            const version = CONFIG.BOT_VERSION || '1.0.0';
            const owner = CONFIG.OWNER_NAME || 'SAMYAZA';
            const prefix = Array.isArray(CONFIG.PREFIXES) && CONFIG.PREFIXES.length
                ? CONFIG.PREFIXES.join(' ')
                : '.';
            const mode = CONFIG.MODE === 'public' ? 'Public' : 'Private';
            const userName = nomAuteurMessage || auteurMessage || 'there';
            const usedMemory = ((os.totalmem() - os.freemem()) / 1024 ** 3).toFixed(2);
            const totalMemory = (os.totalmem() / 1024 ** 3).toFixed(2);
            const uptime = formatUptime(Math.floor((Date.now() - startedAt) / 1000));

            let text = `*${getGreeting(timeInfo.hour)}, ${userName}!*\n\n`;
            text += `╭━━━❒ *${botName}* ❒━━━╮\n`;
            text += `┃ *Owner:* ${owner}\n`;
            text += `┃ *Version:* ${version}\n`;
            text += `┃ *Prefix:* ${prefix}\n`;
            text += `┃ *Mode:* ${mode}\n`;
            text += `┃ *Commands:* ${commandList.length}\n`;
            text += `┃ *Time:* ${timeInfo.time}\n`;
            text += `┃ *Date:* ${timeInfo.date}\n`;
            text += `┃ *Timezone:* ${timezone}\n`;
            text += `┃ *Memory:* ${usedMemory}/${totalMemory} GB\n`;
            text += `┃ *Uptime:* ${uptime}\n`;
            text += `╰━━━━━━━━━━━━━━━━━━╯\n\n`;
            text += `*${botName} COMMANDS*\n`;

            for (const [category, categoryCommands] of groupCommands(commands)) {
                if (!categoryCommands.length) continue;
                text += `\n╭── *${category.toUpperCase()}* ──\n`;
                for (const command of categoryCommands) {
                    text += `│ ${prefix}${command.name}\n`;
                }
                text += '╰────────────\n';
            }

            text += '\nDEVELOPER: SETH\nFOR SUPPORT: +254707475813';
            text += '\nKEEP USING SAMYAZA-MD, DON\'T FORGET TO STAR THE REPO ON GITHUB!';
            await sendMenuMessage(sock, from, msg, text);
        }
    },
    {
        name: 'help',
        aliases: ['guide'],
        description: 'Show help for a command or browse commands by category.',
        category: 'general',
        execute: async ({ sock, from, msg, text, commands }) => {
            const prefix = Array.isArray(CONFIG.PREFIXES) && CONFIG.PREFIXES.length
                ? CONFIG.PREFIXES[0]
                : '.';
            const requestedName = text.trim().toLowerCase();

            if (requestedName) {
                const command = commands.get(requestedName)
                    || [...commands.values()].find(item =>
                        item.aliases?.some(alias => alias.toLowerCase() === requestedName)
                    );

                if (!command) {
                    await sock.sendMessage(from, {
                        text: `Command "${requestedName}" was not found. Use ${prefix}menu to browse commands.`
                    }, { quoted: msg });
                    return;
                }

                const aliases = command.aliases?.length
                    ? command.aliases.join(', ')
                    : 'None';
                const usage = command.usage || `${prefix}${command.name}`;
                const details = [
                    `*${CONFIG.BOT_NAME || 'SAMYAZA-MD'} HELP*`,
                    '',
                    `*Command:* ${prefix}${command.name}`,
                    `*Description:* ${command.description || 'No description available.'}`,
                    `*Category:* ${command.category || 'general'}`,
                    `*Usage:* ${usage}`,
                    `*Aliases:* ${aliases}`
                ].join('\n');

                await sock.sendMessage(from, { text: details }, { quoted: msg });
                return;
            }

            const textOutput = [
                `*${CONFIG.BOT_NAME || 'SAMYAZA-MD'} HELP*`,
                '',
                `Use *${prefix}menu* to see all commands.`,
                `Use *${prefix}help <command>* for command details.`
            ].join('\n');
            await sock.sendMessage(from, { text: textOutput }, { quoted: msg });
        }
    }
];
