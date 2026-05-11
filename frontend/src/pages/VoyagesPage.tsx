import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import FavoriteButton from '../components/FavoriteButton';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaCard from '../components/MediaCard';
import { getPublicCategories, getPublicTravels, PublicTravel } from '../services/publicApi';
import { Category } from '../types/api';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type LoadState = 'loading' | 'ready' | 'error';

export default function VoyagesPage(): JSX.Element {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const [travels, setTravels] = useState<PublicTravel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState('');

  const load = (): void => {
    setState('loading');
    Promise.all([getPublicTravels(), getPublicCategories('travel')])
      .then(([travelItems, categoryItems]) => { setTravels(travelItems); setCategories(categoryItems); setState('ready'); setError(''); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : 'Erreur de chargement'); setState('error'); });
  };

  useEffect(load, []);

  const visibleCategories = useMemo(() => {
    const fromTravels = travels.map((trip) => ({ id: trip.collection, name: trip.collection, slug: slugify(trip.collection) })).filter((item) => item.name);
    const bySlug = new Map<string, Category>();
    [...categories, ...fromTravels].forEach((item) => bySlug.set(item.slug, item as Category));
    return Array.from(bySlug.values());
  }, [categories, travels]);

  const filtered = travels.filter((trip) => {
    const byCategoryRoute = category ? slugify(trip.collection) === category : true;
    const q = (searchParams.get('q') ?? '').toLowerCase();
    const byQuery = !q || trip.title.toLowerCase().includes(q) || trip.location.toLowerCase().includes(q);
    const selectedCategory = (searchParams.get('category') ?? '').toLowerCase();
    const byCategoryFilter = !selectedCategory || trip.collection.toLowerCase().includes(selectedCategory);
    const city = (searchParams.get('city') ?? '').toLowerCase();
    const byCity = !city || trip.location.toLowerCase().includes(city);
    return byCategoryRoute && byQuery && byCategoryFilter && byCity;
  });

  return (
    <section className="space-y-8">
      <ServiceTabs active="voyage" />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {visibleCategories.map((item) => {
          const slug = item.slug || slugify(item.name);
          const active = category === slug;
          return (
            <Link key={slug} to={`/ma-fr/travel/category/${slug}`} className={`shrink-0 rounded-full border px-4 py-2 text-sm ${active ? 'border-white bg-white text-[#041743]' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}>
              {item.name}
            </Link>
          );
        })}
      </div>
      <h1 className="text-5xl font-bold">Les voyages les plus appréciés sur Guichet</h1>

      {state === 'loading' && <LoadingSkeleton label="Chargement des voyages..." />}
      {state === 'error' && <EmptyState title="Impossible de charger les voyages." description={error} action={<button onClick={load} className="rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button>} />}
      {state === 'ready' && travels.length === 0 && <EmptyState title="Aucun voyage publié pour le moment." />}

      {state === 'ready' && travels.length > 0 && (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((trip) => (
              <MediaCard
                key={trip.slug}
                to={`/ma-fr/voyage/${trip.slug}`}
                title={trip.title}
                image={trip.image}
                eyebrow={trip.location}
                meta={trip.departureDate}
                price={trip.priceLabel}
                actionLabel="Voir l’offre"
                favorite={<FavoriteButton itemId={trip.slug} itemType="travel" payload={{ slug: trip.slug, title: trip.title, image: trip.image, location: trip.location, date: trip.departureDate, route: `/ma-fr/voyage/${trip.slug}` }} />}
              />
            ))}
          </div>
          {filtered.length === 0 && <EmptyState title="Aucun voyage disponible avec ces filtres." />}
        </>
      )}
    </section>
  );
}
