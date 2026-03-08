const SHEET_URL = process.env.GOOGLE_SHEET_URL
    || 'https://script.google.com/macros/s/AKfycbwaMIQjRQnFTdiKFx9TJvup5vdI-q9sz5TWZHl3b5kyPCeoUfOfh19XtWyPpXDaynBYXw/exec';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { event, payload } = req.body || {};

    // Only process new bookings
    if (event !== 'invitee.created') {
        return res.status(200).json({ ok: true, skipped: true });
    }

    const email = payload?.email;
    const startTime = payload?.scheduled_event?.start_time;

    if (!email || !startTime) {
        return res.status(400).json({ error: 'Missing email or start_time' });
    }

    try {
        // Send to Apps Script — it finds the row, writes the date, and sends the confirmation email
        await fetch(SHEET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_session',
                email,
                session_date: startTime,
            }),
        });
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Calendly webhook error:', err);
        return res.status(500).json({ error: 'Failed to process webhook' });
    }
}
