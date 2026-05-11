import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import FavoriteButton from '../components/FavoriteButton';
import { getPublicEvents } from '../services/publicApi';
import { EventItem } from '../types/api';

type LoadState = 'loading' | 'ready' | 'error';

function locationOf(item: EventItem): string {
  return item.location ?? [item.venue, item.city?.name].filter(Boolean).join(' · ');
}

export default function SportPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState('');

  const load = (): void => {
    setState('loading');
    getPublicEvents({ type: 'sport', q: searchParams.get('q') ?? undefined })
      .then((payload) => { setEvents(payload.data); setState('ready'); setError(''); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : 'Erreur de chargement'); setState('error'); });
  };

  useEffect(load, [searchParams]);

  const filtered = events.filter((item) => {
    const city = (searchParams.get('city') ?? '').toLowerCase();
    return !city || locationOf(item).toLowerCase().includes(city);
  });

  return (
    <section className="space-y-8">
      <ServiceTabs active="sport" />
      {state === 'loading' && <div className="rounded-2xl border border-white/10 bg-[#03173f] py-12 text-center text-slate-300">Chargement des événements sportifs...</div>}
      {state === 'error' && <div className="rounded-2xl border border-white/10 bg-[#03173f] py-12 text-center"><p>Impossible de charger les événements sportifs.</p><p className="mt-2 text-slate-300">{error}</p><button onClick={load} className="mt-4 rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button></div>}
      {state === 'ready' && filtered.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((item) => {
            const location = locationOf(item);
            const date = item.starts_at_human;
            return (
              <Link key={item.id} to={`/ma-fr/event/${item.slug}`} className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#041743]">
                <div className="absolute right-3 top-3 z-10"><FavoriteButton itemId={item.slug} itemType="sport" payload={{ slug: item.slug, title: item.title, image: item.image_url, location, date, route: `/ma-fr/event/${item.slug}` }} /></div>
                <img src={item.image_url} alt={item.title} className="h-56 w-full object-cover" />
                <div className="space-y-1 p-4">
                  <p className="text-xs uppercase tracking-wide text-orange-300">{item.category?.name ?? 'Sport'}</p>
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="text-sm text-slate-300">{location} · {date}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {state === 'ready' && filtered.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#03173f] py-12 text-center">
          <p className="text-lg font-semibold">Aucun résultat sportif publié</p>
          <p className="mt-2 text-slate-300">Ajustez les filtres ou revenez plus tard pour les nouveaux événements.</p>
        </div>
      )}
    </section>
  );
}
