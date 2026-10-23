export default async function handler(request, response) {
    const backend = process.env.BOT_SERVER_URL?.replace(/\/$/, '');
    if (!backend) return response.status(500).json({ message: 'BOT_SERVER_URL is not configured.' });
    if (request.method !== 'POST') return response.status(405).json({ message: 'Method not allowed.' });
    try {
        const result = await fetch(`${backend}/api/pairing`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request.body || {}) });
        response.status(result.status).setHeader('content-type', 'application/json');
        response.send(await result.text());
    } catch (error) { response.status(502).json({ message: `Bot backend unavailable: ${error.message}` }); }
}
