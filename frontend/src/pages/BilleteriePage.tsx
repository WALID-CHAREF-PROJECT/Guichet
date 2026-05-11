import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import CategoryStrip from '../components/CategoryStrip';
import PlatformTopNav from '../components/PlatformTopNav';
import FavoriteButton from '../components/FavoriteButton';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ResponsiveImage from '../components/ResponsiveImage';
import { getPublicEvents } from '../services/publicApi';
import { EventItem } from '../types/api';

type DateFilter = 'today' | 'week' | 'weekend' | 'month';

type LoadState = 'loading' | 'ready' | 'error';

function eventDate(event: EventItem): string {
  return event.date ?? event.starts_at_human?.split(' ')[0] ?? '';
}

function eventTime(event: EventItem): string {
  return event.time ?? event.starts_at_human?.split(' ').slice(1).join(' ') ?? '';
}

function eventLocation(event: EventItem): string {
  return event.location ?? [event.venue, event.city?.name].filter(Boolean).join(' · ');
}

function FeaturedPosterCard({ event }: { event: EventItem }): JSX.Element {
  return (
    <Link to={`/ma-fr/event/${event.slug}`} className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#07183f] text-left shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-white/25">
      <ResponsiveImage src={event.image_url} alt={event.title} aspect="video" loading="eager" className="max-h-[420px] min-h-[240px] md:min-h-[340px]" imgClassName="transition-all duration-500 group-hover:scale-105" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4"><h3 className="line-clamp-2 text-lg font-semibold text-white">{event.title}</h3></div>
    </Link>
  );
}

function EventCard({ event, compact = false }: { event: EventItem; compact?: boolean }): JSX.Element {
  const location = eventLocation(event);
  const date = eventDate(event);
  const time = eventTime(event);
  const price = event.is_free ? 'Gratuit' : `${event.price_mad} MAD`;

  return (
    <Link to={`/ma-fr/event/${event.slug}`} className={`group relative ${compact ? 'w-[230px] shrink-0' : ''} rounded-2xl border border-white/10 bg-[#071b45] p-3 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30`}>
      <div className="absolute right-3 top-3 z-10" onClick={(clickEvent) => clickEvent.preventDefault()}><FavoriteButton itemId={event.slug} itemType="event" payload={{ slug: event.slug, title: event.title, image: event.image_url, location, date: `${date} · ${time}`, route: `/ma-fr/event/${event.slug}`, organizer: event.organizer }} /></div>
      <div className="mb-3 flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10244f] text-xs">🎫</span><span className="line-clamp-1 text-xs font-medium text-slate-200">{event.organizer}</span></div>
      <ResponsiveImage src={event.image_url} alt={event.title} aspect="video" loading="lazy" className="rounded-xl" imgClassName="transition-all duration-500 group-hover:scale-105" />
      <h3 className="mt-3 text-sm font-semibold leading-snug text-white line-clamp-2">{event.title}</h3>
      <p className="mt-2 text-xs text-slate-300">📍 {location}</p>
      <p className="mt-1 text-xs text-slate-300">📅 {date} {time ? `· ${time}` : ''}</p>
      <div className="mt-3 inline-flex rounded-full bg-[#10244f] px-3 py-1 text-xs font-semibold text-white">{price}</div>
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
  const [events, setEvents] = useState<EventItem[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState('');

  const load = (): void => {
    setState('loading');
    getPublicEvents({ type: 'event', q: searchParams.get('q') ?? undefined })
      .then((payload) => { setEvents(payload.data); setState('ready'); setError(''); })
      .catch((err: unknown) => { setError(err instanceof Error ? err.message : 'Erreur de chargement'); setState('error'); });
  };

  useEffect(load, [searchParams]);

  useEffect(() => {
    setSelectedTag(searchParams.get('category') ?? '');
    setSelectedCity(searchParams.get('city') ?? '');
    setHour(searchParams.get('hour') ?? '');
    setCalendarDate(searchParams.get('date') ?? '');
    setActiveDateFilter((searchParams.get('preset') as DateFilter) ?? 'week');
  }, [searchParams]);

  const filteredEvents = useMemo(() => events
    .filter((event) => (!selectedTag || event.category?.slug === selectedTag || event.type === selectedTag) && (!selectedCity || eventLocation(event).toLowerCase().includes(selectedCity.toLowerCase())))
    .filter((event) => (!hour || (hour === 'Soir' ? Number(eventTime(event).split(':')[0]) >= 18 : hour === 'Matin' ? Number(eventTime(event).split(':')[0]) < 12 : Number(eventTime(event).split(':')[0]) >= 12 && Number(eventTime(event).split(':')[0]) < 18)))
    .filter((event) => !calendarDate || eventDate(event) === calendarDate), [events, selectedTag, selectedCity, hour, calendarDate]);

  const featured = filteredEvents.filter((event) => event.featured).slice(0, 4);
  const heroEvents = featured.length > 0 ? featured : filteredEvents.slice(0, 4);
  const categoryOptions = Array.from(new Map(events.map((event) => [event.category?.slug, event.category]).filter(([slug]) => Boolean(slug)) as Array<[string, EventItem['category']]>).values());

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

      {state === 'loading' && <section className="mx-auto max-w-[1800px] px-4 py-8 lg:px-8"><LoadingSkeleton label="Chargement des événements..." /></section>}
      {state === 'error' && <section className="mx-auto max-w-[900px] px-4 py-16"><EmptyState title="Impossible de charger les événements." description={error} action={<button onClick={load} className="rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button>} /></section>}
      {state === 'ready' && filteredEvents.length === 0 && <section className="mx-auto max-w-[900px] px-4 py-16"><EmptyState title="Aucun événement publié ne correspond à ces filtres." /></section>}

      {state === 'ready' && filteredEvents.length > 0 && (
        <>
          <section className="mx-auto max-w-[1800px] px-4 pt-7 lg:px-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">{heroEvents.map((event) => <FeaturedPosterCard key={event.slug} event={event} />)}</div>
          </section>
          <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-5 border-b border-white/10 pb-2 pt-5 text-sm md:text-base">{tabs.map((tab) => <button key={tab.key} onClick={() => setActiveDateFilter(tab.key)} className={`relative pb-2 ${activeDateFilter === tab.key ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}>{tab.label}</button>)}</div>
          <section className="mx-auto max-w-[1800px] px-4 pt-7 lg:px-8"><div className="flex gap-4 overflow-x-auto pb-2">{filteredEvents.map((event) => <EventCard key={`strip-${event.id}`} event={event} compact />)}</div></section>
          <section className="mx-auto max-w-[1800px] px-4 pb-12 pt-9 lg:px-8"><div className="mb-6 border-t border-white/10 pt-6"><h2 className="text-3xl font-bold text-white">Tous les événements</h2></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{filteredEvents.map((event) => <EventCard key={`grid-${event.id}`} event={event} />)}</div></section>
        </>
      )}

      {filterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setFilterOpen(false)}>
          <aside className="ml-auto h-full w-[360px] bg-[#041743] p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">Filtres</h3>
            <label className="mt-3 block text-sm">Catégories<select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="mt-1 w-full rounded-xl border border-white/20 bg-[#0b275c] p-2"><option value="">Toutes</option>{categoryOptions.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label>
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
