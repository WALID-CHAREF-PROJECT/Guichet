import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CategoryStrip from '../components/CategoryStrip';
import PlatformTopNav from '../components/PlatformTopNav';
import FavoriteButton from '../components/FavoriteButton';
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
        {state === 'loading' && <p className="text-slate-300">Chargement des événements...</p>}
        {state === 'error' && <div className="rounded-2xl border border-white/10 bg-[#071b45] p-8 text-center"><p>Impossible de charger cette catégorie.</p><p className="mt-2 text-slate-300">{error}</p><button onClick={load} className="mt-4 rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button></div>}
        {state === 'ready' && events.length === 0 ? <p className="text-slate-300">Aucun événement publié pour cette catégorie.</p> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => {
            const location = event.location ?? [event.venue, event.city?.name].filter(Boolean).join(' · ');
            return (
              <Link key={event.id} to={`/ma-fr/event/${event.slug}`} className="group relative rounded-2xl border border-white/10 bg-[#071b45] p-3 transition-all hover:-translate-y-1">
                <div className="absolute right-3 top-3 z-10"><FavoriteButton itemId={event.slug} itemType="event" payload={{ slug: event.slug, title: event.title, image: event.image_url, location, date: event.starts_at_human, route: `/ma-fr/event/${event.slug}`, organizer: event.organizer }} /></div>
                <img src={event.image_url} alt={event.title} className="h-72 w-full rounded-xl object-cover" />
                <h3 className="mt-3 line-clamp-2 font-semibold">{event.title}</h3>
                <p className="mt-1 text-xs text-slate-300">{location} · {event.starts_at_human}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
