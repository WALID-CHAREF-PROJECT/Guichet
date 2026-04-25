import { Link } from 'react-router-dom';
import { getLastOrder } from '../../services/commerce/orderService';
import { formatMad } from '../../services/commerce/utils';

function receiptHtml(payload: {
  reference: string;
  qrValue: string;
  ticketNumber: string;
  title: string;
  category: string;
  description: string;
  price: string;
  placement: string;
  eventDate: string;
  purchaseDate: string;
  location: string;
  poster: string;
}): string {
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(payload.qrValue)}`;
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Reçu ${payload.reference}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;background:#0a1736;color:#10213e;padding:24px}
    .receipt{max-width:920px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden}
    .head{display:flex;justify-content:space-between;align-items:center;padding:22px 28px;border-bottom:1px solid #e5e7eb}
    .logo{font-weight:800;font-size:28px;color:#0b4dd8}
    .cmd{font-size:13px;text-transform:uppercase;letter-spacing:.08em;color:#64748b}
    .body{padding:24px 28px}
    .hero{display:grid;grid-template-columns:1fr 280px;gap:20px}
    .poster{width:100%;height:370px;object-fit:cover;border-radius:14px}
    .qr{width:240px;height:240px;display:block;margin:0 auto}
    .qrRef{text-align:center;color:#475569;font-size:12px}
    .meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:18px}
    .box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px}
    .label{font-size:11px;color:#64748b;text-transform:uppercase}
    .value{font-size:14px;color:#0f172a;font-weight:700}
    .footer{padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;color:#475569;font-size:12px}
  </style>
</head>
<body>
  <section class="receipt">
    <header class="head"><div class="logo">GUICHET</div><div><div class="cmd">Commande N°</div><div><strong>${payload.reference}</strong></div></div></header>
    <div class="body">
      <div class="hero">
        <img class="poster" src="${payload.poster}" alt="Poster" />
        <div><img class="qr" src="${qr}" alt="QR"/><p class="qrRef">Réf QR: ${payload.qrValue}</p></div>
      </div>
      <h2>${payload.title}</h2>
      <div class="meta">
        <div class="box"><div class="label">Numéro ticket</div><div class="value">${payload.ticketNumber}</div></div>
        <div class="box"><div class="label">Catégorie</div><div class="value">${payload.category}</div></div>
        <div class="box"><div class="label">Description</div><div class="value">${payload.description}</div></div>
        <div class="box"><div class="label">Prix</div><div class="value">${payload.price}</div></div>
        <div class="box"><div class="label">Place / placement</div><div class="value">${payload.placement}</div></div>
        <div class="box"><div class="label">Date événement</div><div class="value">${payload.eventDate}</div></div>
        <div class="box"><div class="label">Date achat</div><div class="value">${payload.purchaseDate}</div></div>
        <div class="box"><div class="label">Lieu</div><div class="value">${payload.location}</div></div>
      </div>
    </div>
    <footer class="footer">Guichet • Billetterie officielle • Merci pour votre confiance</footer>
  </section>
</body>
</html>`;
}

export default function OrderConfirmationPage(): JSX.Element {
  const order = getLastOrder();

  if (!order) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#06173c] p-8 text-center">
        <h1 className="text-3xl font-bold">Aucune commande trouvée</h1>
        <Link to="/ma-fr/billeterie" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-[#031438]">Retour accueil</Link>
      </section>
    );
  }

  const item = order.items[0];
  const payload = {
    reference: order.reference,
    qrValue: `${order.reference}-${item?.slug ?? 'ticket'}`,
    ticketNumber: item?.id ?? order.id,
    title: item?.title ?? 'Événement',
    category: item?.ticketType ?? item?.productType ?? 'event_ticket',
    description: `Accès pour ${item?.quantity ?? 1} billet(s)`,
    price: formatMad(item?.subtotal ?? order.totalNow),
    placement: item?.selectedSeats?.join(', ') || 'Libre',
    eventDate: item?.date ?? '-',
    purchaseDate: new Date(order.createdAt).toLocaleString('fr-MA'),
    location: item?.location ?? '-',
    poster: item?.image ?? 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80'
  };
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=340x340&data=${encodeURIComponent(payload.qrValue)}`;

  const onPrint = (): void => {
    const popup = window.open('', '_blank', 'width=1024,height=900');
    if (!popup) return;
    popup.document.write(receiptHtml(payload));
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const onDownload = (): void => {
    const blob = new Blob([receiptHtml(payload)], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recu-${order.reference}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#06173c] p-8">
      <p className="text-sm text-emerald-300">Commande confirmée</p>
      <h1 className="mt-2 text-3xl font-bold">Merci, votre réservation est validée 🎉</h1>
      <p className="mt-2 text-slate-300">Référence: <strong>{order.reference}</strong></p>

      <div className="mt-6 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0a214f] p-3 text-sm">
            <span>{item.title} × {item.quantity}</span>
            <strong>{formatMad(item.subtotal)}</strong>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-[#0a214f] p-4 text-sm">
        <p className="flex justify-between"><span>Total payé maintenant</span><strong>{formatMad(order.totalNow)}</strong></p>
        {order.remainingLater > 0 && <p className="mt-2 flex justify-between"><span>Reste à payer</span><strong>{formatMad(order.remainingLater)}</strong></p>}
      </div>

      <article className="mt-8 overflow-hidden rounded-3xl border border-white/15 bg-white text-slate-900">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Commande</p>
            <p className="font-extrabold">{payload.reference}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-[#0b4dd8]">GUICHET</p>
            <p className="text-xs text-slate-500">Billetterie officielle</p>
          </div>
        </header>
        <div className="grid gap-5 p-6 md:grid-cols-[1fr_300px]">
          <img src={payload.poster} alt={payload.title} className="h-[360px] w-full rounded-2xl object-cover" />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <img src={qr} alt="QR Ticket" className="mx-auto h-56 w-56 rounded-xl border border-slate-200 bg-white p-2" />
            <p className="mt-3 text-center text-xs text-slate-600">Référence QR: {payload.qrValue}</p>
            <p className="mt-2 text-center text-sm font-semibold">Ticket N° {payload.ticketNumber}</p>
          </div>
        </div>
        <div className="grid gap-3 px-6 pb-6 text-sm md:grid-cols-2">
          <Info label="Événement" value={payload.title} />
          <Info label="Catégorie" value={payload.category} />
          <Info label="Description" value={payload.description} />
          <Info label="Prix" value={payload.price} />
          <Info label="Place / placement" value={payload.placement} />
          <Info label="Date de l'événement" value={payload.eventDate} />
          <Info label="Date d'achat" value={payload.purchaseDate} />
          <Info label="Lieu" value={payload.location} />
        </div>
        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs text-slate-600">Guichet • Présentez ce reçu à l’entrée • Merci pour votre confiance.</footer>
      </article>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/ma-fr/billeterie" className="rounded-full bg-white px-5 py-3 font-semibold text-[#031438]">Retour à l'accueil</Link>
        <Link to="/ma-fr/account/reservations" className="rounded-full border border-white/20 px-5 py-3 font-semibold">Voir mes réservations</Link>
        <button onClick={onDownload} className="rounded-full border border-white/20 px-5 py-3 font-semibold">Download receipt</button>
        <button onClick={onPrint} className="rounded-full border border-white/20 px-5 py-3 font-semibold">Print receipt</button>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}
