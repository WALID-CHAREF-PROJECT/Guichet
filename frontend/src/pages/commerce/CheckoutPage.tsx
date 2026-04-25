import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { formatMad } from '../../services/commerce/utils';
import { createPendingOrder } from '../../services/commerce/orderService';

export default function CheckoutPage(): JSX.Element {
  const { items, totals } = useCart();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [countryCode, setCountryCode] = useState('+212');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validEmail = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const validMobile = useMemo(() => /^\d{8,14}$/.test(mobile.replace(/\s+/g, '')), [mobile]);
  const canSubmit = validEmail && validMobile && terms && items.length > 0 && !loading;

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);

    try {
      await createPendingOrder(items, { email, mobile, countryCode });
      navigate('/ma-fr/payment');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#06173c] p-8 text-center">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-3 text-slate-300">Votre panier est vide.</p>
        <Link to="/ma-fr/panier" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-[#031438]">Retour panier</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-3xl font-bold">Checkout / Paiement</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-[#06173c] p-6">
          <h2 className="text-xl font-semibold">Résumé de réservation</h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 rounded-2xl border border-white/10 bg-[#0a214f] p-3">
                <img src={item.image} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-slate-300">{item.location}</p>
                  <p className="text-slate-400">{item.date}</p>
                  <p className="mt-1">x{item.quantity} · {formatMad(item.subtotal)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-[#0a214f] p-4 text-sm">
            <p className="flex justify-between"><span>Total billets</span><span>{totals.totalQuantity}</span></p>
            <p className="mt-2 flex justify-between"><span>Réduction</span><span>0 MAD</span></p>
            <p className="mt-2 flex justify-between"><span>Total avance</span><span>{formatMad(totals.totalNow)}</span></p>
            {totals.remainingLater > 0 && <p className="mt-2 flex justify-between"><span>Reste à payer</span><span>{formatMad(totals.remainingLater)}</span></p>}
            <p className="mt-4 rounded-xl bg-white px-4 py-3 text-center text-lg font-bold text-[#031438]">Total final: {formatMad(totals.totalNow)}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <input className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm" placeholder="Code promo" />
            <button className="rounded-xl border border-white/20 px-4 py-2 text-sm">Valider</button>
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-white/10 bg-[#06173c] p-6">
          <div className="rounded-2xl border border-white/20 bg-[#0a214f] p-4">
            <p className="font-semibold">Connectez-vous pour une réservation plus rapide</p>
            <button type="button" className="mt-3 rounded-full border border-white/30 px-4 py-2 text-sm">Se connecter</button>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Coordonnées</h3>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="mb-2 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
            <div className="flex gap-2">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 px-3 py-2">
                <option value="+212">🇲🇦 +212</option>
                <option value="+33">🇫🇷 +33</option>
              </select>
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Numéro mobile" className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold">Mode de paiement</h3>
            <label className="flex items-center justify-between rounded-xl border border-white/20 bg-white/5 p-3">
              <span>Carte bancaire</span>
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs text-orange-300">CMI</span>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> J'accepte les conditions générales
          </label>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <button disabled={!canSubmit} className="w-full rounded-full bg-white px-6 py-3 text-lg font-bold text-[#031438] disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Traitement en cours...' : 'Passer ma commande'}
          </button>
        </form>
      </div>
    </section>
  );
}
