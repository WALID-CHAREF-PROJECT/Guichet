import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicCategories } from '../services/publicApi';
import { Category } from '../types/api';

export default function CategoryStrip(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);

  const load = (): void => {
    setError(false);
    getPublicCategories('event').then(setCategories).catch(() => setError(true));
  };

  useEffect(load, []);

  if (error) {
    return (
      <div className="border-t border-white/10 bg-[#041537]">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-2 text-xs text-slate-300 lg:px-8">
          <span>Catégories indisponibles.</span>
          <button onClick={load} className="underline">Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-white/10 bg-[#041537]">
      <div className="mx-auto flex max-w-[1800px] items-center gap-2 overflow-x-auto px-4 py-2 lg:px-8">
        {categories.length === 0 ? <span className="text-xs text-slate-400">Chargement des catégories...</span> : categories.map((item, idx) => (
          <Link
            key={item.id}
            to={`/ma-fr/event/tags/${item.slug}`}
            className="group flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium leading-none text-slate-200 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#10244f] text-[10px]">{item.icon || '🏷️'}</span>
            <span className="whitespace-nowrap">{item.name}</span>
            {idx !== categories.length - 1 && <span className="ml-1 text-slate-500">•</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
