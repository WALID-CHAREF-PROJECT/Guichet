import { Link } from 'react-router-dom';
import ServiceTabs from './ServiceTabs';
import { ServiceKey } from '../services/platformData';
import { useCart } from '../contexts/CartContext';

export default function PlatformTopNav({ active, showCategories = false }: { active: ServiceKey; showCategories?: boolean }): JSX.Element {
  const { totals } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030d2a]/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-4 pb-4">
          <Link to="/ma-fr/billeterie" className="text-4xl font-black tracking-tight text-white">Guichet</Link>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-white/25 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/10">FR</button>
            <button className="rounded-full border border-white/25 px-2.5 py-1 text-xs font-semibold text-white/75 hover:bg-white/10">MA</button>
            <Link to="/ma-fr/panier" className="relative rounded-full border border-white/20 bg-white/10 p-2.5 text-sm text-white hover:bg-white/20">🛒
              <span className="absolute -right-2 -top-2 rounded-full bg-orange-500 px-1.5 text-[10px] font-bold">{totals.totalQuantity}</span>
            </Link>
            <button className="rounded-full border border-white/20 bg-white/10 p-2.5 text-sm text-white hover:bg-white/20">☰</button>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <ServiceTabs active={active} />
          <div className="flex items-center gap-2">
            <div className="flex w-full items-center gap-2 rounded-full border border-white/15 bg-[#102249] px-4 py-2 text-sm text-slate-200 xl:w-[390px]">
              <span>🔎</span>
              <input className="w-full bg-transparent outline-none placeholder:text-slate-400" placeholder="Cherchez ce que vous voulez" />
            </div>
            <button className="rounded-full border border-white/20 bg-[#102249] p-2.5 text-white hover:bg-[#163264]">⚙️</button>
          </div>
        </div>
      </div>
      {showCategories ? <div id="categories-slot" /> : null}
    </header>
  );
}
