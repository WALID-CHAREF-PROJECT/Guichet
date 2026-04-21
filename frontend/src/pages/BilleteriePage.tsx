import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoryStrip from '../components/CategoryStrip';
import PlatformTopNav from '../components/PlatformTopNav';
import { featuredPosters, platformEvents } from '../services/platformData';

type DateFilter = 'today' | 'week' | 'weekend' | 'month';

const filterMap: Record<DateFilter, number[]> = {
  today: [1],
  week: [2, 3, 4, 6],
  weekend: [8, 9, 10],
  month: [5, 7]
};

function FeaturedPosterCard({ image, slug, title }: { image: string; slug: string; title: string }): JSX.Element {
  return (
    <Link to={`/ma-fr/event/${slug}`} className="group relative block h-[520px] w-full overflow-hidden rounded-2xl bg-[#07183f] text-left">
      <img src={image} alt={title} className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-white">{title}</h3>
      </div>
    </Link>
  );
}

function EventCard({ event, compact = false }: { event: (typeof platformEvents)[number]; compact?: boolean }): JSX.Element {
  return (
    <Link to={`/ma-fr/event/${event.slug}`} className={`group ${compact ? 'w-[230px] shrink-0' : ''} rounded-2xl border border-white/10 bg-[#071b45] p-3 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30`}>
      <div className="mb-3 flex items-center gap-2">
        <img src={event.organizerLogo} alt={event.organizer} className="h-7 w-7 rounded-full object-cover" />
        <span className="line-clamp-1 text-xs font-medium text-slate-200">{event.organizer}</span>
      </div>
      <div className="overflow-hidden rounded-xl">
        <img src={event.image} alt={event.title} className={`${compact ? 'h-64' : 'h-72'} w-full object-cover transition-all duration-500 group-hover:scale-105`} />
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-snug text-white line-clamp-2">{event.title}</h3>
      <p className="mt-2 text-xs text-slate-300">📍 {event.location}</p>
      <p className="mt-1 text-xs text-slate-300">📅 {event.date} · {event.time}</p>
      <div className="mt-3 inline-flex rounded-full bg-[#10244f] px-3 py-1 text-xs font-semibold text-white">{event.price}</div>
    </Link>
  );
}

export default function TicketingHomePage(): JSX.Element {
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilter>('week');

  const filteredEvents = useMemo(() => {
    const ids = filterMap[activeDateFilter];
    return platformEvents.filter((event) => ids.includes(event.id));
  }, [activeDateFilter]);

  const tabs: { key: DateFilter; label: string }[] = [
    { key: 'today', label: 'Aujourd’hui' },
    { key: 'week', label: 'Cette semaine' },
    { key: 'weekend', label: 'ce weekend' },
    { key: 'month', label: 'Ce mois-ci' }
  ];

  return (
    <div className="-mx-4 min-h-screen bg-[#020b22] text-white lg:-mx-8">
      <PlatformTopNav active="billeterie" />
      <CategoryStrip />

      <section className="mx-auto max-w-[1800px] px-4 pt-7 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {featuredPosters.map((poster) => {
            const event = platformEvents.find((item) => item.slug === poster.eventSlug);
            if (!event) return null;
            return <FeaturedPosterCard key={event.slug} image={poster.image} slug={event.slug} title={event.title} />;
          })}
        </div>
      </section>

      <div className="flex items-center justify-center gap-2 py-5">{[0, 1, 2, 3, 4].map((item) => <span key={item} className={`h-1.5 w-8 rounded-full ${item === 1 ? 'bg-orange-400' : 'bg-white/45'}`} />)}</div>

      <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-5 border-b border-white/10 pb-2 text-sm md:text-base">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveDateFilter(tab.key)} className={`relative pb-2 transition-all ${activeDateFilter === tab.key ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <section className="mx-auto max-w-[1800px] px-4 pt-7 lg:px-8">
        <div className="flex gap-4 overflow-x-auto pb-2">{filteredEvents.map((event) => <EventCard key={`strip-${event.id}`} event={event} compact />)}</div>
      </section>

      <section className="mx-auto max-w-[1800px] px-4 pb-12 pt-9 lg:px-8">
        <div className="mb-6 border-t border-white/10 pt-6"><h2 className="text-3xl font-bold text-white">Tous les événements</h2></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{filteredEvents.map((event) => <EventCard key={`grid-${event.id}`} event={event} />)}</div>
      </section>
    </div>
  );
}
