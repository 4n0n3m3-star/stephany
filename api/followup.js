import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { type, name, email, lang, budget, reason, eta, sketch_url, duration, session_url, session_date } = req.body;

    if (!email || !name || !type) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const isPt = lang !== 'en';
    let subject, html;

    if (type === 'Orçamento') {
        subject = isPt ? '✨ O teu orçamento — Stephany Ribeiro' : '✨ Your quote — Stephany Ribeiro';
        html = buildBudgetEmail({ isPt, name, budget });
    } else if (type === 'Mais Detalhes') {
        subject = isPt ? '✨ Preciso de mais detalhes — Stephany Ribeiro' : '✨ A few more details needed — Stephany Ribeiro';
        html = buildDetailsEmail({ isPt, name });
    } else if (type === 'Recusado') {
        subject = isPt ? '✨ O teu pedido — Stephany Ribeiro' : '✨ Your request — Stephany Ribeiro';
        html = buildRejectionEmail({ isPt, name, reason });
    } else if (type === 'deposito') {
        subject = isPt ? '✨ Próximos passos — Stephany Ribeiro' : '✨ Next steps — Stephany Ribeiro';
        html = buildDepositRequestEmail({ isPt, name, budget, eta });
    } else if (type === 'esboço') {
        subject = isPt ? '✨ O teu esboço está pronto!' : '✨ Your sketch is ready!';
        html = buildSketchEmail({ isPt, name, sketch_url, duration, session_url });
    } else if (type === 'sessao') {
        subject = isPt ? '✨ Sessão confirmada — Stephany Ribeiro' : '✨ Session confirmed — Stephany Ribeiro';
        html = buildSessionEmail({ isPt, name, session_date, duration });
    } else if (type === 'lembrete') {
        subject = isPt ? '✨ Lembrete: a tua sessão é amanhã!' : '✨ Reminder: your session is tomorrow!';
        html = buildReminderEmail({ isPt, name, session_date, duration });
    } else if (type === 'aftercare') {
        subject = isPt ? '✨ Cuidados pós-tatuagem — Stephany Ribeiro' : '✨ Aftercare guide — Stephany Ribeiro';
        html = buildAftercareEmail({ isPt, name });
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

/* ── shared email wrapper ── */

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

/* ── shared components ── */

function btn(href, label) {
    return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:48px;">
            <tr>
              <td style="border:1px solid #A77049;">
                <a href="${href}" style="display:inline-block;padding:14px 36px;font-size:10px;font-weight:400;letter-spacing:0.22em;text-transform:uppercase;color:#A77049;text-decoration:none;">
                  ${label}
                </a>
              </td>
            </tr>
          </table>`;
}

function preSessionTips(isPt) {
    const tips = isPt ? [
        'Dormir bem na noite anterior',
        'Comer uma refeição completa antes da sessão',
        'Manter a pele hidratada nos dias anteriores',
        'Não consumir álcool nas 24h anteriores',
        'Usar roupa confortável com fácil acesso à zona a tatuar',
        'Trazer um lanche e água (especialmente para sessões longas)',
    ] : [
        'Get a good night\'s sleep the night before',
        'Eat a full meal before your session',
        'Keep the skin moisturized in the days before',
        'Avoid alcohol 24h before',
        'Wear comfortable clothing with easy access to the tattoo area',
        'Bring a snack and water (especially for longer sessions)',
    ];
    const title = isPt ? 'Recomendações pré-sessão:' : 'Pre-session tips:';
    return `
        <p style="margin:0 0 8px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:400;">${title}</p>
        <ul style="margin:0 0 32px;padding-left:20px;font-size:14px;color:#7A5C48;line-height:2.2;font-weight:300;">
          ${tips.map(t => `<li>${t}</li>`).join('\n          ')}
        </ul>`;
}

function lumiLink(isPt) {
    return isPt
        ? 'Espero por ti no <a href="https://maps.app.goo.gl/zNsyDdv1vJyKyro19" style="color:#A77049;text-decoration:underline;">LUMI Atelier</a>! ✨'
        : 'I\'ll be waiting for you at <a href="https://maps.app.goo.gl/zNsyDdv1vJyKyro19" style="color:#A77049;text-decoration:underline;">LUMI Atelier</a>! ✨';
}

/* ── Step 4a: Budget quote (no deposit info) ── */

function buildBudgetEmail({ isPt, name, budget }) {
    const para1 = isPt
        ? 'Analisei a tua ideia com toda a atenção e preparei o teu orçamento.'
        : "I've carefully reviewed your idea and prepared your quote.";

    const para2 = isPt
        ? 'Caso queiras avançar, responde a este email ou envia-me mensagem no <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a>.'
        : 'If you\'d like to proceed, reply to this email or send me a message on <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a>.';

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
        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${para2}</p>
    `);
}

