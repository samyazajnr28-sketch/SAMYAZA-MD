export default async function isAdmin(sock, chatId, senderId) {
    try {
        const metadata = await sock.groupMetadata(chatId);
        const participants = metadata?.participants || [];
        const find = jid => participants.find(participant =>
            participant.id === jid || participant.lid === jid
        );
        const sender = find(senderId);
        const bot = find(sock.user?.id);
        return {
            isSenderAdmin: Boolean(sender?.admin),
            isBotAdmin: Boolean(bot?.admin)
        };
    } catch {
        return { isSenderAdmin: false, isBotAdmin: false };
    }
}
