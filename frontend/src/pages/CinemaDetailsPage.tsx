import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import { movies } from '../services/platformData';
import { useCart } from '../contexts/CartContext';
import { uid } from '../services/commerce/utils';
import FavoriteButton from '../components/FavoriteButton';
import SharePopover from '../components/SharePopover';

const dates = ['Aujourd’hui', 'Demain', 'Vendredi', 'Samedi'];

const sessionsByDate: Record<string, Array<{ cinema: string; city: string; version: string; hours: string[] }>> = {
  'Aujourd’hui': [{ cinema: 'Mégarama Casablanca', city: 'Casablanca', version: 'VF · IMAX', hours: ['14:00', '17:30', '21:00'] }],
  Demain: [{ cinema: 'Pathé Rabat', city: 'Rabat', version: 'VO STFR', hours: ['13:30', '19:00', '22:15'] }],
  Vendredi: [{ cinema: 'CineAtlas Marrakech', city: 'Marrakech', version: 'VF', hours: ['16:00', '20:45'] }],
  Samedi: [{ cinema: 'Mégarama Casablanca', city: 'Casablanca', version: 'VO STFR', hours: ['12:00', '18:00'] }]
};

export default function CinemaDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const movie = movies.find((item) => item.slug === slug);
  const { addItems } = useCart();
  const navigate = useNavigate();
  const [activeDate, setActiveDate] = useState(dates[0]);

  const sessions = useMemo(() => {
    const cityFilter = (searchParams.get('city') ?? '').toLowerCase();
    return (sessionsByDate[activeDate] ?? []).filter((session) => !cityFilter || session.city.toLowerCase().includes(cityFilter));
  }, [activeDate, searchParams]);

  if (!movie) return <p>Film introuvable.</p>;

  const reserveSession = (hour: string, cinema: string, city: string): void => {
    addItems([{ id: uid('cart'), productType: 'movie_ticket', slug: movie.slug, title: `${movie.title} (${hour})`, image: movie.image, date: `${activeDate} ${hour}`, location: `${cinema}, ${city}`, quantity: 1, unitPrice: 70, subtotal: 70 }]);
    navigate('/ma-fr/panier');
  };

  return (
    <section className="space-y-6">
      <ServiceTabs active="cinema" />
      <p className="text-sm text-slate-400">Accueil / Cinéma / {movie.title}</p>
      <div className="grid gap-6 lg:grid-cols-[0.6fr_1fr]">
        <img src={movie.image} alt={movie.title} className="h-[560px] w-full rounded-2xl object-cover" />
        <article className="rounded-2xl border border-white/10 bg-[#041743] p-6">
          <div className="mb-3 flex items-center justify-end gap-2"><SharePopover title={movie.title} /><FavoriteButton itemId={movie.slug} itemType="movie" payload={{ slug: movie.slug, title: movie.title, image: movie.image, route: `/ma-fr/cinema/${movie.slug}` }} /></div><h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="mt-2 text-slate-300">Genre: {movie.genre} · Durée: {movie.duration} · Âge: +12</p>
          <p className="mt-4 text-sm text-slate-300">Un thriller immersif au rythme soutenu, avec une photographie soignée et une bande-son intense.</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <p><strong>Réalisateur:</strong> A. Benyamina</p>
            <p><strong>Acteurs:</strong> L. Tahiri, M. Idrissi</p>
            <p><strong>Date de sortie:</strong> 15 Avril 2026</p>
            <p><strong>Langue:</strong> VF / VO STFR</p>
          </div>
        </article>
      </div>

      <div className="flex gap-2 overflow-x-auto">{dates.map((date) => <button key={date} onClick={() => setActiveDate(date)} className={`rounded-full px-4 py-2 text-sm ${activeDate === date ? 'bg-white text-[#041743]' : 'bg-white/10'}`}>{date}</button>)}</div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <article key={session.cinema} className="rounded-2xl border border-white/10 bg-[#041743] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">{session.cinema}</h3>
                <p className="text-sm text-slate-300">{session.city} · {session.version}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{session.hours.map((hour) => <button key={hour} onClick={() => reserveSession(hour, session.cinema, session.city)} className="rounded-full border border-white/20 px-4 py-1 text-sm hover:bg-white/10">{hour}</button>)}</div>
          </article>
        ))}
      </div>
      {sessions.length === 0 && <div className="rounded-2xl border border-white/10 bg-[#041743] p-6 text-center text-slate-300">Pas de séances disponibles pour cette date/ville.</div>}
      <Link to="/ma-fr/panier" className="inline-flex rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Continuer vers réservation</Link>
    </section>
  );
}
