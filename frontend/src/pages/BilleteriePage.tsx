import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CategoryStrip from '../components/CategoryStrip';
import PlatformTopNav from '../components/PlatformTopNav';
import { eventTags, featuredPosters, platformEvents } from '../services/platformData';
import FavoriteButton from '../components/FavoriteButton';

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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4"><h3 className="line-clamp-2 text-lg font-semibold text-white">{title}</h3></div>
    </Link>
  );
}

function EventCard({ event, compact = false }: { event: (typeof platformEvents)[number]; compact?: boolean }): JSX.Element {
  return (
    <Link to={`/ma-fr/event/${event.slug}`} className={`group relative ${compact ? 'w-[230px] shrink-0' : ''} rounded-2xl border border-white/10 bg-[#071b45] p-3 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30`}>
      <div className="absolute right-3 top-3 z-10"><FavoriteButton itemId={event.slug} itemType="event" payload={{ slug: event.slug, title: event.title, image: event.image, location: event.location, date: `${event.date} · ${event.time}`, route: `/ma-fr/event/${event.slug}`, organizer: event.organizer }} /></div>
      <div className="mb-3 flex items-center gap-2"><img src={event.organizerLogo} alt={event.organizer} className="h-7 w-7 rounded-full object-cover" /><span className="line-clamp-1 text-xs font-medium text-slate-200">{event.organizer}</span></div>
      <div className="overflow-hidden rounded-xl"><img src={event.image} alt={event.title} className={`${compact ? 'h-64' : 'h-72'} w-full object-cover transition-all duration-500 group-hover:scale-105`} /></div>
      <h3 className="mt-3 text-sm font-semibold leading-snug text-white line-clamp-2">{event.title}</h3>
      <p className="mt-2 text-xs text-slate-300">📍 {event.location}</p>
      <p className="mt-1 text-xs text-slate-300">📅 {event.date} · {event.time}</p>
      <div className="mt-3 inline-flex rounded-full bg-[#10244f] px-3 py-1 text-xs font-semibold text-white">{event.price}</div>
    </Link>
  );
}

export default function TicketingHomePage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(searchParams.get('category') ?? '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') ?? '');
  const [hour, setHour] = useState(searchParams.get('hour') ?? '');
  const [calendarDate, setCalendarDate] = useState(searchParams.get('date') ?? '');
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilter>((searchParams.get('preset') as DateFilter) ?? 'week');

  useEffect(() => {
    setSelectedTag(searchParams.get('category') ?? '');
    setSelectedCity(searchParams.get('city') ?? '');
    setHour(searchParams.get('hour') ?? '');
    setCalendarDate(searchParams.get('date') ?? '');
    setActiveDateFilter((searchParams.get('preset') as DateFilter) ?? 'week');
  }, [searchParams]);

  const filteredEvents = useMemo(() => {
    const ids = filterMap[activeDateFilter] ?? platformEvents.map((event) => event.id);
    return platformEvents
      .filter((event) => ids.includes(event.id))
      .filter((event) => (!selectedTag || event.tags.includes(selectedTag)) && (!selectedCity || event.location.toLowerCase().includes(selectedCity.toLowerCase())))
      .filter((event) => (!hour || (hour === 'Soir' ? Number(event.time.split(':')[0]) >= 18 : hour === 'Matin' ? Number(event.time.split(':')[0]) < 12 : Number(event.time.split(':')[0]) >= 12 && Number(event.time.split(':')[0]) < 18)))
      .filter((event) => {
        if (!calendarDate) return true;
        const normalized = new Date(event.date.replace(/Avril/g, 'April').replace(/Mai/g, 'May').replace(/Juin/g, 'June') + ' 2026');
        const eventIso = Number.isNaN(normalized.getTime()) ? '' : normalized.toISOString().slice(0, 10);
        return eventIso === calendarDate;
      })
      .filter((event) => {
        const query = (searchParams.get('q') ?? '').trim().toLowerCase();
        return !query || event.title.toLowerCase().includes(query) || event.location.toLowerCase().includes(query);
      });
  }, [activeDateFilter, selectedTag, selectedCity, hour, calendarDate, searchParams]);

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
      <section className="mx-auto flex max-w-[1800px] justify-end px-4 pt-4 lg:px-8"><button onClick={() => setFilterOpen(true)} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">Filtres</button></section>

      <section className="mx-auto max-w-[1800px] px-4 pt-7 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">{featuredPosters.map((poster) => { const event = platformEvents.find((item) => item.slug === poster.eventSlug); if (!event) return null; return <FeaturedPosterCard key={event.slug} image={poster.image} slug={event.slug} title={event.title} />; })}</div>
      </section>

      <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-5 border-b border-white/10 pb-2 pt-5 text-sm md:text-base">{tabs.map((tab) => <button key={tab.key} onClick={() => setActiveDateFilter(tab.key)} className={`relative pb-2 ${activeDateFilter === tab.key ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>{tab.label}</button>)}</div>
      <section className="mx-auto max-w-[1800px] px-4 pt-7 lg:px-8"><div className="flex gap-4 overflow-x-auto pb-2">{filteredEvents.map((event) => <EventCard key={`strip-${event.id}`} event={event} compact />)}</div></section>
      <section className="mx-auto max-w-[1800px] px-4 pb-12 pt-9 lg:px-8"><div className="mb-6 border-t border-white/10 pt-6"><h2 className="text-3xl font-bold text-white">Tous les événements</h2></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{filteredEvents.map((event) => <EventCard key={`grid-${event.id}`} event={event} />)}</div></section>

      {filterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setFilterOpen(false)}>
          <aside className="ml-auto h-full w-[360px] bg-[#041743] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Filtres</h3>
            <label className="mt-3 block text-sm">Catégories<select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0b275c] p-2"><option value="">Toutes</option>{eventTags.map((tag) => <option key={tag.id} value={tag.id}>{tag.label}</option>)}</select></label>
            <label className="mt-3 block text-sm">Villes<select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0b275c] p-2"><option value="">Toutes</option><option>Casablanca</option><option>Rabat</option><option>Marrakech</option></select></label>
            <label className="mt-3 block text-sm">Heures<select value={hour} onChange={(e) => setHour(e.target.value)} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0b275c] p-2"><option value="">Tous créneaux</option><option>Matin</option><option>Après-midi</option><option>Soir</option></select></label>
            <label className="mt-3 block text-sm">Date spécifique<input type="date" value={calendarDate} onChange={(e) => setCalendarDate(e.target.value)} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0b275c] p-2" /></label>
            <div className="mt-4 flex flex-wrap gap-2">{tabs.map((tab) => <button key={tab.key} onClick={() => setActiveDateFilter(tab.key)} className="rounded-full border border-white/20 px-2 py-1 text-xs">{tab.label}</button>)}</div>
            <div className="mt-4 flex gap-2"><button onClick={() => { setSelectedTag(''); setSelectedCity(''); setHour(''); setCalendarDate(''); setActiveDateFilter('week'); }} className="flex-1 rounded border border-white/20 py-2">Réinitialiser</button><button onClick={() => setFilterOpen(false)} className="flex-1 rounded bg-white py-2 text-[#041743]">Appliquer</button></div>
          </aside>
        </div>
      )}
    </div>
  );
}
