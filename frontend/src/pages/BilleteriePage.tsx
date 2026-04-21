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
  'Jeune Public'
];

export default function BilleteriePage(): JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getEvents({ sort: 'date_asc' })
      .then((response) => setEvents(response.data.slice(0, 10)))
      .finally(() => setLoading(false));
  }, []);

  const slidersDots = useMemo(
    () => Array.from({ length: Math.min(events.length, 5) }, (_, index) => index),
    [events.length]
  );

  const handleSliderScroll = (): void => {
    if (!sliderRef.current) return;
    const cardWidth = 330;
    const nextIndex = Math.round(sliderRef.current.scrollLeft / cardWidth);
    setActiveIndex(nextIndex % Math.max(1, slidersDots.length));
  };

  return (
    <div className="-mx-4 space-y-6 lg:-mx-8">
      <section className="border-y border-white/10 bg-[#031844] py-4">
        <div className="mx-auto max-w-[1700px] px-4 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 text-xl font-semibold text-white">
            {ticketGenres.map((genre) => (
              <button key={genre} className="flex shrink-0 items-center gap-3 rounded-full px-3 py-1 hover:bg-white/10">
                <span className="text-base">•</span>
                <span className="whitespace-nowrap">{genre}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1700px] px-4 pb-6 lg:px-8">
        {loading && <p className="text-slate-300">Chargement des affiches...</p>}
        {!loading && events.length === 0 && <p className="text-slate-300">Aucune affiche pour le moment.</p>}

        {!loading && events.length > 0 && (
          <>
            <div
              ref={sliderRef}
              onScroll={handleSliderScroll}
              className="flex snap-x gap-4 overflow-x-auto pb-3"
            >
              {events.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className="group relative h-[560px] min-w-[300px] snap-start overflow-hidden rounded-xl border border-white/10 bg-[#041743] md:min-w-[320px]"
                >
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="line-clamp-2 text-xl font-bold text-white">{event.title}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {slidersDots.map((dot) => (
                <span
                  key={dot}
                  className={`h-1.5 w-10 rounded-full ${activeIndex === dot ? 'bg-orange-500' : 'bg-white/70'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
