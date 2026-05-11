import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoriesSection from '../components/CategoriesSection';
import EventCard from '../components/EventCard';
import NewsletterSection from '../components/NewsletterSection';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import FeaturedCarousel from '../components/FeaturedCarousel';
import { getContentBlocks, getPublicCategories, getPublicEvents, ContentBlock } from '../services/publicApi';
import { Category, EventItem } from '../types/api';

export default function HomePage(): JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroActive, setHeroActive] = useState(0);

  const load = (): void => {
    setLoading(true);
    Promise.all([getPublicCategories(), getPublicEvents({ sort: 'date_asc' }), getContentBlocks()])
      .then(([categoryItems, eventPayload, contentItems]) => {
        setCategories(categoryItems);
        setEvents(eventPayload.data.slice(0, 8));
        setContent(contentItems);
        setError('');
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const heroBlocks = content.filter((block) => ['hero', 'banner'].includes(block.type)).slice(0, 4);

  useEffect(() => {
    if (heroBlocks.length < 2) return undefined;
    const timer = setInterval(() => setHeroActive((current) => (current + 1) % heroBlocks.length), 4500);
    return () => clearInterval(timer);
  }, [heroBlocks.length]);

  return (
    <>
      {loading && <LoadingSkeleton label="Chargement de la page d’accueil..." />}
      {!loading && error && <EmptyState title="Impossible de charger le contenu public." description={error} action={<button onClick={load} className="rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button>} />}

      {!loading && !error && (
        <>
          {heroBlocks.length > 0 ? (
            <FeaturedCarousel
              label="Contenus à la une"
              items={heroBlocks.map((block) => ({ id: block.id, title: block.title, subtitle: block.subtitle, image: block.backgroundImage || block.image, to: block.ctaLink || '#', ctaLabel: block.ctaLabel, meta: 'Guichet' }))}
              activeIndex={heroActive}
              onSelect={setHeroActive}
              maxHeightClassName="max-h-[420px]"
            />
          ) : (
            <EmptyState title="Aucun bloc d’accueil visible pour le moment." />
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">Événements à l’affiche</h2>
              <Link to="/ma-fr/billeterie" className="rounded-full border border-white/40 px-4 py-1 text-sm">Tout voir</Link>
            </div>
            {events.length > 0 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <EmptyState title="Aucun événement publié pour le moment." />}
          </section>

          {categories.length > 0 ? <CategoriesSection categories={categories} /> : <EmptyState title="Aucune catégorie active pour le moment." />}
          {content.filter((block) => !['hero', 'banner'].includes(block.type)).map((block) => (
            <section key={block.id} className="rounded-2xl border border-white/10 bg-[#041743] p-6">
              <h2 className="text-2xl font-bold">{block.title}</h2>
              {block.subtitle && <p className="mt-2 text-slate-200">{block.subtitle}</p>}
              {block.description && <p className="mt-3 text-slate-300">{block.description}</p>}
              {block.ctaLink && block.ctaLabel && <Link to={block.ctaLink} className="mt-4 inline-flex rounded-full bg-white px-4 py-2 font-semibold text-[#041743]">{block.ctaLabel}</Link>}
            </section>
          ))}
        </>
      )}
      <NewsletterSection />
    </>
  );
}
