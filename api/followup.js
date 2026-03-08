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

function formatEta(raw, isPt) {
    if (!raw) return '';
    const str = String(raw);
    // If it looks like an ISO date, format it nicely
    if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
        const d = new Date(str);
        return d.toLocaleDateString(isPt ? 'pt-PT' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return str;
}

function directContact(isPt) {
    return isPt
        ? 'Se precisares de alguma coisa, podes sempre responder a este email ou enviar-me mensagem diretamente no <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a>. Estou aqui para ti!'
        : 'If you need anything, you can always reply to this email or message me directly on <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a>. I\'m here for you!';
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
    const title = isPt ? 'Preparei algumas recomendações para ti:' : "Here are a few tips to prepare:";
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

/* ── Step 4a: Budget quote ── */

function buildBudgetEmail({ isPt, name, budget }) {
    const para1 = isPt
        ? 'Adorei a tua ideia! Dediquei toda a atenção a analisá-la e preparei o teu orçamento com muito carinho.'
        : "I loved your idea! I've given it my full attention and prepared your quote with care.";

    const para2 = isPt
        ? 'Se quiseres avançar, basta responder a este email ou enviar-me mensagem no <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a>. Vou adorar criar esta peça para ti!'
        : 'If you\'d like to go ahead, just reply to this email or message me on <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a>. I would love to create this piece for you!';

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
        ? 'Muito obrigada pelo teu pedido! Já estive a analisar a tua ideia e estou entusiasmada, mas precisaria de mais alguns detalhes para conseguir criar algo realmente especial para ti.'
        : "Thank you so much for your request! I've been looking at your idea and I'm excited, but I'd need a few more details to create something truly special for you.";

    const bullet1 = isPt
        ? 'Uma descrição mais detalhada da ideia e do estilo de tatuagem que imaginas'
        : 'A more detailed description of the idea and the tattoo style you have in mind';

    const bullet2 = isPt
        ? 'Mais imagens de inspiração (fotos de tatuagens, ilustrações, referências visuais)'
        : 'More inspiration images (tattoo photos, illustrations, visual references)';

    const para3 = isPt
        ? 'Responde diretamente a este email ou, se preferires, envia-me mensagem no <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a> — o que for mais fácil para ti. Mal posso esperar para ver mais!'
        : 'Just reply to this email or, if you prefer, send me a message on <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a> — whatever is easier for you. Can\'t wait to see more!';

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
        ? 'Antes de mais, muito obrigada por teres pensado em mim para esta peça. Significa muito que tenhas confiado no meu trabalho.'
        : "First of all, thank you so much for thinking of me for this piece. It truly means a lot that you trusted my work.";

    const closing = isPt
        ? 'Desejo-te toda a sorte do mundo na procura pelo artista certo. Se no futuro tiveres outra ideia que se enquadre no meu estilo, a minha porta está sempre aberta!'
        : 'I wish you all the best in finding the right artist. If in the future you have another idea that fits my style, my door is always open!';

    let reasonText;
    if (reason === 'Fora do meu estilo') {
        reasonText = isPt
            ? 'Após analisar tudo com carinho, sinto que este projeto não se enquadra no meu estilo artístico atual. Quero ser honesta contigo porque mereces o melhor resultado possível, e sei que outro artista poderá dar vida a esta ideia de uma forma incrível.'
            : "After careful consideration, I feel this project isn't the best fit for my current artistic style. I want to be honest with you because you deserve the best possible result, and I know another artist could bring this idea to life beautifully.";
    } else if (reason === 'Não consigo fazer cover') {
        reasonText = isPt
            ? 'Após analisar a tatuagem existente com toda a atenção, não me sinto confortável em garantir um resultado que esteja à altura do que mereces. Prefiro ser transparente contigo do que arriscar algo que não te deixe 100% feliz.'
            : "After carefully examining the existing tattoo, I don't feel confident I can deliver a result that lives up to what you deserve. I'd rather be transparent with you than risk something that wouldn't make you 100% happy.";
    } else {
        reasonText = isPt
            ? 'Neste momento a minha agenda está bastante preenchida e infelizmente não tenho disponibilidade. Mas podes sempre acompanhar-me no <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a> para saberes quando abrir novas vagas — adorava poder trabalhar contigo no futuro!'
            : "My schedule is quite full right now and unfortunately I don't have availability. But you can always follow me on <a href=\"https://www.instagram.com/stephany.tattoo/\" style=\"color:#A77049;text-decoration:underline;\">Instagram</a> to know when I open new spots — I'd love to work with you in the future!";
    }

    return buildEmail(isPt, name, `
        <p style="margin:0 0 20px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${intro}</p>
        <p style="margin:0 0 20px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${reasonText}</p>
        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${closing}</p>
    `);
}

/* ── Step 5: Budget accepted → deposit request + sketch ETA ── */

function buildDepositRequestEmail({ isPt, name, budget, eta }) {
    const formattedEta = formatEta(eta, isPt);

    const para1 = isPt
        ? 'Estou tão feliz que queiras avançar! Vai ser um prazer enorme criar esta peça para ti.'
        : "I'm so happy you want to go ahead! It's going to be an absolute pleasure creating this piece for you.";

    const etaText = isPt
        ? `Vou começar a trabalhar no teu esboço e terá-lo pronto até <strong>${formattedEta}</strong>. Mal posso esperar para te mostrar!`
        : `I'll start working on your sketch and have it ready by <strong>${formattedEta}</strong>. Can't wait to show you!`;

    const para2 = isPt
        ? 'Para dar início ao trabalho da tua tatuagem, peço um depósito de <strong>20€</strong> via MB Way para o número <strong>932 558 951</strong>. O depósito é não reembolsável e a sessão só fica confirmada após a sua receção.'
        : 'To get started on your tattoo, a non-refundable deposit of <strong>20€</strong> is required via MB Way to <strong>932 558 951</strong>. Your session is only confirmed once the deposit is received.';

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
        <p style="margin:0 0 20px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${para2}</p>
        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${directContact(isPt)}</p>
    `);
}

/* ── Step 6: Sketch ready + Calendly booking ── */

function buildSketchEmail({ isPt, name, sketch_url, duration, session_url }) {
    const para1 = isPt
        ? 'O teu esboço está pronto e estou muito orgulhosa do resultado! Espero que gostes tanto quanto eu — criei-o a pensar em ti.'
        : "Your sketch is ready and I'm so proud of how it turned out! I hope you love it as much as I do — I created it with you in mind.";

    const durationText = isPt
        ? `A sessão tem duração estimada de <strong>${duration}</strong>. Escolhe o dia que te der mais jeito no link abaixo:`
        : `The session has an estimated duration of <strong>${duration}</strong>. Pick the day that works best for you:`;

    const para3 = isPt
        ? 'Se tiveres alguma dúvida sobre o esboço ou quiseres ajustar algum detalhe, não hesites em falar comigo — responde a este email ou envia mensagem no <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a>.'
        : 'If you have any questions about the sketch or want to adjust any detail, don\'t hesitate to reach out — reply to this email or message me on <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a>.';

    return buildEmail(isPt, name, `
        <p style="margin:0 0 24px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <img src="${sketch_url}" alt="Sketch" style="width:100%;max-width:464px;border-radius:4px;margin:0 0 28px;display:block;" />
        <p style="margin:0 0 24px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${durationText}</p>
        ${btn(session_url, isPt ? 'Marcar Sessão' : 'Book Session')}
        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${para3}</p>
    `);
}

/* ── Step 7: Session confirmed + pre-session tips ── */

function buildSessionEmail({ isPt, name, session_date, duration }) {
    const para1 = isPt
        ? 'A tua sessão está oficialmente confirmada! Estou muito entusiasmada para te conhecer e dar vida a esta peça.'
        : "Your session is officially confirmed! I'm so excited to meet you and bring this piece to life.";

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
        <p style="margin:0 0 20px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${lumiLink(isPt)}</p>
        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${directContact(isPt)}</p>
    `);
}

/* ── Step 8: Day-before reminder ── */

function buildReminderEmail({ isPt, name, session_date, duration }) {
    const para1 = isPt
        ? 'O grande dia está quase a chegar! Só te queria lembrar que a tua sessão é <strong>amanhã</strong>.'
        : "The big day is almost here! Just a friendly reminder that your session is <strong>tomorrow</strong>.";

    const para2 = isPt
        ? 'Estou ansiosa por te receber e criar algo lindo juntas!'
        : "I can't wait to welcome you and create something beautiful together!";

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
        <p style="margin:0 0 20px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${lumiLink(isPt)}</p>
        <p style="margin:0 0 48px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${para2}</p>
    `);
}

/* ── Step 9: Aftercare + Google review ── */

function buildAftercareEmail({ isPt, name }) {
    const para1 = isPt
        ? 'Espero que tenhas adorado a experiência tanto quanto eu! Foi um prazer enorme trabalhar contigo e ver esta peça ganhar vida na tua pele.'
        : "I hope you loved the experience as much as I did! It was an absolute pleasure working with you and seeing this piece come to life on your skin.";

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

    const careTitle = isPt ? 'Para que a tua tatuagem cicatrize na perfeição, segue estes cuidados:' : 'To make sure your tattoo heals beautifully, follow these steps:';

    const para2 = isPt
        ? 'Se tiveres qualquer dúvida durante a cicatrização, não hesites — envia-me mensagem no <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a> ou responde a este email. Estou sempre aqui para te ajudar!'
        : 'If you have any concerns during healing, don\'t hesitate — message me on <a href="https://www.instagram.com/stephany.tattoo/" style="color:#A77049;text-decoration:underline;">Instagram</a> or reply to this email. I\'m always here to help!';

    const reviewText = isPt
        ? 'Se gostaste da experiência, ficava muito feliz se pudesses deixar uma palavrinha — significa imenso para mim e para o crescimento do atelier:'
        : 'If you enjoyed the experience, it would make my day if you could leave a few words — it means the world to me and helps the studio grow:';

    return buildEmail(isPt, name, `
        <p style="margin:0 0 24px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:300;">${para1}</p>
        <p style="margin:0 0 8px;font-size:14px;color:#2C1A0E;line-height:1.8;font-weight:400;">${careTitle}</p>
        <ul style="margin:0 0 32px;padding-left:20px;font-size:14px;color:#7A5C48;line-height:2.2;font-weight:300;">
          ${tips.map(t => `<li>${t}</li>`).join('\n          ')}
        </ul>
        <p style="margin:0 0 24px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${para2}</p>
        <p style="margin:0 0 20px;font-size:14px;color:#7A5C48;line-height:1.8;font-weight:300;">${reviewText}</p>
        ${btn('https://share.google/XwF5Gg3xCGjqV1AZ2', isPt ? 'Deixar Avaliação' : 'Leave a Review')}
    `);
}
