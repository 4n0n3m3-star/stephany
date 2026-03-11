import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const SHEET_URL = process.env.GOOGLE_SHEET_URL
    || 'https://script.google.com/macros/s/AKfycbwaMIQjRQnFTdiKFx9TJvup5vdI-q9sz5TWZHl3b5kyPCeoUfOfh19XtWyPpXDaynBYXw/exec';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body || {};
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email' });
    }

    try {
        await Promise.all([
            // Notification to Stephany
            resend.emails.send({
                from: 'LUMI Atelier <art@stephanytattoo.com>',
                to: 'art@stephanytattoo.com',
                subject: '✦ Nova subscrição — Inner Circle',
                html: buildNotification(email),
            }),

            // Welcome email to subscriber
            resend.emails.send({
                from: 'Stephany Ribeiro - LUMI Atelier <art@stephanytattoo.com>',
                to: email,
                subject: '✦ Bem-vinda ao inner circle',
                html: buildWelcome(),
            }),

            // Log to Google Sheet
            fetch(SHEET_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Inner Circle',
                    email,
                    source: 'inner-circle-popup',
                    date: new Date().toISOString(),
                }),
            }).catch(err => console.error('Sheet log failed:', err)),
        ]);

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Inner circle error:', err);
        return res.status(500).json({ error: 'Failed' });
    }
}

function buildNotification(email) {
    return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:32px;background:#ECD9D0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="480" cellpadding="0" cellspacing="0" style="background:#FDFAF7;max-width:480px;">
    <tr><td style="background:#2C1A0E;padding:28px 40px;">
      <p style="margin:0;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#ECD9D0;">Inner Circle</p>
      <p style="margin:6px 0 0;font-size:7px;letter-spacing:0.2em;text-transform:uppercase;color:#B09080;">Nova subscrição</p>
    </td></tr>
    <tr><td style="padding:36px 40px;">
      <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#B09080;">Email</p>
      <p style="margin:0 0 28px;font-size:20px;font-weight:300;color:#2C1A0E;">${email}</p>
      <div style="width:32px;height:1px;background:#D0B8AC;margin:0 0 20px;"></div>
      <p style="margin:0;font-size:13px;color:#7A5C48;line-height:1.7;font-weight:300;">Este contacto foi adicionado automaticamente à tua lista Inner Circle e registado no Google Sheet.</p>
    </td></tr>
  </table>
</body></html>`;
}

function buildWelcome() {
    return `<!DOCTYPE html>
<html lang="pt"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#ECD9D0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ECD9D0;padding:48px 24px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;background:#FDFAF7;">

      <tr><td style="background:#2C1A0E;padding:40px 48px;text-align:center;">
        <p style="margin:0;font-size:14px;font-weight:400;letter-spacing:0.28em;text-transform:uppercase;color:#ECD9D0;">Stephany Ribeiro</p>
        <p style="margin:10px 0 0;font-size:8px;letter-spacing:0.22em;text-transform:uppercase;color:#B09080;">Arte que vive na tua pele</p>
      </td></tr>

      <tr><td style="padding:52px 48px 8px;">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#B09080;">✦ Inner Circle</p>
        <p style="margin:0 0 28px;font-size:30px;font-weight:300;color:#2C1A0E;line-height:1.2;">Bem-vinda ao círculo.</p>
        <div style="width:32px;height:1px;background:#D0B8AC;margin:0 0 32px;"></div>

        <p style="margin:0 0 20px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">Para além das tatuagens… algo novo está a nascer. Peças pensadas para durar uma vida. Edições que não voltam. Arte que se pode tocar e sentir.</p>

        <p style="margin:0 0 20px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">Serás a primeira a saber quando algo especial estiver pronto — antes de qualquer anúncio público.</p>

        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">Sem spam, sem ruído. Apenas atualizações tranquilas, com significado.</p>
      </td></tr>

      <tr><td style="padding:0 48px;"><div style="height:1px;background:#ECD9D0;"></div></td></tr>

      <tr><td style="padding:32px 48px 40px;">
        <p style="margin:0 0 2px;font-size:13px;color:#2C1A0E;font-weight:400;">Stephany Ribeiro</p>
        <p style="margin:0 0 12px;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#B09080;">LUMI Atelier · Venda do Pinheiro, Portugal</p>
        <a href="mailto:art@stephanytattoo.com" style="font-size:11px;color:#A77049;text-decoration:none;letter-spacing:0.05em;">art@stephanytattoo.com</a>
      </td></tr>

      <tr><td style="padding:0 48px 32px;">
        <p style="margin:0;font-size:10px;color:#B09080;line-height:1.6;">
          Recebeste este email porque te subscreveste no inner circle em stephanytattoo.com.
          Se não quiseres receber mais emails, responde com "cancelar".
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}
