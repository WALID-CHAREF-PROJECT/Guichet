import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type DateFilter = 'today' | 'week' | 'weekend' | 'month';

type TicketEvent = {
  id: number;
  slug: string;
  organizer: string;
  organizerColor: string;
  title: string;
  location: string;
  dateLabel: string;
  time: string;
  price: string;
  category: string;
  image: string;
  dateTag: DateFilter;
};

const serviceMenu = [
  { label: 'Billeterie', icon: '🎫', active: true },
  { label: 'Store', icon: '🛍️', active: false },
  { label: 'Voyage', icon: '✈️', active: false },
  { label: 'Cinéma', icon: '🎬', active: false },
  { label: 'Sport', icon: '🏀', active: false }
];

const categories = [
  'COMEDIABLANCA',
  'La Basketball Africa League (BAL)',
  'NOSTALGIA LOVERS FESTIVAL',
  'Concerts',
  'Festivals',
  'Théâtre & Humour',
  'Divertissement',
  'Jeune Public',
  'Salon & formation',
  'Sport'
];

const featuredPosters = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
];

const events: TicketEvent[] = [
  {
    id: 1,
    slug: 'piaf-invites-heritiers',
    organizer: 'Association EDOM',
    organizerColor: 'from-cyan-400 to-blue-500',
    title: 'PIAF : Invités & Héritiers – La Comédie Musicale',
    location: 'Mégarama Casablanca',
    dateLabel: '21 Avril 2026',
    time: '20:30',
    price: '250,00 MAD',
    category: 'Théâtre & Humour',
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80',
    dateTag: 'today'
  },
  {
    id: 2,
    slug: 'magic-garden-light-festival',
    organizer: 'Magic Garden Light Festival',
    organizerColor: 'from-purple-400 to-pink-500',
    title: 'Magic Garden Light Festival',
    location: 'Parc du Vélodrome - Casablanca',
    dateLabel: '22 Avril 2026',
    time: '19:00',
    price: '100,00 MAD',
    category: 'Festivals',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80',
    dateTag: 'week'
  },
  {
    id: 3,
    slug: 'tim-impulsion',
    organizer: 'Troupe d’improvisation du Maroc',
    organizerColor: 'from-amber-400 to-orange-500',
    title: 'La TIM présente « IMPULSION »',
    location: 'Théâtre Mohammed Zefzaf',
    dateLabel: '23 Avril 2026',
    time: '21:00',
    price: '80,00 MAD',
    category: 'Divertissement',
    image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=900&q=80',
    dateTag: 'week'
  },
  {
    id: 4,
    slug: 'conference-fabrice-midal',
    organizer: '10Mentions',
    organizerColor: 'from-blue-400 to-indigo-500',
    title: 'Conférence : Fabrice Midal',
    location: 'Villa des Arts',
    dateLabel: '24 Avril 2026',
    time: '18:30',
    price: '200,00 MAD',
    category: 'Salon & formation',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=900&q=80',
    dateTag: 'weekend'
  },
  {
    id: 5,
    slug: 'niro-concert-casablanca',
    organizer: 'AURAEVENT X PLUG',
    organizerColor: 'from-rose-500 to-orange-500',
    title: 'NIRO en Concert à Casablanca',
    location: 'Complexe Mohammed V',
    dateLabel: '15 Mai 2026',
    time: '22:00',
    price: '400,00 MAD',
    category: 'Concerts',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    dateTag: 'month'
  },
  {
    id: 6,
    slug: 'mode-avionde-rachid-rafik',
    organizer: 'B.LINE',
    organizerColor: 'from-fuchsia-400 to-purple-500',
    title: 'Mode Avionde – Rachid Rafik',
    location: 'Studio des Arts Vivants',
    dateLabel: '22 Avril 2026',
    time: '20:00',
    price: '150,00 MAD',
    category: 'Théâtre & Humour',
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80',
    dateTag: 'week'
  },
  {
    id: 7,
    slug: 'bryan-adams-bare-bones',
    organizer: 'Association EDOM',
    organizerColor: 'from-cyan-400 to-blue-500',
    title: 'Bryan Adams Bare Bones',
    location: 'Salle couverte',
    dateLabel: '04 | 05 | 06 Juin 2026',
    time: '21:30',
    price: '300,00 MAD',
    category: 'Concerts',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
    dateTag: 'month'
  },
  {
    id: 8,
    slug: 'halim-hologram-experience',
    organizer: 'Basketball Africa League (BAL)',
    organizerColor: 'from-yellow-400 to-orange-500',
    title: 'Halim – The Interactive Hologram Experience',
    location: 'Complexe sportif Prince Moulay',
    dateLabel: '24 Avril 2026',
    time: '19:30',
    price: '50,00 MAD',
    category: 'Jeune Public',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80',
    dateTag: 'weekend'
  },
  {
    id: 9,
    slug: 'bal-casablanca-finals',
    organizer: 'Basketball Africa League (BAL)',
    organizerColor: 'from-yellow-400 to-orange-500',
    title: 'BAL Casablanca Finals Night',
    location: 'Complexe Mohammed V',
    dateLabel: '23 Avril 2026',
    time: '20:45',
    price: '120,00 MAD',
    category: 'Sport',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
    dateTag: 'weekend'
  },
  {
    id: 10,
    slug: 'nostalgia-lovers-festival',
    organizer: 'AURAEVENT X PLUG',
    organizerColor: 'from-rose-500 to-orange-500',
    title: 'Nostalgia Lovers Festival',
    location: 'Parc du Vélodrome - Casablanca',
    dateLabel: '24 Avril 2026',
    time: '17:00',
    price: '200,00 MAD',
    category: 'Festivals',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80',
    dateTag: 'weekend'
  }
];

