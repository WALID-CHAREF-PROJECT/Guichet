import { Link } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import { movies } from '../services/platformData';

export default function CinemaPage(): JSX.Element {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <ServiceTabs active="cinema" />
        <div className="flex w-full items-center gap-2 rounded-full border border-white/15 bg-[#102249] px-4 py-2 text-sm text-slate-200 xl:w-[390px]">
          <span>🔎</span><input className="w-full bg-transparent outline-none placeholder:text-slate-400" placeholder="Rechercher un film" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {movies.map((movie) => <Link key={movie.id} to={`/ma-fr/cinema/${movie.slug}`} className="block"><img src={movie.image} alt={movie.title} className="h-80 w-full rounded-lg object-cover" /></Link>)}
      </div>

      <div className="flex justify-center gap-2">{[0, 1, 2].map((dot) => <span key={dot} className={`h-1.5 w-8 rounded-full ${dot === 1 ? 'bg-orange-400' : 'bg-white/40'}`} />)}</div>

      <h1 className="text-5xl font-bold">Toujours à l'affiche</h1>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {movies.map((movie) => (
          <article key={movie.slug} className="space-y-3 rounded-lg border border-white/10 bg-[#041743] p-3">
            <img src={movie.image} alt={movie.title} className="h-72 w-full rounded-md object-cover" />
            <h2 className="font-semibold">{movie.title}</h2>
            <p className="text-sm text-slate-300">Durée: {movie.duration}</p>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#0f295f] px-3 py-1 text-xs">{movie.genre}</span>
              <Link to={`/ma-fr/cinema/${movie.slug}`} className="rounded-full border border-white/50 px-4 py-1 text-xs">Les séances</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
