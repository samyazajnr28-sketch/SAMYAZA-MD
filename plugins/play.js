import yts from 'yt-search';

export default {
    command: 'play',
    aliases: ['plays', 'music'],
    category: 'search',
    description: 'Find a song on YouTube and share its official link',
    usage: '.play <song name>',
    async handler(sock, message, args, context) {
        const chatId = context.chatId || message.key.remoteJid;
        const query = args.join(' ').trim();
        if (!query) {
            return sock.sendMessage(chatId, {
                text: 'Usage: .play <song name>'
            }, { quoted: message });
        }

        try {
            const { videos } = await yts(query);
            const video = videos?.[0];
            if (!video?.url) {
                return sock.sendMessage(chatId, {
                    text: 'No results found. Try another title or artist.'
                }, { quoted: message });
            }

            await sock.sendMessage(chatId, {
                text: `🎵 *${video.title}*\n👤 ${video.author?.name || 'Unknown artist'}\n⏱️ ${video.timestamp || 'Unknown duration'}\n\nListen on YouTube: ${video.url}`
            }, { quoted: message });
        } catch (error) {
            console.error('Play search failed:', error);
            await sock.sendMessage(chatId, {
                text: 'Song search failed. Please try again later.'
            }, { quoted: message });
        }
    }
};