function TopNavbar(): JSX.Element {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030d2a]/95 backdrop-blur">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-4 pb-4">
          <div className="text-4xl font-black tracking-tight text-white">Billeterie</div>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-white/25 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/10">FR</button>
            <button className="rounded-full border border-white/25 px-2.5 py-1 text-xs font-semibold text-white/75 hover:bg-white/10">MA</button>
            <button className="relative rounded-full border border-white/20 bg-white/10 p-2.5 text-sm text-white hover:bg-white/20">🛒<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-500" /></button>
            <button className="rounded-full border border-white/20 bg-white/10 p-2.5 text-sm text-white hover:bg-white/20">☰</button>
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <ServiceMenu />
          <div className="flex items-center gap-2">
            <div className="flex w-full items-center gap-2 rounded-full border border-white/15 bg-[#102249] px-4 py-2 text-sm text-slate-200 xl:w-[390px]">
              <span>🔎</span>
              <input className="w-full bg-transparent outline-none placeholder:text-slate-400" placeholder="Cherchez ce que vous voulez" />
            </div>
            <button className="rounded-full border border-white/20 bg-[#102249] p-2.5 text-white hover:bg-[#163264]">⚙️</button>
          </div>
        </div>
      </div>
      <CategoryStrip />
    </header>
  );
}

