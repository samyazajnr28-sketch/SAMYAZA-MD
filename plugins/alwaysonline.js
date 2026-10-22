import { getAutomationSettings, setAutomationSetting } from '../setting.js';

export default {
    command: 'alwaysonline',
    aliases: ['online'],
    category: 'automation',
    description: 'Keep the bot presence online while connected',
    usage: '.alwaysonline <on|off>',
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
            const { alwaysonline } = getAutomationSettings();
            await sock.sendMessage(chatId, {
                text: `Always online is currently ${alwaysonline ? 'enabled' : 'disabled'}.\nUsage: .alwaysonline <on|off>`
            }, { quoted: message });
            return;
        }

        setAutomationSetting('alwaysonline', action === 'on');
        await sock.sendPresenceUpdate(action === 'on' ? 'available' : 'unavailable');
        await sock.sendMessage(chatId, {
            text: `Always online ${action === 'on' ? 'enabled' : 'disabled'}.`
        }, { quoted: message });
    }
};