/* ── Step 4b: Request more details ── */

function buildDetailsEmail({ isPt, name }) {
    const para1 = isPt
        ? 'Obrigada pelo teu pedido. Analisei a tua ideia, mas precisaria de alguns detalhes adicionais antes de poder avançar.'
        : "Thank you for your request. I've reviewed your idea carefully, but I'd need a few more details before moving forward.";

    const bullet1 = isPt
        ? 'Uma descrição mais detalhada da ideia e do estilo de tatuagem que imaginas.'
        : 'A more detailed description of the idea and the tattoo style you have in mind.';

    const bullet2 = isPt
        ? 'Mais imagens de inspiração (fotos de tatuagens, ilustrações, referências visuais).'
        : 'More inspiration images (tattoo photos, illustrations, visual references).';

    const para3 = isPt
        ? 'Responde a este email com as informações pedidas e volto a entrar em contacto em breve.'
        : "Reply to this email with the requested information and I'll be back in touch soon.";

    return buildEmail(isPt, name, `
        <p style="margin:0 0 20px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${isPt ? 'Precisaria que me enviasses:' : "I'd need you to send me:"}</p>
        <ul style="margin:0 0 32px;padding-left:20px;font-size:14px;color:#7A5C48;line-height:2;font-weight:300;">
          <li>${bullet1}</li>
          <li>${bullet2}</li>
        </ul>
        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${para3}</p>
    `);
}

/* ── Step 4c: Rejection ── */

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

/* ── Step 5: Budget accepted → deposit request + sketch ETA ── */

function buildDepositRequestEmail({ isPt, name, budget, eta }) {
    const para1 = isPt
        ? 'Fico muito feliz que queiras avançar com esta peça!'
        : "I'm so happy you'd like to move forward with this piece!";

    const etaText = isPt
        ? `O esboço final ficará pronto até <strong>${eta}</strong>.`
        : `The final sketch will be ready by <strong>${eta}</strong>.`;

    const para2 = isPt
        ? `Para dar início ao trabalho da tua tatuagem, peço um depósito de <strong>20€</strong> via MB Way para o número <strong>932 558 951</strong>. O depósito é não reembolsável e a sessão só fica confirmada após a sua receção.`
        : `To get started on your tattoo, a non-refundable deposit of <strong>20€</strong> is required via MB Way to <strong>932 558 951</strong>. Your session is only confirmed once the deposit is received.`;

    return buildEmail(isPt, name, `
        <p style="margin:0 0 20px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 28px;">
          <tr>
            <td style="border-left:2px solid #A77049;padding:12px 20px;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#B09080;">${isPt ? 'Orçamento' : 'Quote'}</p>
              <p style="margin:0;font-size:28px;font-weight:300;color:#2C1A0E;">${budget}€</p>
            </td>
          </tr>
        </table>
        <p style="margin:0 0 20px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${etaText}</p>
        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${para2}</p>
    `);
}

/* ── Step 6: Sketch ready + Calendly booking ── */

function buildSketchEmail({ isPt, name, sketch_url, duration, session_url }) {
    const para1 = isPt
        ? 'O teu esboço está pronto! Espero que gostes tanto quanto eu.'
        : "Your sketch is ready! I hope you love it as much as I do.";

    const durationText = isPt
        ? `A sessão tem duração estimada de <strong>${duration}</strong>. Marca o dia que te der mais jeito:`
        : `The session has an estimated duration of <strong>${duration}</strong>. Pick the day that works best for you:`;

    return buildEmail(isPt, name, `
        <p style="margin:0 0 24px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <img src="${sketch_url}" alt="Sketch" style="width:100%;max-width:464px;border-radius:4px;margin:0 0 28px;display:block;" />
        <p style="margin:0 0 24px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${durationText}</p>
        ${btn(session_url, isPt ? 'Marcar Sessão' : 'Book Session')}
    `);
}

/* ── Step 7: Session confirmed + pre-session tips ── */

