import { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import FiltersBar from '../components/FiltersBar';
import NewsletterSection from '../components/NewsletterSection';
import { getCategories, getCities, getEvents } from '../services/api';
import { Category, City, EventItem } from '../types/api';

export default function EventsPage(): JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', category: '', city: '', quickDate: '', sort: 'date_asc' });

  useEffect(() => {
    getCategories().then(setCategories);
    getCities().then(setCities);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    getEvents({
      search: filters.search,
      category: filters.category,
      city: filters.city,
      quick_date: filters.quickDate,
      sort: filters.sort
    })
      .then((res) => setEvents(res.data))
      .catch(() => setError('Impossible de charger les événements.'))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <>
      <h1 className="text-3xl font-bold">Tous les événements</h1>
      <FiltersBar
        search={filters.search}
        category={filters.category}
        city={filters.city}
        quickDate={filters.quickDate}
        sort={filters.sort}
        categories={categories}
        cities={cities}
        onChange={(key, value) => setFilters((current) => ({ ...current, [key]: value }))}
      />
      {loading && <p>Chargement des événements...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && events.length === 0 && <p className="rounded border border-dashed p-8 text-center">Aucun événement trouvé avec ces filtres.</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>
      <NewsletterSection />
    </>
  );
}
