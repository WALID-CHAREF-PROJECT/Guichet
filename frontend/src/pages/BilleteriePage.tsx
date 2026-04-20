import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getEvents } from '../services/api';
import { Category, EventItem } from '../types/api';

type QuickWindow = 'today' | 'week' | 'tomorrow' | 'month';

const quickLinks: Array<{ key: QuickWindow; label: string; apiValue: string }> = [
  { key: 'today', label: 'Aujourd’hui', apiValue: 'today' },
  { key: 'week', label: 'Cette semaine', apiValue: 'week' },
  { key: 'tomorrow', label: 'Demain', apiValue: 'tomorrow' },
  { key: 'month', label: 'Ce mois-ci', apiValue: 'month' }
];

export default function BilleteriePage(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeQuickLink, setActiveQuickLink] = useState<QuickWindow>('today');
  const [featuredEvents, setFeaturedEvents] = useState<EventItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
      setSelectedCategory(data[0]?.slug ?? '');
    });

    getEvents({ sort: 'date_asc' }).then((response) => setFeaturedEvents(response.data.slice(0, 8)));
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;

    setLoading(true);
    getEvents({
      category: selectedCategory,
      quick_date: quickLinks.find((link) => link.key === activeQuickLink)?.apiValue,
      sort: 'date_asc'
    })
      .then((response) => setEvents(response.data))
      .finally(() => setLoading(false));
  }, [selectedCategory, activeQuickLink]);

  const selectedCategoryName = useMemo(
    () => categories.find((category) => category.slug === selectedCategory)?.name ?? 'Catégorie',
    [categories, selectedCategory]
  );

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-4xl font-bold">Billetterie</h1>
        <p className="text-sm text-slate-300">Une page dédiée à la billetterie avec catégories et billets disponibles par période.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">À la une</h2>
        <div className="flex snap-x gap-4 overflow-x-auto pb-2">
          {featuredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.slug}`}
              className="group relative h-[460px] min-w-[320px] snap-start overflow-hidden rounded-xl border border-white/10 bg-[#041743] md:min-w-[420px]"
            >
              <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition duration-200 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 space-y-1 bg-gradient-to-t from-black/85 to-transparent p-4">
                <p className="text-xs uppercase text-slate-300">{event.organizer}</p>
                <p className="line-clamp-2 text-lg font-bold text-white">{event.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Types de produits</h2>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold ${
                selectedCategory === category.slug ? 'border-white bg-white text-[#031438]' : 'border-white/25 bg-white/5 hover:bg-white/10'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 text-sm font-semibold">
          {quickLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => setActiveQuickLink(link.key)}
              className={`border-b pb-1 transition ${activeQuickLink === link.key ? 'border-orange-500 text-white' : 'border-transparent text-slate-300 hover:text-white'}`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {loading && <p>Chargement des billets...</p>}
        {!loading && events.length === 0 && <p className="text-slate-300">Aucun billet disponible pour {selectedCategoryName.toLowerCase()}.</p>}

        {!loading && events.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {events.map((event) => (
              <Link key={event.id} to={`/events/${event.slug}`} className="min-w-[220px] max-w-[220px] space-y-2">
                <div className="h-72 overflow-hidden rounded-lg border border-white/10 bg-[#041743]">
                  <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
                </div>
                <p className="line-clamp-2 text-sm font-semibold">{event.title}</p>
                <p className="text-xs text-slate-400">{event.starts_at_human}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
