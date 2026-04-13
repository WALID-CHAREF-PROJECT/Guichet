import { useEffect, useState } from 'react';
import CategoriesSection from '../components/CategoriesSection';
import EventCard from '../components/EventCard';
import Hero from '../components/Hero';
import NewsletterSection from '../components/NewsletterSection';
import { getCategories, getEvents } from '../services/api';
import { Category, EventItem } from '../types/api';

export default function HomePage(): JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories);
    getEvents({ sort: 'date_asc' })
      .then((data) => setEvents(data.data.slice(0, 8)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Hero />
      <section>
        <h2 className="mb-4 text-2xl font-semibold">À la une</h2>
        {loading ? <p>Chargement...</p> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>}
      </section>
      {categories.length > 0 && <CategoriesSection categories={categories} />}
      <NewsletterSection />
    </>
  );
}
