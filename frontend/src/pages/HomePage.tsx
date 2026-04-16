import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoriesSection from '../components/CategoriesSection';
import EventCard from '../components/EventCard';
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
      <section className="grid gap-4 md:grid-cols-4">
        {[
          'https://images.unsplash.com/photo-1649786137948-8f75c6f7f4c9?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80'
        ].map((image) => <img key={image} src={image} className="h-72 w-full rounded-lg object-cover" />)}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-bold">Événements à l’affiche</h2>
          <Link to="/events" className="rounded-full border border-white/40 px-4 py-1 text-sm">Tout voir</Link>
        </div>
        {loading ? <p>Chargement...</p> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>}
      </section>

      {categories.length > 0 && <CategoriesSection categories={categories} />}
      <NewsletterSection />
    </>
  );
}