function buildSessionEmail({ isPt, name, session_date, duration }) {
    const para1 = isPt
        ? 'A tua sessão está confirmada! Aqui ficam os detalhes:'
        : "Your session is confirmed! Here are the details:";

    return buildEmail(isPt, name, `
        <p style="margin:0 0 24px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;">
          <tr>
            <td style="border-left:2px solid #A77049;padding:12px 20px;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#B09080;">${isPt ? 'Data' : 'Date'}</p>
              <p style="margin:0 0 12px;font-size:20px;font-weight:300;color:#2C1A0E;">${session_date}</p>
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#B09080;">${isPt ? 'Duração estimada' : 'Estimated duration'}</p>
              <p style="margin:0;font-size:20px;font-weight:300;color:#2C1A0E;">${duration}</p>
            </td>
          </tr>
        </table>
        ${preSessionTips(isPt)}
        <p style="margin:0 0 48px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${lumiLink(isPt)}</p>
    `);
}

/* ── Step 8: Day-before reminder ── */

function buildReminderEmail({ isPt, name, session_date, duration }) {
    const para1 = isPt
        ? 'Só para lembrar: a tua sessão é <strong>amanhã</strong>!'
        : "Just a friendly reminder: your session is <strong>tomorrow</strong>!";

    return buildEmail(isPt, name, `
        <p style="margin:0 0 24px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <table cellpadding="0" cellspacing="0" role="presentation" style="margin:0 0 32px;">
          <tr>
            <td style="border-left:2px solid #A77049;padding:12px 20px;">
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#B09080;">${isPt ? 'Data' : 'Date'}</p>
              <p style="margin:0 0 12px;font-size:20px;font-weight:300;color:#2C1A0E;">${session_date}</p>
              <p style="margin:0 0 4px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#B09080;">${isPt ? 'Duração estimada' : 'Estimated duration'}</p>
              <p style="margin:0;font-size:20px;font-weight:300;color:#2C1A0E;">${duration}</p>
            </td>
          </tr>
        </table>
        ${preSessionTips(isPt)}
        <p style="margin:0 0 48px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${lumiLink(isPt)}</p>
    `);
}

/* ── Step 9: Aftercare + Google review ── */

function buildAftercareEmail({ isPt, name }) {
    const para1 = isPt
        ? 'Espero que tenhas adorado a experiência! Foi um prazer trabalhar contigo.'
        : "I hope you loved the experience! It was a pleasure working with you.";

    const tips = isPt ? [
        'Manter a película protetora durante 2–4 horas',
        'Lavar suavemente com água morna e sabão neutro (sem esfregar)',
        'Aplicar uma camada fina de creme cicatrizante (Bepanthene ou similar) 2–3× por dia',
        'Não coçar nem arrancar crostas — é normal a pele descamar',
        'Evitar exposição solar direta durante 2–3 semanas',
        'Evitar piscinas, mar e banhos prolongados durante 2 semanas',
        'Não usar roupa apertada sobre a zona nos primeiros dias',
    ] : [
        'Keep the protective film on for 2–4 hours',
        'Gently wash with lukewarm water and mild soap (don\'t scrub)',
        'Apply a thin layer of healing cream (Bepanthen or similar) 2–3× daily',
        'Don\'t scratch or pick at scabs — peeling is normal',
        'Avoid direct sun exposure for 2–3 weeks',
        'Avoid pools, sea water, and long baths for 2 weeks',
        'Don\'t wear tight clothing over the area for the first few days',
    ];

    const careTitle = isPt ? 'Cuidados pós-tatuagem:' : 'Aftercare guide:';

    const reviewText = isPt
        ? 'Se gostaste da experiência, significa muito para mim se puderes deixar uma avaliação:'
        : 'If you enjoyed the experience, it would mean the world to me if you could leave a review:';

    return buildEmail(isPt, name, `
        <p style="margin:0 0 24px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:400;">${careTitle}</p>
        <ul style="margin:0 0 32px;padding-left:20px;font-size:14px;color:#7A5C48;line-height:2.2;font-weight:300;">
          ${tips.map(t => `<li>${t}</li>`).join('\n          ')}
        </ul>
        <p style="margin:0 0 20px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${reviewText}</p>
        ${btn('https://share.google/XwF5Gg3xCGjqV1AZ2', isPt ? 'Deixar Avaliação' : 'Leave a Review')}
    `);
}
