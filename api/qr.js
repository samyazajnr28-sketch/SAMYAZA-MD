export default async function handler(request, response) {
    const backend = process.env.BOT_SERVER_URL?.replace(/\/$/, '');
    if (!backend) return response.status(500).send('BOT_SERVER_URL is not configured.');
    try {
        const result = await fetch(`${backend}/api/qr.png`);
        response.status(result.status).setHeader('content-type', result.headers.get('content-type') || 'image/png');
        response.send(Buffer.from(await result.arrayBuffer()));
    } catch (error) { response.status(502).send(`Bot backend unavailable: ${error.message}`); }
}
