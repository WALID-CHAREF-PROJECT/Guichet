import { Link, useParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import { movies } from '../services/platformData';

export default function CinemaDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const movie = movies.find((item) => item.slug === slug);

  if (!movie) return <p>Film introuvable.</p>;

  return (
    <section className="space-y-6">
      <ServiceTabs active="cinema" />
      <Link to="/ma-fr/cinema" className="text-sm text-slate-300">← Retour au cinéma</Link>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
        <img src={movie.image} alt={movie.title} className="h-[520px] w-full rounded-2xl object-cover" />
        <article className="rounded-2xl border border-white/10 bg-[#041743] p-6">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="mt-3 text-slate-300">Genre: {movie.genre}</p>
          <p className="text-slate-300">Durée: {movie.duration}</p>
          <p className="mt-6 text-sm text-slate-300">Les séances seront disponibles prochainement sur cette page.</p>
          <button className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-[#041743]">Être notifié</button>
        </article>
      </div>
    </section>
  );
}
