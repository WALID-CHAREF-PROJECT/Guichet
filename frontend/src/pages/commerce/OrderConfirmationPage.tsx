import { Link } from 'react-router-dom';
import { getLastOrder } from '../../services/commerce/orderService';
import { formatMad } from '../../services/commerce/utils';

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

      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/ma-fr/billeterie" className="rounded-full bg-white px-5 py-3 font-semibold text-[#031438]">Retour à l'accueil</Link>
        <Link to="/ma-fr/panier" className="rounded-full border border-white/20 px-5 py-3 font-semibold">Voir mes réservations</Link>
      </div>
    </section>
  );
}
