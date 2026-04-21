import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import { movies } from '../services/platformData';
import { useCart } from '../contexts/CartContext';
import { uid } from '../services/commerce/utils';

const dates = ['Aujourd’hui', 'Demain', 'Vendredi', 'Samedi'];

const sessionsByDate: Record<string, Array<{ cinema: string; city: string; hours: string[] }>> = {
  'Aujourd’hui': [{ cinema: 'Mégarama Casablanca', city: 'Casablanca', hours: ['14:00', '17:30', '21:00'] }],
  Demain: [{ cinema: 'Pathé Rabat', city: 'Rabat', hours: ['13:30', '19:00', '22:15'] }],
  Vendredi: [{ cinema: 'CineAtlas Marrakech', city: 'Marrakech', hours: ['16:00', '20:45'] }],
  Samedi: [{ cinema: 'Mégarama Casablanca', city: 'Casablanca', hours: ['12:00', '18:00'] }]
};

export default function CinemaDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const movie = movies.find((item) => item.slug === slug);
  const { addItems } = useCart();
  const [activeDate, setActiveDate] = useState(dates[0]);

  const sessions = useMemo(() => sessionsByDate[activeDate] ?? [], [activeDate]);

  if (!movie) return <p>Film introuvable.</p>;

  return (
    <section className="space-y-6">
      <ServiceTabs active="cinema" />
      <p className="text-sm text-slate-400">Cinéma / {movie.title}</p>
      <div className="grid gap-6 lg:grid-cols-[0.7fr_1fr]">
        <img src={movie.image} alt={movie.title} className="h-[520px] w-full rounded-2xl object-cover" />
        <article className="rounded-2xl border border-white/10 bg-[#041743] p-6">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="mt-3 text-slate-300">Genre: {movie.genre}</p>
          <p className="text-slate-300">Durée: {movie.duration}</p>
          <p className="text-slate-300">Âge: +12</p>
          <p className="mt-4 text-sm text-slate-300">Synopsis premium du film, casting principal et date de sortie.</p>
        </article>
      </div>

      <div className="flex gap-2 overflow-x-auto">{dates.map((date) => <button key={date} onClick={() => setActiveDate(date)} className={`rounded-full px-4 py-2 text-sm ${activeDate === date ? 'bg-white text-[#041743]' : 'bg-white/10'}`}>{date}</button>)}</div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <article key={session.cinema} className="rounded-2xl border border-white/10 bg-[#041743] p-4">
            <h3 className="font-semibold">{session.cinema}</h3>
            <p className="text-sm text-slate-300">{session.city}</p>
            <div className="mt-3 flex flex-wrap gap-2">{session.hours.map((hour) => <button key={hour} onClick={() => addItems([{ id: uid('cart'), productType: 'movie_ticket', slug: movie.slug, title: `${movie.title} (${hour})`, image: movie.image, date: `${activeDate} ${hour}`, location: `${session.cinema}, ${session.city}`, quantity: 1, unitPrice: 70, subtotal: 70 }])} className="rounded-full border border-white/20 px-4 py-1 text-sm">{hour}</button>)}</div>
          </article>
        ))}
      </div>
      <Link to="/ma-fr/panier" className="inline-flex rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Continuer vers réservation</Link>
    </section>
  );
}