function ServiceMenu(): JSX.Element {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {serviceMenu.map((item) => (
        <button
          key={item.label}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all ${
            item.active
              ? 'border-transparent bg-white text-[#05112f]'
              : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function CategoryStrip(): JSX.Element {
  return (
    <div className="border-t border-white/10 bg-[#041537]">
      <div className="mx-auto flex max-w-[1800px] items-center gap-3 overflow-x-auto px-4 py-3 lg:px-8">
        {categories.map((item, idx) => (
          <div key={item} className="flex items-center gap-3">
            <span className="shrink-0 whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-200">{item}</span>
            {idx !== categories.length - 1 && <span className="text-slate-500">•</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeaturedPosterCard({ image, title }: { image: string; title: string }): JSX.Element {
  return (
    <button className="group relative h-[520px] w-full overflow-hidden rounded-2xl bg-[#07183f] text-left">
      <img src={image} alt={title} className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-white">{title}</h3>
      </div>
    </button>
  );
}

function HeroFeaturedSection(): JSX.Element {
  return (
    <section className="mx-auto max-w-[1800px] px-4 pt-7 lg:px-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {featuredPosters.map((image, idx) => (
          <FeaturedPosterCard key={image} image={image} title={`Featured Event ${idx + 1}`} />
        ))}
      </div>
    </section>
  );
}

function SliderIndicators(): JSX.Element {
  return (
    <div className="flex items-center justify-center gap-2 py-5">
      {[0, 1, 2, 3, 4].map((item) => (
        <span key={item} className={`h-1.5 w-8 rounded-full ${item === 1 ? 'bg-orange-400' : 'bg-white/45'}`} />
      ))}
    </div>
  );
}

function DateFilterTabs({ active, onChange }: { active: DateFilter; onChange: (tab: DateFilter) => void }): JSX.Element {
  const tabs: { key: DateFilter; label: string }[] = [
    { key: 'today', label: 'Aujourd’hui' },
    { key: 'week', label: 'Cette semaine' },
    { key: 'weekend', label: 'ce weekend' },
    { key: 'month', label: 'Ce mois-ci' }
  ];

  return (
    <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-5 border-b border-white/10 pb-2 text-sm md:text-base">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative pb-2 transition-all ${active === tab.key ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          {tab.label}
          <span
            className={`absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-orange-400 transition-all ${
              active === tab.key ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function EventMeta({ location, dateLabel, time }: { location: string; dateLabel: string; time: string }): JSX.Element {
  return (
    <>
      <p className="mt-2 text-xs text-slate-300">📍 {location}</p>
      <p className="mt-1 text-xs text-slate-300">📅 {dateLabel} · {time}</p>
    </>
  );
}

function HorizontalEventCard({ event }: { event: TicketEvent }): JSX.Element {
  return (
    <Link to={`/events/${event.slug}`} className="group w-[230px] shrink-0 rounded-2xl border border-white/10 bg-[#071b45] p-3 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30">
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-block h-7 w-7 rounded-full bg-gradient-to-br ${event.organizerColor}`} />
        <span className="line-clamp-1 text-xs font-medium text-slate-200">{event.organizer}</span>
      </div>
      <div className="overflow-hidden rounded-xl">
        <img src={event.image} alt={event.title} className="h-64 w-full object-cover transition-all duration-500 group-hover:scale-105" />
      </div>
      <h3 className="mt-3 text-sm font-semibold leading-snug text-white line-clamp-2">{event.title}</h3>
      <EventMeta location={event.location} dateLabel={event.dateLabel} time={event.time} />
      <div className="mt-3 inline-flex rounded-full bg-[#10244f] px-3 py-1 text-xs font-semibold text-white">{event.price}</div>
    </Link>
  );
}

function HorizontalEventsSection({ data }: { data: TicketEvent[] }): JSX.Element {
  return (
    <section className="mx-auto max-w-[1800px] px-4 pt-7 lg:px-8">
      <div className="flex gap-4 overflow-x-auto pb-2">
        {data.map((event) => (
          <HorizontalEventCard key={`strip-${event.id}`} event={event} />
        ))}
      </div>
    </section>
  );
}

function EventGridCard({ event }: { event: TicketEvent }): JSX.Element {
  return (
    <Link to={`/events/${event.slug}`} className="group rounded-2xl border border-white/10 bg-[#071b45] p-3 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-black/30">
      <div className="mb-3 flex items-center gap-2">
        <span className={`inline-block h-6 w-6 rounded-full bg-gradient-to-br ${event.organizerColor}`} />
        <span className="line-clamp-1 text-xs text-slate-200">{event.organizer}</span>
      </div>
      <div className="overflow-hidden rounded-xl">
        <img src={event.image} alt={event.title} className="h-72 w-full object-cover transition-all duration-500 group-hover:scale-105" />
      </div>
      <div className="pt-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-white">{event.title}</h3>
        <EventMeta location={event.location} dateLabel={event.dateLabel} time={event.time} />
        <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-400">{event.category}</p>
        <div className="mt-3 inline-flex rounded-full bg-[#10244f] px-3 py-1 text-xs font-semibold text-white">{event.price}</div>
      </div>
    </Link>
  );
}

function AllEventsSection({ data }: { data: TicketEvent[] }): JSX.Element {
  return (
    <section className="mx-auto max-w-[1800px] px-4 pb-12 pt-9 lg:px-8">
      <div className="mb-6 border-t border-white/10 pt-6">
        <h2 className="text-3xl font-bold text-white">Tous les événements</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {data.map((event) => (
          <EventGridCard key={`grid-${event.id}`} event={event} />
        ))}
      </div>
    </section>
  );
}

export default function TicketingHomePage(): JSX.Element {
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilter>('week');

  const filteredEvents = useMemo(
    () => events.filter((event) => activeDateFilter === 'today' ? event.dateTag === 'today' : event.dateTag === activeDateFilter),
    [activeDateFilter]
  );

  const horizontalEvents = filteredEvents.length > 0 ? filteredEvents : events.slice(0, 6);
  const gridEvents = filteredEvents.length > 0 ? filteredEvents : events;

  return (
    <div className="-mx-4 min-h-screen bg-[#020b22] text-white lg:-mx-8">
      <TopNavbar />
      <HeroFeaturedSection />
      <SliderIndicators />
      <DateFilterTabs active={activeDateFilter} onChange={setActiveDateFilter} />
      <HorizontalEventsSection data={horizontalEvents} />
      <AllEventsSection data={gridEvents} />
    </div>
  );
}
