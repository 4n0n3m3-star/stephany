import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, name, email, lang, budget, session_url, message, reason } = req.body;

    if (!email || !name || !type) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const isPt = lang !== 'en';
    let subject, html;

    if (type === 'Orçamento') {
        subject = isPt ? '✨ O teu orçamento — Stephany Ribeiro' : '✨ Your quote — Stephany Ribeiro';
        html = buildBudgetEmail({ isPt, name, budget, session_url });
    } else if (type === 'Mais Detalhes') {
        subject = isPt ? '✨ Preciso de mais detalhes — Stephany Ribeiro' : '✨ A few more details needed — Stephany Ribeiro';
        html = buildDetailsEmail({ isPt, name, message });
    } else if (type === 'Recusado') {
        subject = isPt ? '✨ O teu pedido — Stephany Ribeiro' : '✨ Your request — Stephany Ribeiro';
        html = buildRejectionEmail({ isPt, name, reason });
    } else if (type === 'deposito') {
        subject = isPt ? '✨ Depósito recebido — Sessão confirmada' : '✨ Deposit received — Session confirmed';
        html = buildDepositEmail({ isPt, name });
    } else {
        return res.status(400).json({ error: 'Invalid type' });
    }

    try {
        await resend.emails.send({
            from: 'Stephany Ribeiro - LUMI Atelier <art@stephanytattoo.com>',
            to: email,
            subject,
            html,
        });
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Resend error:', err);
        return res.status(500).json({ error: 'Failed to send email' });
    }
}

