import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/api';
import { EventItem } from '../types/api';

const ticketGenres = [
  'COMEDIABLANCA',
  'La Basketball Africa League (BAL)',
  'NOSTALGIA LOVERS FESTIVAL',
  'Concerts',
  'Festivals',
  'Théâtre & Humour',
  'Divertissement',
  'Jeune Public',
  'Salons & Formation',
  'Sports'
];

export default function BilleteriePage(): JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getEvents({ sort: 'date_asc' })
      .then((response) => setEvents(response.data))
      .finally(() => setLoading(false));
  }, []);

  const heroEvents = useMemo(() => events.slice(0, 4), [events]);
  const spotlightEvents = useMemo(() => events.slice(0, 12), [events]);
  const allEventRows = useMemo(() => events.slice(2, 14), [events]);

  const slidersDots = useMemo(
    () => Array.from({ length: Math.min(heroEvents.length, 4) }, (_, index) => index),
    [heroEvents.length]
  );

  const handleSliderScroll = (): void => {
    if (!sliderRef.current) return;
    const cardWidth = 360;
    const nextIndex = Math.round(sliderRef.current.scrollLeft / cardWidth);
    setActiveIndex(nextIndex % Math.max(1, slidersDots.length));
  };

  return (
    <div className="-mx-4 space-y-7 lg:-mx-8">
      <section className="border-y border-white/10 bg-[#031844] py-4">
        <div className="mx-auto max-w-[1900px] px-4 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 text-sm font-semibold text-white">
            {ticketGenres.map((genre) => (
              <button key={genre} className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 hover:bg-white/10">
                <span className="text-[10px]">◉</span>
                <span className="whitespace-nowrap">{genre}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1900px] px-4 lg:px-8">
        {loading && <p className="text-slate-300">Chargement des affiches...</p>}
        {!loading && events.length === 0 && <p className="text-slate-300">Aucune affiche pour le moment.</p>}

        {!loading && events.length > 0 && (
          <>
            <div
              ref={sliderRef}
              onScroll={handleSliderScroll}
              className="grid gap-4 overflow-x-auto pb-3 md:grid-cols-2 xl:grid-cols-4"
            >
              {heroEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="group relative h-[520px] min-w-[320px] overflow-hidden rounded-md border border-white/15 bg-[#041743]"
                >
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#020b22] via-[#020b22]/70 to-transparent p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-300">{event.organizer}</p>
                    <p className="line-clamp-2 text-xl font-bold text-white">{event.title}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              {slidersDots.map((dot) => (
                <span
                  key={dot}
                  className={`h-1.5 w-8 rounded-full ${activeIndex === dot ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
              {spotlightEvents.map((event) => (
                <Link
                  key={`spotlight-${event.id}`}
                  to={`/events/${event.slug}`}
                  className="w-[170px] shrink-0 rounded-md border border-white/10 bg-[#041743] p-2"
                >
                  <img src={event.image_url} alt={event.title} className="h-24 w-full rounded object-cover" />
                  <p className="mt-2 line-clamp-2 text-xs font-semibold text-white">{event.title}</p>
                  <p className="mt-1 text-[11px] text-slate-300">{event.starts_at_human}</p>
                  <p className="mt-1 text-xs font-bold text-orange-300">{event.is_free ? 'Gratuit' : `${event.price_mad} MAD`}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {!loading && allEventRows.length > 0 && (
        <section className="mx-auto max-w-[1900px] space-y-4 px-4 pb-8 lg:px-8">
          <h2 className="text-3xl font-bold text-white">Tous les événements</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {allEventRows.map((event) => (
              <Link
                key={`all-${event.id}`}
                to={`/events/${event.slug}`}
                className="group overflow-hidden rounded-md border border-white/10 bg-[#041743]"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1 p-3">
                  <p className="text-[11px] uppercase text-slate-400">{event.category.name}</p>
                  <p className="line-clamp-2 text-sm font-semibold text-white">{event.title}</p>
                  <p className="text-xs text-slate-300">{event.city.name} · {event.venue}</p>
                  <p className="text-xs text-slate-300">{event.starts_at_human}</p>
                  <p className="pt-1 text-sm font-bold text-orange-300">{event.is_free ? 'Gratuit' : `${event.price_mad} MAD`}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
