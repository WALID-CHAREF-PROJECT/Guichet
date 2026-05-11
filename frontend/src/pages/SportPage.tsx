import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import FavoriteButton from '../components/FavoriteButton';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaCard from '../components/MediaCard';
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
        <EmptyState title="Aucun résultat sportif publié" description="Ajustez les filtres ou revenez plus tard pour les nouveaux événements." />
      )}
    </section>
  );
}