function buildEmail(isPt, name, bodyHtml) {
    return `<!DOCTYPE html>
<html lang="${isPt ? 'pt' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#ECD9D0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ECD9D0;padding:48px 24px;">
  <tr>
    <td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;background:#FDFAF7;">

        <tr>
          <td style="background:#2C1A0E;padding:40px 48px;text-align:center;">
            <p style="margin:0;font-size:14px;font-weight:400;letter-spacing:0.28em;text-transform:uppercase;color:#ECD9D0;">Stephany Ribeiro</p>
            <p style="margin:10px 0 0;font-size:8px;letter-spacing:0.22em;text-transform:uppercase;color:#B09080;">${isPt ? 'Arte que vive na tua pele' : 'Art that lives on your skin'}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:52px 48px 8px;">
            <p style="margin:0 0 6px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#B09080;">${isPt ? 'Olá' : 'Hello'}</p>
            <p style="margin:0 0 28px;font-size:30px;font-weight:300;color:#2C1A0E;line-height:1.2;">${name}</p>
            <div style="width:32px;height:1px;background:#D0B8AC;margin:0 0 32px;"></div>
            ${bodyHtml}
          </td>
        </tr>

        <tr>
          <td style="padding:0 48px;"><div style="height:1px;background:#ECD9D0;"></div></td>
        </tr>

        <tr>
          <td style="padding:32px 48px 40px;">
            <p style="margin:0 0 2px;font-size:13px;color:#2C1A0E;font-weight:400;">Stephany Ribeiro</p>
            <p style="margin:0 0 12px;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#B09080;">LUMI Atelier · Venda do Pinheiro, Portugal</p>
            <a href="mailto:art@stephanytattoo.com" style="font-size:11px;color:#A77049;text-decoration:none;letter-spacing:0.05em;">art@stephanytattoo.com</a>
          </td>
        </tr>

        <tr>
          <td style="padding:0 48px 32px;">
            <p style="margin:0;font-size:10px;color:#B09080;line-height:1.6;">
              ${isPt ? 'Recebeste este email porque preencheste o formulário de marcação em stephanytattoo.com.' : 'You received this email because you submitted the booking form at stephanytattoo.com.'}
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function buildBudgetEmail({ isPt, name, budget, session_url }) {
    const para1 = isPt
        ? 'Analisei a tua ideia com toda a atenção e fico feliz em poder avançar com este projeto.'
        : "I've carefully reviewed your idea and I'm glad to move forward with this piece.";

    const para2 = isPt
        ? 'Para confirmar a tua sessão, peço um depósito de <strong>20€</strong> via MB Way para o número <strong>932 558 951</strong>. O depósito é não reembolsável e a sessão só fica confirmada após a sua receção.'
        : 'To confirm your session, a non-refundable deposit of <strong>20€</strong> is required via MB Way to <strong>932 558 951</strong>. Your session is only confirmed once the deposit is received.';

    const sessionBlock = session_url
        ? `<table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:48px;">
            <tr>
              <td style="border:1px solid #A77049;">
                <a href="${session_url}" style="display:inline-block;padding:14px 36px;font-size:10px;font-weight:400;letter-spacing:0.22em;text-transform:uppercase;color:#A77049;text-decoration:none;">
                  ${isPt ? 'Marcar Sessão' : 'Book Session'}
                </a>
              </td>
            </tr>
          </table>`
        : '<div style="margin-bottom:48px;"></div>';

    return buildEmail(isPt, name, `
        <p style="margin:0 0 24px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
          <tr>
            <td style="border-left:2px solid #A77049;padding:12px 20px;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#B09080;">${isPt ? 'Orçamento' : 'Quote'}</p>
              <p style="margin:0;font-size:28px;font-weight:300;color:#2C1A0E;">${budget}€</p>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 40px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${para2}</p>
        ${sessionBlock}
    `);
}

function buildDetailsEmail({ isPt, name, message }) {
    const para1 = isPt
        ? 'Obrigada pelo teu pedido. Analisei a tua ideia, mas precisaria de alguns detalhes adicionais antes de poder avançar.'
        : "Thank you for your request. I've reviewed your idea carefully, but I'd need a few more details before moving forward.";

    const para3 = isPt
        ? 'Responde a este email com as informações pedidas e volto a entrar em contacto em breve.'
        : "Reply to this email with the requested information and I'll be back in touch soon.";

    return buildEmail(isPt, name, `
        <p style="margin:0 0 20px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <p style="margin:0 0 32px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${message}</p>
        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${para3}</p>
    `);
}

function buildRejectionEmail({ isPt, name, reason }) {
    const intro = isPt
        ? 'Obrigada por teres pensado em mim para esta peça. Analisei o teu pedido com atenção.'
        : "Thank you for considering me for this piece. I've looked carefully at your request.";

    const closing = isPt
        ? 'Desejo-te boa sorte na tua procura pelo artista certo.'
        : 'I wish you all the best in finding the right artist for this piece.';

    let reasonText;
    if (reason === 'Fora do meu estilo') {
        reasonText = isPt
            ? 'Infelizmente, este projeto não se enquadra no meu estilo artístico atual. Para te garantir o melhor resultado possível, prefiro não avançar com este pedido.'
            : "Unfortunately, this project isn't a fit for my current artistic style. To ensure you get the best possible result, I prefer not to move forward.";
    } else if (reason === 'Não consigo fazer cover') {
        reasonText = isPt
            ? 'Após analisar a tatuagem existente, não me é possível garantir um resultado satisfatório numa cover neste caso específico. Prefiro ser honesta contigo do que arriscar um resultado que não te faria justiça.'
            : "After reviewing the existing tattoo, I'm not confident I can guarantee a satisfying result for a cover-up in this particular case. I prefer honesty over a result that wouldn't do you justice.";
    } else {
        reasonText = isPt
            ? 'Neste momento a minha agenda não tem disponibilidade para novas marcações com a urgência que procuras. Podes ficar atento às minhas redes sociais para futuras aberturas de agenda.'
            : "At this time, my schedule doesn't have availability for new bookings with the urgency you're looking for. Keep an eye on my social media for future schedule openings.";
    }

    return buildEmail(isPt, name, `
        <p style="margin:0 0 20px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${intro}</p>
        <p style="margin:0 0 20px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${reasonText}</p>
        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${closing}</p>
    `);
}

function buildDepositEmail({ isPt, name }) {
    const para1 = isPt
        ? 'Recebi o teu depósito de 20€. A tua sessão está confirmada.'
        : "I've received your 20€ deposit. Your session is now confirmed.";

    const para2 = isPt
        ? 'Fico muito feliz por trabalhar contigo em breve. Qualquer dúvida, estou à tua disposição.'
        : "I'm truly looking forward to working with you. Feel free to reach out if you have any questions.";

    const para3 = isPt
        ? 'Espero por ti no <a href="https://maps.app.goo.gl/zNsyDdv1vJyKyro19" style="color:#A77049;text-decoration:underline;">LUMI Atelier</a>!'
        : 'I\'ll be waiting for you at <a href="https://maps.app.goo.gl/zNsyDdv1vJyKyro19" style="color:#A77049;text-decoration:underline;">LUMI Atelier</a>!';

    return buildEmail(isPt, name, `
        <p style="margin:0 0 20px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <p style="margin:0 0 20px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${para2}</p>
        <p style="margin:0 0 48px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para3}</p>
    `);
}
