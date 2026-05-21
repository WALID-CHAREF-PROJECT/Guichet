import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ServiceTabs from './ServiceTabs';
import { ServiceKey } from '../services/platformData';
import { useCart } from '../contexts/CartContext';
import { useUser } from '../contexts/UserContext';
import { useMemo, useState } from 'react';

const quickPresets = [
  { key: 'today', label: 'Aujourd’hui' },
  { key: 'week', label: 'Cette semaine' },
  { key: 'weekend', label: 'ce weekend' },
  { key: 'month', label: 'Ce mois-ci' }
] as const;

export default function PlatformTopNav({ active, showCategories = false }: { active: ServiceKey; showCategories?: boolean }): JSX.Element {
  const { totals } = useCart();
  const { user, logout } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const pageConfig = useMemo(() => {
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

  return (
    <header className="sticky top-0 z-40 border-b border-sky-200/10 bg-[#020b22]/90 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-4 pb-4">
          <Link to="/ma-fr/billeterie" className="bg-gradient-to-r from-sky-100 via-cyan-100 to-amber-200 bg-clip-text text-4xl font-black tracking-tight text-transparent">Guichet</Link>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-sky-100/30 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/[0.12]">FR</button>
            <button className="rounded-full border border-sky-100/20 bg-white/[0.02] px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.12]">MA</button>
            <Link to="/ma-fr/panier" className="relative rounded-full border border-sky-100/20 bg-white/[0.08] p-2.5 text-sm text-white shadow-glass transition hover:border-sky-200/45 hover:bg-white/[0.16]">🛒<span className="absolute -right-2 -top-2 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-[#1c1200]">{totals.totalQuantity}</span></Link>
            <button onClick={() => setDrawerOpen(true)} className="rounded-full border border-sky-100/20 bg-white/[0.08] p-2.5 text-sm text-white transition hover:border-sky-200/45 hover:bg-white/[0.16]">☰</button>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <ServiceTabs active={active} />
          <div className="flex items-center gap-2">
            <div className="flex w-full items-center gap-2 rounded-full border border-sky-200/20 bg-[#11284f]/80 px-4 py-2 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] xl:w-[390px]"><span>🔎</span><input value={searchParams.get('q') ?? ''} onChange={(e)=>{const next=new URLSearchParams(searchParams.toString()); if(e.target.value) next.set('q', e.target.value); else next.delete('q'); navigate({pathname:location.pathname, search:next.toString()});}} className="w-full bg-transparent outline-none placeholder:text-slate-400" placeholder="Cherchez ce que vous voulez" /></div>
            <button onClick={openFilters} className="rounded-full border border-sky-200/20 bg-[#11284f]/85 p-2.5 text-white transition hover:border-sky-200/40 hover:bg-[#1a3a71]">⚙️</button>
          </div>
        </div>
      </div>
      {showCategories ? <div id="categories-slot" /> : null}

      {filterOpen ? (
        <div className="fixed inset-0 z-[80] bg-black/70 p-3 backdrop-blur-sm" onClick={() => setFilterOpen(false)}>
          <aside className="ml-auto mt-8 w-full max-w-md rounded-3xl border border-white/10 bg-[#041743] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between"><h3 className="text-xl font-bold">Plus de filtres</h3><button onClick={() => setFilterOpen(false)} className="rounded-full border border-white/20 px-2">✕</button></div>
            <div className="mt-4 space-y-4 text-sm">
              <label className="block">Catégories
                <select disabled={pageConfig.isSport} value={draft.category} onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0a2457] p-2 disabled:opacity-50"><option value="">Toutes catégories</option>{pageConfig.categories.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="block">Villes
                <select value={draft.city} onChange={(e) => setDraft((prev) => ({ ...prev, city: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0a2457] p-2"><option value="">Toutes villes</option>{pageConfig.cities.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="block">Heures
                <select disabled={pageConfig.hours.length === 0} value={draft.hour} onChange={(e) => setDraft((prev) => ({ ...prev, hour: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0a2457] p-2 disabled:opacity-50"><option value="">Tous créneaux</option>{pageConfig.hours.map((item) => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="block">Date spécifique<input type="date" value={draft.date} onChange={(e) => setDraft((prev) => ({ ...prev, date: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0a2457] p-2" /></label>
              <div className="flex flex-wrap gap-2">{quickPresets.map((preset) => <button key={preset.key} onClick={() => setDraft((prev) => ({ ...prev, preset: preset.key }))} className={`rounded-full border px-3 py-1.5 text-xs ${draft.preset === preset.key ? 'border-orange-300 bg-orange-400/20 text-orange-200' : 'border-white/20 bg-white/5 text-slate-200'}`}>{preset.label}</button>)}</div>
            </div>
            <div className="mt-6 flex gap-2"><button onClick={() => setDraft({ q: '', category: '', city: '', hour: '', preset: 'week', date: '' })} className="flex-1 rounded-xl bg-white py-2 text-[#041743]">Réinitialiser</button><button onClick={() => { const next = new URLSearchParams(searchParams.toString()); (Object.entries(draft) as Array<[keyof typeof draft, string]>).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key);}); navigate({ pathname: location.pathname, search: next.toString() }); setFilterOpen(false); }} className="flex-1 rounded-xl bg-orange-500 py-2 font-semibold text-white">Appliquer</button></div>
          </aside>
        </div>
      ) : null}

      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#020814]/80 backdrop-blur-sm" onClick={() => setDrawerOpen(false)}>
          <aside className="ml-auto flex h-full w-[330px] flex-col border-l border-white/10 bg-gradient-to-b from-[#071b45] to-[#030d26] p-4 text-white shadow-[-18px_0_40px_rgba(2,8,28,0.65)]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setDrawerOpen(false)} className="mb-4 w-fit rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10">Fermer</button>
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold text-white">{user ? `${user.firstName} ${user.lastName}` : 'Invité'}</p>
              <p className="mt-1 text-xs text-slate-300">{user?.email ?? 'non connecté'}</p>
            </div>
            <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Menu</p>
            <div className="space-y-2 text-sm">
              <NavLink to="/ma-fr/account/profile" className={({ isActive }) => `block rounded-xl border px-3 py-2.5 transition ${isActive ? 'border-orange-300/60 bg-orange-400/15 text-white' : 'border-transparent bg-white/5 text-slate-100 hover:border-white/15 hover:bg-white/10'}`}>Mes informations</NavLink>
              <NavLink to="/ma-fr/account/security" className={({ isActive }) => `block rounded-xl border px-3 py-2.5 transition ${isActive ? 'border-orange-300/60 bg-orange-400/15 text-white' : 'border-transparent bg-white/5 text-slate-100 hover:border-white/15 hover:bg-white/10'}`}>Mot de passe</NavLink>
              <NavLink to="/ma-fr/account/reservations" className={({ isActive }) => `block rounded-xl border px-3 py-2.5 transition ${isActive ? 'border-orange-300/60 bg-orange-400/15 text-white' : 'border-transparent bg-white/5 text-slate-100 hover:border-white/15 hover:bg-white/10'}`}>Mes réservations</NavLink>
              <NavLink to="/ma-fr/account/travels" className={({ isActive }) => `block rounded-xl border px-3 py-2.5 transition ${isActive ? 'border-orange-300/60 bg-orange-400/15 text-white' : 'border-transparent bg-white/5 text-slate-100 hover:border-white/15 hover:bg-white/10'}`}>Mes voyages</NavLink>
              <NavLink to="/ma-fr/account/favorites" className={({ isActive }) => `block rounded-xl border px-3 py-2.5 transition ${isActive ? 'border-orange-300/60 bg-orange-400/15 text-white' : 'border-transparent bg-white/5 text-slate-100 hover:border-white/15 hover:bg-white/10'}`}>Mes favoris</NavLink>
              <NavLink to="/ma-fr/account/balance" className={({ isActive }) => `block rounded-xl border px-3 py-2.5 transition ${isActive ? 'border-orange-300/60 bg-orange-400/15 text-white' : 'border-transparent bg-white/5 text-slate-100 hover:border-white/15 hover:bg-white/10'}`}>Mon solde</NavLink>
            </div>
            <p className="mb-2 mt-6 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Aide</p>
            <div className="space-y-1.5 text-sm text-slate-200">
              <span className="block rounded-lg px-3 py-2">Contacter le service client</span>
              <span className="block rounded-lg px-3 py-2">Mentions légales</span>
              <span className="block rounded-lg px-3 py-2">F.A.Q</span>
              <span className="block rounded-lg px-3 py-2">Politique de remboursement</span>
            </div>
            <button onClick={logout} className="mt-auto w-full rounded-xl border border-red-300/35 bg-red-500/15 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-500/25">Se déconnecter</button>
          </aside>
        </div>
      )}
    </header>
  );
}
