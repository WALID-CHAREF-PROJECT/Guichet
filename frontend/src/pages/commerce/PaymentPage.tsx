import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { clearPendingOrder, finalizePendingOrder, getPendingOrder } from '../../services/commerce/orderService';
import { formatMad } from '../../services/commerce/utils';

export default function PaymentPage(): JSX.Element {
  const pending = getPendingOrder();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [method, setMethod] = useState('Visa');
  const [holder, setHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => holder.trim().length >= 3 && cardNumber.replace(/\s+/g, '').length >= 16 && expiry.length >= 4 && cvv.length >= 3 && terms, [holder, cardNumber, expiry, cvv, terms]);

  if (!pending) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#06173c] p-8 text-center">
        <h1 className="text-3xl font-bold">Aucun paiement en attente</h1>
        <Link to="/ma-fr/panier" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 font-semibold text-[#031438]">Retour panier</Link>
      </section>
    );
  }

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await finalizePendingOrder('card');
      clearCart();
      navigate('/ma-fr/confirmation');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Erreur de paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl rounded-3xl bg-[#eef1f8] p-6 text-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Paiement sécurisé</h1>
        <div className="text-4xl font-black text-[#031438]">GUICHET</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Détails de commande</h2>
            <div className="mt-3 space-y-2 text-sm">{pending.items.map((item) => <p key={item.id} className="flex justify-between"><span>{item.title} × {item.quantity}</span><strong>{formatMad(item.subtotal)}</strong></p>)}</div>
            <p className="mt-3 flex justify-between border-t pt-3"><span>Total à payer</span><strong>{formatMad(pending.totalNow)}</strong></p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm text-sm">
            <h3 className="font-semibold">Marchand</h3>
            <p className="mt-2">Guichet.com</p>
            <p>Casablanca - Maroc</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm text-sm">
            <h3 className="font-semibold">Informations client</h3>
            <p className="mt-2">{pending.customer.email}</p>
            <p>{pending.customer.countryCode} {pending.customer.mobile}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <label className="block text-sm">Méthode de paiement
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="mt-1 w-full rounded-xl border p-2">
              <option>Visa</option><option>Mastercard</option><option>CMI</option>
            </select>
          </label>
          <label className="block text-sm">Titulaire de la carte<input value={holder} onChange={(e) => setHolder(e.target.value)} className="mt-1 w-full rounded-xl border p-2" /></label>
          <label className="block text-sm">Numéro de carte<input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} className="mt-1 w-full rounded-xl border p-2" /></label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm">Date d'expiration<input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/AA" className="mt-1 w-full rounded-xl border p-2" /></label>
            <label className="block text-sm">Code de vérification<input value={cvv} onChange={(e) => setCvv(e.target.value)} className="mt-1 w-full rounded-xl border p-2" /></label>
          </div>
          <label className="flex items-center gap-2 pt-2 text-sm"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> J'accepte les conditions générales</label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-3">
            <button disabled={!canSubmit || loading} className="flex-1 rounded-full bg-[#031438] px-5 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Traitement...' : 'Valider le paiement'}</button>
            <button type="button" onClick={() => { clearPendingOrder(); navigate('/ma-fr/panier'); }} className="rounded-full border border-slate-300 px-5 py-3">Annuler</button>
          </div>
        </form>
      </div>
    </section>
  );
}
