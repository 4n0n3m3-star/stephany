const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwaMIQjRQnFTdiKFx9TJvup5vdI-q9sz5TWZHl3b5kyPCeoUfOfh19XtWyPpXDaynBYXw/exec';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await fetch(SHEET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Sheet error:', err);
        return res.status(500).json({ error: 'Failed to log to sheet' });
    }
}
