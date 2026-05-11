import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import FavoriteButton from '../components/FavoriteButton';
import EmptyState from '../components/EmptyState';
import FeaturedCarousel from '../components/FeaturedCarousel';
import LoadingSkeleton from '../components/LoadingSkeleton';
import MediaCard from '../components/MediaCard';
import { getPublicMovies, PublicMovie } from '../services/publicApi';

type LoadState = 'loading' | 'ready' | 'error';

export default function CinemaPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [activeSlide, setActiveSlide] = useState(0);
  const [movies, setMovies] = useState<PublicMovie[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState('');

  const load = (): void => {
    setState('loading');
    getPublicMovies()
      .then((items) => { setMovies(items); setState('ready'); setError(''); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : 'Erreur de chargement'); setState('error'); });
  };

  useEffect(load, []);

  useEffect(() => {
    if (movies.length === 0) return undefined;
    const timer = setInterval(() => setActiveSlide((prev) => (prev + 1) % movies.length), 3500);
    return () => clearInterval(timer);
  }, [movies.length]);

  const filteredMovies = useMemo(() => {
    const q = (searchParams.get('q') ?? '').toLowerCase();
    const category = (searchParams.get('category') ?? '').toLowerCase();
    return movies.filter((movie) => {
      const matchesQuery = !q || movie.title.toLowerCase().includes(q) || movie.genre.toLowerCase().includes(q);
      const matchesCategory = !category || movie.genre.toLowerCase().includes(category);
      return matchesQuery && matchesCategory;
    });
  }, [movies, searchParams]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <ServiceTabs active="cinema" />
        <div className="flex w-full items-center gap-2 rounded-full border border-white/15 bg-[#102249] px-4 py-2 text-sm text-slate-200 xl:w-[390px]">
          <span>🔎</span><input className="w-full bg-transparent outline-none placeholder:text-slate-400" placeholder="Rechercher un film" readOnly value={searchParams.get('q') ?? ''} />
        </div>
      </div>

      {state === 'loading' && <LoadingSkeleton label="Chargement des films..." />}
      {state === 'error' && <EmptyState title="Impossible de charger les films." description={error} action={<button onClick={load} className="rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button>} />}
      {state === 'ready' && movies.length === 0 && <EmptyState title="Aucun film publié pour le moment." />}

      {state === 'ready' && movies.length > 0 && (
        <>
          <FeaturedCarousel
            label="Films à l'affiche"
            items={movies.map((movie) => ({ id: movie.id, title: movie.title, subtitle: movie.description || movie.genre, image: movie.image, to: `/ma-fr/cinema/${movie.slug}`, ctaLabel: 'Voir les séances', meta: movie.genre || 'Cinéma' }))}
            activeIndex={activeSlide}
            onSelect={setActiveSlide}
            maxHeightClassName="max-h-[440px]"
          />

          <h1 className="text-5xl font-bold">Toujours à l'affiche</h1>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredMovies.map((movie) => (
              <MediaCard
                key={movie.slug}
                to={`/ma-fr/cinema/${movie.slug}`}
                title={movie.title}
                image={movie.image}
                eyebrow={movie.genre || 'Cinéma'}
                meta={`Durée: ${movie.duration || 'Non renseignée'}`}
                actionLabel="Les séances"
                aspect="poster"
                favorite={<FavoriteButton itemId={movie.slug} itemType="movie" payload={{ slug: movie.slug, title: movie.title, image: movie.image, route: `/ma-fr/cinema/${movie.slug}` }} />}
              />
            ))}
          </div>
          {filteredMovies.length === 0 && <EmptyState title="Aucun film ne correspond à vos filtres." />}
        </>
      )}
    </section>
  );
}
