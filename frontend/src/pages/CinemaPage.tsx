import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import FavoriteButton from '../components/FavoriteButton';
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

      {state === 'loading' && <div className="rounded-2xl border border-white/10 bg-[#041743] p-8 text-center text-slate-300">Chargement des films...</div>}
      {state === 'error' && <div className="rounded-2xl border border-white/10 bg-[#041743] p-8 text-center"><p>Impossible de charger les films.</p><p className="mt-2 text-slate-300">{error}</p><button onClick={load} className="mt-4 rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button></div>}
      {state === 'ready' && movies.length === 0 && <div className="rounded-2xl border border-white/10 bg-[#041743] p-8 text-center text-slate-300">Aucun film publié pour le moment.</div>}

      {state === 'ready' && movies.length > 0 && (
        <>
          <div className="overflow-hidden rounded-2xl">
            <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
              {movies.map((movie) => (
                <Link key={movie.id} to={`/ma-fr/cinema/${movie.slug}`} className="min-w-full bg-[#07183f]">
                  <img src={movie.image} alt={movie.title} className="h-[430px] w-full object-cover" />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-2">{movies.map((movie, index) => <button key={movie.slug} onClick={() => setActiveSlide(index)} className={`h-2 w-8 rounded-full transition ${index === activeSlide ? 'bg-orange-400' : 'bg-white/40'}`} />)}</div>

          <h1 className="text-5xl font-bold">Toujours à l'affiche</h1>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredMovies.map((movie) => (
              <article key={movie.slug} className="relative space-y-3 rounded-lg border border-white/10 bg-[#041743] p-3">
                <div className="absolute right-3 top-3 z-10"><FavoriteButton itemId={movie.slug} itemType="movie" payload={{ slug: movie.slug, title: movie.title, image: movie.image, route: `/ma-fr/cinema/${movie.slug}` }} /></div>
                <Link to={`/ma-fr/cinema/${movie.slug}`}><img src={movie.image} alt={movie.title} className="h-72 w-full rounded-md object-cover" /></Link>
                <h2 className="font-semibold">{movie.title}</h2>
                <p className="text-sm text-slate-300">Durée: {movie.duration || 'Non renseignée'}</p>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#0f295f] px-3 py-1 text-xs">{movie.genre || 'Cinéma'}</span>
                  <Link to={`/ma-fr/cinema/${movie.slug}`} className="rounded-full border border-white/50 px-4 py-1 text-xs">Les séances</Link>
                </div>
              </article>
            ))}
          </div>
          {filteredMovies.length === 0 && <div className="rounded-2xl border border-white/10 bg-[#041743] p-8 text-center text-slate-300">Aucun film ne correspond à vos filtres.</div>}
        </>
      )}
    </section>
  );
}
