import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getCurrentUser, getCart, saveCart } from '../services/storage';

export default function CartPage(): JSX.Element {
  const { translate } = useLanguage();
  const user = getCurrentUser();
  const [cart, setCart] = useState(getCart());
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [message, setMessage] = useState('');

  const updateQuantity = (eventId: number, delta: number): void => {
    const nextCart = cart
      .map((item) => (item.event.id === eventId ? { ...item, quantity: item.quantity + delta } : item))
      .filter((item) => item.quantity > 0);

    setCart(nextCart);
    saveCart(nextCart);
    window.dispatchEvent(new Event('ticketflow:update'));
  };

  const clearCart = (): void => {
    setCart([]);
    saveCart([]);
    window.dispatchEvent(new Event('ticketflow:update'));
  };

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.quantity * item.event.price_mad, 0), [cart]);

  const submitOrder = (event: FormEvent): void => {
    event.preventDefault();
    const visaRegex = /^4[0-9]{12}(?:[0-9]{3})?$/;
    const cleanCardNumber = cardNumber.replace(/\s+/g, '');

    if (!visaRegex.test(cleanCardNumber)) {
      setMessage(translate('invalidCard'));
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
      setMessage(translate('invalidExpiry'));
      return;
    }

    if (!/^\d{3}$/.test(cvc)) {
      setMessage(translate('invalidCvc'));
      return;
    }

    clearCart();
    setCardName('');
    setCardNumber('');
    setExpiry('');
    setCvc('');
    setMessage(translate('paymentSuccess'));
  };

  return (
    <section className="rounded-2xl border bg-white p-8">
      <h1 className="text-3xl font-bold">{translate('cart')}</h1>
      {!user && <p className="mt-2 text-orange-600">{translate('loginRequired')} <Link to="/login" className="font-semibold underline">{translate('login')}</Link></p>}

      {cart.length === 0 ? (
        <p className="mt-4 text-slate-600">{translate('emptyCart')}</p>
      ) : (
        <div className="mt-6 space-y-4">
          {cart.map((item) => (
            <article key={item.event.id} className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">{item.event.title}</h2>
                <p className="text-sm text-slate-600">{item.event.city.name} · {item.event.starts_at_human}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.event.id, -1)} className="rounded border px-2 py-1">-</button>
                <span>{translate('quantity')}: {item.quantity}</span>
                <button onClick={() => updateQuantity(item.event.id, 1)} className="rounded border px-2 py-1">+</button>
              </div>
              <p className="font-semibold">{item.event.is_free ? 'Gratuit' : `${item.event.price_mad * item.quantity} MAD`}</p>
            </article>
          ))}
          <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-lg font-bold">{translate('total')}: {total} MAD</p>
            <div className="flex gap-2">
              <button onClick={clearCart} className="rounded border px-4 py-2">{translate('clear')}</button>
            </div>
          </div>

          <form onSubmit={submitOrder} className="space-y-3 rounded-xl border bg-slate-50 p-4">
            <h2 className="text-lg font-semibold">{translate('paymentTitle')}</h2>
            <input required value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder={translate('cardName')} className="w-full rounded border px-3 py-2" />
            <input required value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder={translate('cardNumber')} className="w-full rounded border px-3 py-2" />
            <div className="grid grid-cols-2 gap-3">
              <input required value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder={translate('expiry')} className="w-full rounded border px-3 py-2" />
              <input required value={cvc} onChange={(e) => setCvc(e.target.value)} placeholder={translate('cvc')} className="w-full rounded border px-3 py-2" />
            </div>
            <button className="rounded bg-brand-600 px-4 py-2 text-white" type="submit">{translate('checkout')}</button>
          </form>
          {message && <p className="text-sm font-medium text-brand-700">{message}</p>}
        </div>
      )}
    </section>
  );
}
