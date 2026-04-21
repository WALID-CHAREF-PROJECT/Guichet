import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';

export default function Header(): JSX.Element {
  const { language, changeLanguage, translate } = useLanguage();
  const { totals } = useCart();
  const { user, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainTabs = [
    { to: '/ma-fr/billeterie', label: translate('ticketing') },
    { to: '/ma-fr/store', label: translate('store') },
    { to: '/ma-fr/voyage', label: translate('travel') },
    { to: '/ma-fr/cinema', label: translate('cinema') },
    { to: '/ma-fr/sport', label: translate('sport') }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#031438]/90 backdrop-blur">
      <div className="mx-auto max-w-[1700px] space-y-4 px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-5xl font-black leading-none text-white">{translate('brand')}</Link>
          <div className="hidden items-center gap-2 md:flex">
            <button onClick={() => changeLanguage('fr')} className={`rounded border px-2 py-0.5 text-xs ${language === 'fr' ? 'border-white/20 bg-white/10' : 'border-white/30'}`}>FR</button>
            <button onClick={() => changeLanguage('en')} className={`rounded border px-2 py-0.5 text-xs ${language === 'en' ? 'border-white/20 bg-white/10' : 'border-white/30'}`}>EN</button>
            <Link to="/ma-fr/panier" className="relative rounded-full bg-white/10 px-3 py-1 text-sm">🛒<span className="absolute -right-2 -top-2 rounded-full bg-orange-500 px-1.5 text-[10px] font-semibold text-white">{totals.totalQuantity}</span></Link>
            {user ? (
              <>
                <Link to="/ma-fr/account" className="rounded bg-white/10 px-3 py-1 text-xs">{user.firstName} {user.lastName}</Link>
                <button onClick={logout} className="rounded bg-white/10 px-3 py-1 text-xs">Déconnexion</button>
              </>
            ) : (
              <Link to="/ma-fr/login" className="rounded bg-white/10 px-3 py-1 text-xs">{translate('login')}</Link>
            )}
          </div>
          <button onClick={() => setMobileMenuOpen((prev) => !prev)} className="rounded-full bg-white/10 px-3 py-1 text-sm md:hidden">☰</button>
        </div>

        <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} flex-wrap items-center justify-between gap-3 md:flex`}>
          <nav className="flex flex-wrap gap-2">
            {mainTabs.map((tab) => <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `rounded-md border px-4 py-2 text-sm font-semibold ${isActive ? 'border-white bg-white text-[#04143d]' : 'border-white/20 bg-white/5 text-white hover:bg-white/10'}`}>{tab.label}</NavLink>)}
          </nav>
          <div className="flex w-full items-center gap-2 md:w-auto">
            <input placeholder={translate('searchPlaceholder')} className="w-full rounded-full border border-white/10 bg-[#112957] px-4 py-2 text-sm placeholder:text-slate-300 md:w-80" />
            <button className="rounded-full border border-white/20 bg-white/10 p-2">⚙️</button>
          </div>
        </div>
      </div>
    </header>
  );
}
