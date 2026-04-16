import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getCartCount, getCurrentUser, setCurrentUser } from '../services/storage';

export default function Header(): JSX.Element {
  const { language, changeLanguage, translate } = useLanguage();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainTabs = [
    { to: '/events', label: translate('ticketing') },
    { to: '/events', label: translate('store') },
    { to: '/voyages', label: translate('travel') },
    { to: '/cinema', label: translate('cinema') },
    { to: '/sport', label: translate('sport') }
  ];

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

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#031438]/90 backdrop-blur">
      <div className="mx-auto max-w-[1700px] space-y-4 px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-5xl font-black leading-none text-white">{translate('brand')}</Link>
          <div className="hidden items-center gap-2 md:flex">
            <button onClick={() => changeLanguage('fr')} className={`rounded border px-2 py-0.5 text-xs ${language === 'fr' ? 'border-white/20 bg-white/10' : 'border-white/30'}`}>FR</button>
            <button onClick={() => changeLanguage('en')} className={`rounded border px-2 py-0.5 text-xs ${language === 'en' ? 'border-white/20 bg-white/10' : 'border-white/30'}`}>EN</button>
            <Link to="/cart" className="relative rounded-full bg-white/10 px-3 py-1 text-sm">🛒
              <span className="absolute -right-2 -top-2 rounded-full bg-orange-500 px-1.5 text-[10px] font-semibold text-white">{cartCount}</span>
            </Link>
            {user?.role === 'admin' && <Link to="/admin" className="rounded bg-orange-500 px-3 py-1 text-xs font-semibold">{translate('admin')}</Link>}
            {user ? (
              <>
                <span className="rounded bg-white/10 px-3 py-1 text-xs">{user.name}</span>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    window.dispatchEvent(new Event('ticketflow:update'));
                  }}
                  className="rounded bg-white/10 px-3 py-1 text-xs"
                >
                  {translate('logout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="rounded bg-white/10 px-3 py-1 text-xs">{translate('login')}</Link>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen((prev) => !prev)} className="rounded-full bg-white/10 px-3 py-1 text-sm md:hidden">☰ {mobileMenuOpen ? translate('close') : translate('menu')}</button>
        </div>

        <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} flex-wrap items-center justify-between gap-3 md:flex`}>
          <nav className="flex flex-wrap gap-2">
            {mainTabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `rounded-md border px-4 py-2 text-sm font-semibold transition ${
                    isActive ? 'border-white bg-white text-[#04143d]' : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <input
              placeholder={translate('searchPlaceholder')}
              className="w-full rounded-full border border-white/10 bg-[#112957] px-4 py-2 text-sm placeholder:text-slate-300 md:w-80"
            />
            <button className="rounded-full border border-white/20 bg-white/10 p-2">⚙️</button>
          </div>
        </div>
      </div>
    </header>
  );
}
