import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CategoryStrip from '../components/CategoryStrip';
import PlatformTopNav from '../components/PlatformTopNav';
import FavoriteButton from '../components/FavoriteButton';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaCard from '../components/MediaCard';
import { getPublicEvents } from '../services/publicApi';
import { EventItem } from '../types/api';

type LoadState = 'loading' | 'ready' | 'error';

export default function EventTagsPage(): JSX.Element {
  const { tag = '' } = useParams();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState('');

  const load = (): void => {
    setState('loading');
    getPublicEvents({ category: tag })
      .then((payload) => { setEvents(payload.data); setError(''); setState('ready'); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : 'Erreur de chargement'); setState('error'); });
  };

  useEffect(load, [tag]);

  return (
    <div className="-mx-4 min-h-screen bg-[#020b22] text-white lg:-mx-8">
      <PlatformTopNav active="billeterie" />
      <CategoryStrip />
      <section className="mx-auto max-w-[1800px] px-4 py-8 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold">Tous les événements {tag}</h1>
        {state === 'loading' && <LoadingSkeleton label="Chargement des événements..." />}
        {state === 'error' && <EmptyState title="Impossible de charger cette catégorie." description={error} action={<button onClick={load} className="rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button>} />}
        {state === 'ready' && events.length === 0 ? <EmptyState title="Aucun événement publié pour cette catégorie." /> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => {
            const location = event.location ?? [event.venue, event.city?.name].filter(Boolean).join(' · ');
            return (
              <MediaCard
                key={event.id}
                to={`/ma-fr/event/${event.slug}`}
                title={event.title}
                image={event.image_url}
                eyebrow={event.organizer}
                meta={`${location} · ${event.starts_at_human}`}
                price={event.is_free ? 'Gratuit' : `${event.price_mad} MAD`}
                favorite={<FavoriteButton itemId={event.slug} itemType="event" payload={{ slug: event.slug, title: event.title, image: event.image_url, location, date: event.starts_at_human, route: `/ma-fr/event/${event.slug}`, organizer: event.organizer }} />}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
