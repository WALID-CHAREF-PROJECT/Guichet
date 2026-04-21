import { Link } from 'react-router-dom';
import QuantityStepper from '../components/commerce/QuantityStepper';
import { useCart } from '../contexts/CartContext';
import { formatMad } from '../services/commerce/utils';

export default function CartPage(): JSX.Element {
  const { items, totals, increaseQuantity, decreaseQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#06173c] p-8">
        <h1 className="text-3xl font-bold">Panier</h1>
        <p className="mt-3 text-slate-300">Votre panier est vide pour le moment.</p>
        <Link to="/ma-fr/billeterie" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-[#031438]">Découvrir des événements</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-3xl font-bold">Panier</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#06173c] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.title} className="h-20 w-20 rounded-xl object-cover" />
                <div>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="text-sm text-slate-300">{item.location}</p>
                  <p className="text-xs text-slate-400">{item.date}</p>
                  {item.ticketType && <p className="text-xs text-orange-300">Offre: {item.ticketType}</p>}
                  {item.selectedSeats?.length ? <p className="text-xs text-orange-300">Places: {item.selectedSeats.join(', ')}</p> : null}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <QuantityStepper value={item.quantity} min={1} onDecrease={() => decreaseQuantity(item.id)} onIncrease={() => increaseQuantity(item.id)} />
                <strong>{formatMad(item.subtotal)}</strong>
                <button onClick={() => removeItem(item.id)} className="text-sm text-red-300">Supprimer</button>
              </div>
            </article>
          ))}
        </div>
        <aside className="h-fit rounded-2xl border border-white/10 bg-[#06173c] p-5">
          <h3 className="text-lg font-semibold">Récapitulatif</h3>
          <div className="mt-4 space-y-2 text-sm text-slate-300">
            <p className="flex justify-between"><span>Articles</span><span>{totals.totalQuantity}</span></p>
            <p className="flex justify-between"><span>Sous-total</span><span>{formatMad(totals.subtotal)}</span></p>
            <p className="flex justify-between"><span>À payer maintenant</span><span>{formatMad(totals.totalNow)}</span></p>
            {totals.remainingLater > 0 && <p className="flex justify-between"><span>Reste à payer</span><span>{formatMad(totals.remainingLater)}</span></p>}
          </div>
          <Link to="/ma-fr/checkout" className="mt-5 inline-flex w-full justify-center rounded-full bg-white px-5 py-3 font-bold text-[#031438]">Continuer vers checkout</Link>
        </aside>
      </div>
    </section>
  );
}
