import { getAutomationSettings, setAutomationSetting } from '../setting.js';

export default {
    command: 'autorecording',
    aliases: ['recording'],
    category: 'automation',
    description: 'Show a recording indicator while processing commands',
    usage: '.autorecording <on|off>',
    ownerOnly: true,
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        if (!context.isGlobalOwner && !message.key.fromMe) {
            await sock.sendMessage(chatId, {
                text: 'This command is only available to the bot owner.'
            }, { quoted: message });
            return;
        }

        const action = args[0]?.toLowerCase();
        if (action !== 'on' && action !== 'off') {
            const { autorecording } = getAutomationSettings();
            await sock.sendMessage(chatId, {
                text: `Auto-recording is currently ${autorecording ? 'enabled' : 'disabled'}.\nUsage: .autorecording <on|off>`
            }, { quoted: message });
            return;
        }

        setAutomationSetting('autorecording', action === 'on');
        await sock.sendMessage(chatId, {
            text: `Auto-recording ${action === 'on' ? 'enabled' : 'disabled'}.`
        }, { quoted: message });
    }
};
