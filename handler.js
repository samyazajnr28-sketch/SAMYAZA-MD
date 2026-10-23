import { pathToFileURL } from 'node:url';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import store from './lib/lightweight_store.js';

export function getMessageText(message) {
    let content = message;

    while (content) {
        const type = Object.keys(content)[0];
        if (!type) return '';

        const value = content[type];
        if (type === 'ephemeralMessage' || type.startsWith('viewOnceMessage')) {
            content = value?.message;
            continue;
        }
        if (type === 'documentWithCaptionMessage') {
            content = value?.message;
            continue;
        }

        return value?.text
            || value?.caption
            || value?.selectedButtonId
            || value?.singleSelectReply?.selectedRowId
            || value?.selectedId
            || (type === 'conversation' ? value : '');
    }

    return '';
}

export async function loadCommands(pluginDir) {
    const commands = new Map();
    const entries = (await readdir(pluginDir, { withFileTypes: true }))
        .filter(entry => entry.isFile() && entry.name.endsWith('.js'))
        .sort((a, b) => a.name.localeCompare(b.name));
    let loadedPlugins = 0;

    for (const entry of entries) {
        const pluginPath = path.join(pluginDir, entry.name);
        let plugin;
        try {
            plugin = await import(pathToFileURL(pluginPath).href);
        } catch (error) {
            console.error(`Could not load plugin ${entry.name}:`, error);
            continue;
        }
        const pluginCommands = [];
        const legacyPlugins = [
            ...(Array.isArray(plugin.commands) ? plugin.commands : []),
            plugin.default
        ].filter(command => command?.command && typeof command.handler === 'function');

        for (const legacyPlugin of legacyPlugins) {
            pluginCommands.push({
                ...legacyPlugin,
                name: legacyPlugin.name || legacyPlugin.command,
                legacy: true,
                execute: context => {
                    const args = context.text
                        ? context.text.trim().split(/\s+/)
                        : [];
                    const pluginConfig = {
                        ...context.config,
                        botName: context.config.BOT_NAME || 'SAMYAZA-MD',
                        version: context.config.BOT_VERSION,
                        botOwner: context.config.OWNER_NAME,
                        ownerNumber: context.config.GLOBAL_OWNER,
                        prefix: context.config.PREFIXES?.[0] || '.',
                        mode: context.config.MODE,
                        timezone: context.config.TZ
                    };
                    return legacyPlugin.handler(context.sock, context.msg, args, {
                        ...context,
                        chatId: context.from,
                        commandName: context.commandName,
                        config: pluginConfig,
                        channelInfo: {}
                    });
                }
            });
        }

        if (!legacyPlugins.length && !Array.isArray(plugin.commands)) {
            throw new TypeError(
                `Plugin ${entry.name} must export commands[] or a default { command, handler } plugin.`
            );
        }

        if (Array.isArray(plugin.commands)) {
            pluginCommands.push(...plugin.commands.filter(command => typeof command?.execute === 'function'));
        }

        for (const command of pluginCommands) {
            if (!command?.name || typeof command.execute !== 'function') {
                throw new TypeError(`Plugin ${entry.name} contains an invalid command.`);
            }

            const name = command.name.toLowerCase();
            if (commands.has(name)) {
                const existing = commands.get(name);
                // Prefer the current execute-based command API over legacy
                // handler plugins when both implementations use the same name.
                if (!existing.legacy && command.legacy) {
                    console.warn(`Skipping duplicate command name: ${name} from ${entry.name}.`);
                    continue;
                }
                if (existing.legacy && !command.legacy) {
                    console.warn(`Replacing legacy duplicate command: ${name} from ${entry.name}.`);
                    commands.set(name, command);
                    continue;
                }
                console.warn(`Skipping duplicate command name: ${name} from ${entry.name}.`);
                continue;
            }
            commands.set(name, command);
        }
        loadedPlugins += 1;
    }

    console.log(`Loaded ${commands.size} commands from ${loadedPlugins} of ${entries.length} plugin(s).`);
    return commands;
}

export async function handleMessage({ sock, msg, commands, config, onCommandStart }) {
    const from = msg.key?.remoteJid;
    if (!from || from === 'status@broadcast') return;

    const body = getMessageText(msg.message).trim();
    if (!body) return;

    const prefixes = Array.isArray(config.PREFIXES) && config.PREFIXES.length
        ? config.PREFIXES
        : ['.'];
    const prefix = prefixes.find(value => value && body.startsWith(value));
    if (!prefix) return;

    const input = body.slice(prefix.length).trim();
    if (!input) return;

    const [requestedName, ...args] = input.split(/\s+/);
    const commandName = requestedName.toLowerCase();
    const command = commands.get(commandName)
        || [...commands.values()].find(item =>
            item.aliases?.some(alias => alias.toLowerCase() === commandName)
        );
    if (!command) return;

    const sender = msg.key.participantAlt || msg.key.participant || (msg.key.fromMe ? sock.user?.id : from);
    const normalizeNumber = value => String(value || '')
        .split('@')[0]
        .split(':')[0]
        .replace(/\D/g, '');
    const senderCandidates = [
        sender,
        msg.key.participant,
        msg.key.participantAlt,
        msg.key.remoteJid
    ].map(normalizeNumber).filter(Boolean);
    const connectedNumber = normalizeNumber(sock.user?.id);
    const isOwner = Boolean(msg.key.fromMe || (connectedNumber && senderCandidates.includes(connectedNumber)));
    const category = String(command.category || '').toLowerCase();
    const ownerOnly = Boolean(
        command.ownerOnly
        || command.strictOwnerOnly
        || category === 'owner'
        || category === 'automation'
        || category === 'privacy'
    );
    const botMode = await store.getBotMode();
    const isGroup = from.endsWith('@g.us');

    if (ownerOnly && !isOwner) {
        await sock.sendMessage(from, {
            text: '❌ This command is available only to the owner of this connected WhatsApp number.'
        }, { quoted: msg });
        return;
    }

    if ((botMode === 'private' || botMode === 'self') && !isOwner) {
        await sock.sendMessage(from, {
            text: '🔒 This bot is in private mode. Only the connected owner can use it.'
        }, { quoted: msg });
        return;
    }

    if (botMode === 'groups' && !isGroup) {
        await sock.sendMessage(from, { text: '👥 This bot is currently available in groups only.' }, { quoted: msg });
        return;
    }

    if (botMode === 'inbox' && isGroup) {
        await sock.sendMessage(from, { text: '💬 This bot is currently available in private chats only.' }, { quoted: msg });
        return;
    }

    const text = args.join(' ');

    let cleanupAutomation;
    try {
        cleanupAutomation = await onCommandStart?.({ sock, from, msg, command });
    } catch (error) {
        console.error(`Command automation startup failed for "${command.name}":`, error);
    }

    try {
        await command.execute({
            sock,
            from,
            msg,
            commandName: command.name,
            text,
            commands,
            config,
            auteurMessage: sender,
            nomAuteurMessage: msg.pushName || sender,
            isOwner,
            isGlobalOwner: isOwner,
            senderIsOwnerOrSudo: isOwner,
            isOwnerOrSudoCheck: isOwner
        });
    } catch (error) {
        console.error(`Command "${command.name}" failed:`, error);
        try {
            await sock.sendMessage(from, {
                text: '❌ Command failed. Please try again.'
            }, { quoted: msg });
        } catch (sendError) {
            console.error('Could not send command error message:', sendError);
        }
    } finally {
        try {
            await cleanupAutomation?.();
        } catch (error) {
            console.error(`Command automation cleanup failed for "${command.name}":`, error);
        }
    }
}
