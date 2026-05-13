import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import { useCart } from '../contexts/CartContext';
import { formatMad, uid } from '../services/commerce/utils';
import FavoriteButton from '../components/FavoriteButton';
import SharePopover from '../components/SharePopover';
import ResponsiveImage from '../components/ResponsiveImage';
import EmptyState from '../components/EmptyState';
import { CinemaSeat, getMovieSessions, getPublicMovie, MovieSession, PublicMovie } from '../services/publicApi';
import PlanModal from '../components/plans/PlanModal';
import CinemaSeatMap, { SelectedSeatSummary } from '../components/plans/CinemaSeatMap';

const fallbackDates = ['Aujourd’hui', 'Demain', 'Vendredi', 'Samedi'];

export default function CinemaDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const [searchParams] = useSearchParams();
  const { addItems } = useCart();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<PublicMovie | null>(null);
  const [sessions, setSessions] = useState<MovieSession[]>([]);
  const [activeDate, setActiveDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seatSession, setSeatSession] = useState<MovieSession | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<CinemaSeat[]>([]);

  const load = (): void => {
    setLoading(true);
    Promise.all([getPublicMovie(slug), getMovieSessions(slug)])
      .then(([movieItem, sessionItems]) => {
        setMovie(movieItem);
        setSessions(sessionItems);
        setActiveDate(sessionItems[0]?.session_date ?? fallbackDates[0]);
        setError('');
      })
      .catch((err: unknown) => { setMovie(null); setError(err instanceof Error ? err.message : 'Film introuvable.'); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [slug]);

  const dates = useMemo(() => {
    const apiDates = Array.from(new Set(sessions.map((session) => session.session_date).filter(Boolean)));
    return apiDates.length > 0 ? apiDates : fallbackDates;
  }, [sessions]);

  const visibleSessions = useMemo(() => {
    const cityFilter = (searchParams.get('city') ?? '').toLowerCase();
    return sessions.filter((session) => session.session_date === activeDate).filter((session) => !cityFilter || (session.city ?? '').toLowerCase().includes(cityFilter));
  }, [activeDate, searchParams, sessions]);

  if (loading || error || !movie) return <section className="space-y-6"><ServiceTabs active="cinema" />{loading ? <p>Chargement du film...</p> : <div className="rounded-2xl border border-white/10 bg-[#041743] p-6"><p>{error || 'Film introuvable.'}</p><button onClick={load} className="mt-4 rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button></div>}</section>;

  const reserveSession = (session: MovieSession): void => {
    const price = Number(session.price || 70);
    addItems([{ id: uid('cart'), productType: 'movie_ticket', slug: movie.slug, productId: movie.id, movieId: movie.id, movieTitle: movie.title, sessionId: String(session.id), sessionDateTime: `${session.session_date} ${session.session_time}`, title: `${movie.title} (${session.session_time})`, image: movie.image, date: `${session.session_date} ${session.session_time}`, location: `${session.cinema ?? 'Cinéma'}, ${session.city ?? ''}`, hallName: session.hallName, quantity: 1, unitPrice: price, subtotal: price }]);
    navigate('/ma-fr/panier');
  };

  const openSeatMap = (session: MovieSession): void => {
    setSeatSession(session);
    setSelectedSeats([]);
  };

  const toggleSeat = (seat: CinemaSeat): void => {
    setSelectedSeats((current) => current.some((item) => item.id === seat.id) ? current.filter((item) => item.id !== seat.id) : [...current, seat]);
  };

  const addSelectedSeats = (): void => {
    if (!seatSession || selectedSeats.length === 0) return;
    const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    const seatCodes = selectedSeats.map((seat) => `${seat.row}${seat.number}`);
    addItems([{ id: uid('cart'), productType: 'movie_ticket', slug: movie.slug, productId: movie.id, movieId: movie.id, movieTitle: movie.title, sessionId: String(seatSession.id), sessionDateTime: `${seatSession.session_date} ${seatSession.session_time}`, title: `${movie.title} · sièges ${seatCodes.join(', ')}`, image: movie.image, date: `${seatSession.session_date} ${seatSession.session_time}`, location: `${seatSession.cinema ?? 'Cinéma'}, ${seatSession.city ?? ''}`, hallName: seatSession.hallName ?? seatSession.hall_name, ticketType: 'Sièges cinéma', selectedSeats: seatCodes, cinemaSeats: selectedSeats.map((seat) => ({ row: seat.row, number: seat.number, category: seat.category, price: seat.price })), planType: 'cinema', quantity: selectedSeats.length, unitPrice: selectedSeats.length > 0 ? subtotal / selectedSeats.length : 0, subtotal }]);
    setSeatSession(null);
    setSelectedSeats([]);
    navigate('/ma-fr/panier');
  };

  return (
    <section className="space-y-6">
      <ServiceTabs active="cinema" />
      <p className="text-sm text-slate-400">Accueil / Cinéma / {movie.title}</p>
      <div className="grid gap-6 lg:grid-cols-[0.55fr_1fr]">
        <ResponsiveImage src={movie.image} alt={movie.title} aspect="poster" loading="eager" className="max-h-[520px] rounded-2xl" />
        <article className="rounded-2xl border border-white/10 bg-[#041743] p-6">
          <div className="mb-3 flex items-center justify-end gap-2"><SharePopover title={movie.title} /><FavoriteButton itemId={movie.slug} itemType="movie" payload={{ slug: movie.slug, title: movie.title, image: movie.image, route: `/ma-fr/cinema/${movie.slug}` }} /></div><h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="mt-2 text-slate-300">Genre: {movie.genre || 'Cinéma'} · Durée: {movie.duration || 'Non renseignée'}</p>
          <p className="mt-4 text-sm text-slate-300">{movie.description || 'Synopsis à venir.'}</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <p><strong>Date de sortie:</strong> {movie.releaseDate || 'Non renseignée'}</p>
          </div>
          <a href="#seances" className="mt-6 inline-flex rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Voir les séances</a>
        </article>
      </div>

      <div id="seances" className="flex scroll-mt-6 gap-2 overflow-x-auto">{dates.map((date) => <button key={date} onClick={() => setActiveDate(date)} className={`rounded-full px-4 py-2 text-sm ${activeDate === date ? 'bg-white text-[#041743]' : 'bg-white/10'}`}>{date}</button>)}</div>

      <div className="space-y-4">
        {visibleSessions.map((session) => (
          <article key={String(session.id)} className="rounded-2xl border border-white/10 bg-[#041743] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold">{session.cinema ?? 'Cinéma'} · {session.session_time}</h3>
                <p className="text-sm text-slate-300">{session.city ?? 'Ville à confirmer'} · {session.hallName ?? 'Salle 1'} · {formatMad(Number(session.price || 0))}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{session.seatingEnabled ? <button onClick={() => openSeatMap(session)} className="rounded-full bg-white px-4 py-1 text-sm font-semibold text-[#041743]">Choisir mes sièges</button> : <button onClick={() => reserveSession(session)} className="rounded-full border border-white/20 px-4 py-1 text-sm hover:bg-white/10">Réserver · {session.session_time}</button>}</div>
          </article>
        ))}
      </div>
      {visibleSessions.length === 0 && <EmptyState title="Pas de séances disponibles pour cette date/ville." />}
      <Link to="/ma-fr/panier" className="inline-flex rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Continuer vers réservation</Link>
      <PlanModal open={Boolean(seatSession)} onClose={() => setSeatSession(null)} eyebrow={movie.title} title="Plan cinéma" helper={seatSession ? `${seatSession.cinema ?? 'Cinéma'} · ${seatSession.hallName ?? 'Salle 1'} · ${seatSession.session_date} ${seatSession.session_time}` : ''}>
        {seatSession && <CinemaSeatMap session={seatSession} selectedSeats={selectedSeats.map((seat) => seat.id)} onToggleSeat={toggleSeat} />}
        {seatSession && <div className="mt-5"><SelectedSeatSummary movieTitle={movie.title} session={seatSession} selectedSeats={selectedSeats} onAddToCart={addSelectedSeats} /></div>}
      </PlanModal>
    </section>
  );
}
