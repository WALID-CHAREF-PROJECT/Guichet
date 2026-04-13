import { Link } from 'react-router-dom';

export default function Header(): JSX.Element {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-2xl font-bold text-brand-600">TicketFlow</Link>
        <nav className="hidden gap-4 md:flex">
          <Link to="/" className="hover:text-brand-600">Accueil</Link>
          <Link to="/events" className="hover:text-brand-600">Événements</Link>
          <Link to="/gallery" className="hover:text-brand-600">Galerie</Link>
          <Link to="/about" className="hover:text-brand-600">À propos</Link>
          <Link to="/contact" className="hover:text-brand-600">Contact</Link>
          <Link to="/cart" className="hover:text-brand-600">Panier</Link>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <select aria-label="Langue" className="rounded border px-2 py-1 text-sm"><option>FR</option><option>EN</option></select>
          <select aria-label="Pays" className="rounded border px-2 py-1 text-sm"><option>Maroc</option><option>France</option></select>
          <button className="relative rounded border px-3 py-1" aria-label="Panier">🛒<span className="absolute -right-2 -top-2 rounded-full bg-orange-500 px-1.5 text-xs text-white">2</span></button>
          <Link to="/login" className="rounded border px-3 py-1">Connexion</Link>
          <Link to="/register" className="rounded bg-orange-500 px-3 py-1 text-white transition hover:bg-orange-600">Inscription</Link>
        </div>
        <button className="rounded border px-2 py-1 md:hidden" aria-label="Menu mobile">☰</button>
      </div>
    </header>
  );
}
