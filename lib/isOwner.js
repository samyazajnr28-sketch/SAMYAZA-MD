function cleanJid(value) {
    return String(value || '').split('@')[0].split(':')[0].replace(/\D/g, '');
}

export { cleanJid };

export default async function isOwnerOrSudo(senderId, sock) {
    if (!senderId || !sock) return false;
    if (cleanJid(senderId) === cleanJid(sock.user?.id)) return true;
    return false;
}
