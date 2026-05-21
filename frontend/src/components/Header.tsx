import { useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';

const quickPresets = [
  { key: 'today', label: 'Aujourd’hui' },
  { key: 'week', label: 'Cette semaine' },
  { key: 'weekend', label: 'ce weekend' },
  { key: 'month', label: 'Ce mois-ci' }
] as const;

export default function Header(): JSX.Element {
  const { language, changeLanguage, translate } = useLanguage();
  const { totals } = useCart();
  const { user, logout } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const mainTabs = [
    { to: '/ma-fr/billeterie', label: translate('ticketing') },
    { to: '/ma-fr/store', label: translate('store') },
    { to: '/ma-fr/voyage', label: translate('travel') },
    { to: '/ma-fr/cinema', label: translate('cinema') },
    { to: '/ma-fr/sport', label: translate('sport') }
  ];

  const pageConfig = useMemo(() => {
    if (location.pathname.startsWith('/ma-fr/cinema')) return { isSport: false, categories: ['Action', 'Comédie', 'Horreur', 'Animation'], cities: ['Casablanca', 'Rabat', 'Marrakech'], hours: ['Matin', 'Après-midi', 'Soir'] };
    if (location.pathname.startsWith('/ma-fr/voyage') || location.pathname.startsWith('/ma-fr/travel')) return { isSport: false, categories: ['Voyage organisé', 'Last Minute', 'Early Booking', 'Voyage thématique'], cities: ['Paris', 'Istanbul', 'Amman'], hours: ['Matin', 'Après-midi', 'Soir'] };
    if (location.pathname.startsWith('/ma-fr/sport')) return { isSport: true, categories: ['Basketball', 'Running'], cities: ['Casablanca', 'Rabat'], hours: [] as string[] };
    return { isSport: false, categories: ['Concerts', 'Festivals', 'Théâtre'], cities: ['Casablanca', 'Rabat', 'Marrakech'], hours: ['Matin', 'Après-midi', 'Soir'] };
  }, [location.pathname]);

  const [draft, setDraft] = useState(() => ({
    q: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? '',
    city: searchParams.get('city') ?? '',
    hour: searchParams.get('hour') ?? '',
    preset: searchParams.get('preset') ?? 'week',
    date: searchParams.get('date') ?? ''
  }));

  const openFilters = (): void => {
    setDraft({
      q: searchParams.get('q') ?? '',
      category: searchParams.get('category') ?? '',
      city: searchParams.get('city') ?? '',
      hour: searchParams.get('hour') ?? '',
      preset: searchParams.get('preset') ?? 'week',
      date: searchParams.get('date') ?? ''
    });
    setFilterOpen(true);
  };

  const applyFilters = (): void => {
    const next = new URLSearchParams(searchParams.toString());
    (Object.entries(draft) as Array<[keyof typeof draft, string]>).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    navigate({ pathname: location.pathname, search: next.toString() });
    setFilterOpen(false);
  };

  const resetFilters = (): void => {
    setDraft({ q: '', category: '', city: '', hour: '', preset: 'week', date: '' });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#031438]/80 shadow-[0_12px_35px_rgba(2,8,23,0.45)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1700px] space-y-4 px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="rounded-2xl border border-white/20 bg-white/5 px-4 py-1 text-5xl font-black leading-none text-white shadow-lg shadow-sky-900/30">{translate('brand')}</Link>
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
            <input
              value={searchParams.get('q') ?? ''}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams.toString());
                if (e.target.value) next.set('q', e.target.value);
                else next.delete('q');
                navigate({ pathname: location.pathname, search: next.toString() });
              }}
              placeholder={translate('searchPlaceholder')}
              className="w-full rounded-full border border-white/10 bg-[#112957] px-4 py-2 text-sm placeholder:text-slate-300 md:w-80"
            />
            <button onClick={openFilters} className="rounded-full border border-white/20 bg-white/10 p-2">⚙️</button>
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className="fixed inset-0 z-[80] bg-black/70 p-3 backdrop-blur-sm" onClick={() => setFilterOpen(false)}>
          <aside className="ml-auto mt-8 w-full max-w-md rounded-3xl border border-white/10 bg-[#041743] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="text-xl font-bold">Plus de filtres</h3><button onClick={() => setFilterOpen(false)} className="rounded-full border border-white/20 px-2">✕</button></div>
            <div className="mt-4 space-y-4 text-sm">
              <label className="block">Catégories
                <select disabled={pageConfig.isSport} value={draft.category} onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0a2457] p-2 disabled:opacity-50">
                  <option value="">Toutes catégories</option>{pageConfig.categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="block">Villes
                <select value={draft.city} onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0a2457] p-2">
                  <option value="">Toutes villes</option>{pageConfig.cities.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="block">Heures
                <select disabled={pageConfig.hours.length === 0} value={draft.hour} onChange={(e) => setDraft((prev) => ({ ...prev, hour: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0a2457] p-2 disabled:opacity-50">
                  <option value="">Tous créneaux</option>{pageConfig.hours.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="block">Date spécifique
                <input type="date" value={draft.date} onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0a2457] p-2" />
              </label>
              <div className="flex flex-wrap gap-2">{quickPresets.map((preset) => <button key={preset.key} onClick={() => setDraft((prev) => ({ ...prev, preset: preset.key }))} className={`rounded-full border px-3 py-1.5 text-xs ${draft.preset === preset.key ? 'border-orange-300 bg-orange-400/20 text-orange-200' : 'border-white/20 bg-white/5 text-slate-200'}`}>{preset.label}</button>)}</div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={resetFilters} className="flex-1 rounded-xl bg-white py-2 text-[#041743]">Réinitialiser</button>
              <button onClick={applyFilters} className="flex-1 rounded-xl bg-orange-500 py-2 font-semibold text-white">Appliquer</button>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
