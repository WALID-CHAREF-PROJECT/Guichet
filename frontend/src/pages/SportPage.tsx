import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import FavoriteButton from '../components/FavoriteButton';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaCard from '../components/MediaCard';
import DateFilterTabs, { DateFilterValue } from '../components/DateFilterTabs';
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
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilterValue>((searchParams.get('date_filter') as DateFilterValue) ?? '');

  const load = useCallback((): void => {
    setState('loading');
    getPublicEvents({ type: 'sport', q: searchParams.get('q') ?? undefined, city: searchParams.get('city') ?? undefined, date_filter: activeDateFilter || undefined })
      .then((payload) => { setEvents(payload.data); setState('ready'); setError(''); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : 'Erreur de chargement'); setState('error'); });
  }, [activeDateFilter, searchParams]);

  useEffect(load, [load]);

  useEffect(() => {
    setActiveDateFilter((searchParams.get('date_filter') as DateFilterValue) ?? '');
  }, [searchParams]);

  const filtered = events;

  return (
    <section className="space-y-8">
      <ServiceTabs active="sport" />
      <DateFilterTabs active={activeDateFilter} onChange={setActiveDateFilter} className="mx-auto max-w-3xl" />
      {state === 'loading' && <LoadingSkeleton label="Chargement des événements sportifs..." />}
      {state === 'error' && <EmptyState title="Impossible de charger les événements sportifs." description={error} action={<button onClick={load} className="rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button>} />}
      {state === 'ready' && filtered.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((item) => {
            const location = locationOf(item);
            const date = item.starts_at_human;
            return (
              <MediaCard
                key={item.id}
                to={`/ma-fr/event/${item.slug}`}
                title={item.title}
                image={item.image_url}
                eyebrow={item.category?.name ?? 'Sport'}
                meta={`${location} · ${date}`}
                price={item.is_free ? 'Gratuit' : `${item.price_mad} MAD`}
                actionLabel="Voir"
                favorite={<FavoriteButton itemId={item.slug} itemType="sport" payload={{ slug: item.slug, title: item.title, image: item.image_url, location, date, route: `/ma-fr/event/${item.slug}` }} />}
              />
            );
          })}
        </div>
      )}
      {state === 'ready' && filtered.length === 0 && (
        <EmptyState title="Aucun événement sportif pour cette période" description="Essayez une autre date ou réinitialisez le filtre pour voir toute la programmation sportive." action={<button onClick={() => setActiveDateFilter('')} className="rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Voir tous les sports</button>} />
      )}
    </section>
  );
}
