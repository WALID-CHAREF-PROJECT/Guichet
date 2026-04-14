import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCartCount, getCurrentUser, setCurrentUser, StoredUser } from '../services/storage';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/events', label: 'Événements' },
  { to: '/voyages', label: 'Voyages' },
  { to: '/cinema', label: 'Cinéma' },
  { to: '/gallery', label: 'Galerie' },
  { to: '/about', label: 'À propos' },
  { to: '/contact', label: 'Contact' }
];

export default function Header(): JSX.Element {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const sync = (): void => {
      setCartCount(getCartCount());
      setUser(getCurrentUser());
    };

    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('ticketflow:update', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('ticketflow:update', sync);
    };
  }, []);

  const logout = (): void => {
    setCurrentUser(null);
    window.dispatchEvent(new Event('ticketflow:update'));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-brand-600">TicketFlow</Link>

          <nav className="hidden items-center gap-4 md:flex">
            {navLinks.map((link) => <Link key={link.to} to={link.to} className="hover:text-brand-600">{link.label}</Link>)}
            <Link to="/cart" className="relative rounded border px-3 py-1" aria-label="Panier">🛒
              <span className="absolute -right-2 -top-2 rounded-full bg-orange-500 px-1.5 text-xs text-white">{cartCount}</span>
            </Link>
            {user ? (
              <>
                <span className="text-sm text-slate-600">Bonjour, {user.name}</span>
                <button onClick={logout} className="rounded border px-3 py-1">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded border px-3 py-1">Connexion</Link>
                <Link to="/register" className="rounded bg-orange-500 px-3 py-1 text-white transition hover:bg-orange-600">S'inscrire</Link>
              </>
            )}
          </nav>

          <button onClick={() => setMobileOpen((value) => !value)} className="rounded border px-2 py-1 md:hidden" aria-label="Menu mobile">☰</button>
        </div>

        {mobileOpen && (
          <nav className="mt-3 grid gap-2 border-t pt-3 md:hidden">
            {navLinks.map((link) => <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="rounded px-2 py-1 hover:bg-slate-100">{link.label}</Link>)}
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="rounded px-2 py-1 hover:bg-slate-100">Panier ({cartCount})</Link>
            {user ? (
              <button onClick={() => { logout(); setMobileOpen(false); }} className="rounded border px-3 py-1 text-left">Déconnexion</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded border px-3 py-1">Connexion</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="rounded bg-orange-500 px-3 py-1 text-white">S'inscrire</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
