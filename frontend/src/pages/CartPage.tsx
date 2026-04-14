import { Link } from 'react-router-dom';
import { getCurrentUser, getCart, saveCart } from '../services/storage';

export default function CartPage(): JSX.Element {
  const cart = getCart();
  const user = getCurrentUser();

  const updateQuantity = (eventId: number, delta: number): void => {
    const nextCart = getCart()
      .map((item) => (item.event.id === eventId ? { ...item, quantity: item.quantity + delta } : item))
      .filter((item) => item.quantity > 0);

    saveCart(nextCart);
    window.dispatchEvent(new Event('ticketflow:update'));
    window.location.reload();
  };

  const clearCart = (): void => {
    saveCart([]);
    window.dispatchEvent(new Event('ticketflow:update'));
    window.location.reload();
  };

  const total = cart.reduce((sum, item) => sum + item.quantity * item.event.price_mad, 0);

  return (
    <section className="rounded-2xl border bg-white p-8">
      <h1 className="text-3xl font-bold">Panier</h1>
      {!user && <p className="mt-2 text-orange-600">Veuillez vous connecter pour finaliser votre commande. <Link to="/login" className="font-semibold underline">Connexion</Link></p>}

      {cart.length === 0 ? (
        <p className="mt-4 text-slate-600">Votre panier est vide.</p>
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
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.event.id, 1)} className="rounded border px-2 py-1">+</button>
              </div>
              <p className="font-semibold">{item.event.is_free ? 'Gratuit' : `${item.event.price_mad * item.quantity} MAD`}</p>
            </article>
          ))}
          <div className="flex flex-col gap-3 border-t pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-lg font-bold">Total: {total} MAD</p>
            <div className="flex gap-2">
              <button onClick={clearCart} className="rounded border px-4 py-2">Vider</button>
              <button className="rounded bg-brand-600 px-4 py-2 text-white">Valider la commande</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
