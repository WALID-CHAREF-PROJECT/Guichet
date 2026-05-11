import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CategoriesSection from '../components/CategoriesSection';
import EventCard from '../components/EventCard';
import NewsletterSection from '../components/NewsletterSection';
import { getContentBlocks, getPublicCategories, getPublicEvents, ContentBlock } from '../services/publicApi';
import { Category, EventItem } from '../types/api';

export default function HomePage(): JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <>
      {loading && <section className="rounded-2xl border border-white/10 bg-[#041743] p-8 text-center text-slate-300">Chargement de la page d’accueil...</section>}
      {!loading && error && <section className="rounded-2xl border border-white/10 bg-[#041743] p-8 text-center"><p>Impossible de charger le contenu public.</p><p className="mt-2 text-slate-300">{error}</p><button onClick={load} className="mt-4 rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button></section>}

      {!loading && !error && (
        <>
          {heroBlocks.length > 0 ? (
            <section className="grid gap-4 md:grid-cols-4">
              {heroBlocks.map((block) => (
                <Link key={block.id} to={block.ctaLink || '#'} className="group relative overflow-hidden rounded-lg">
                  {block.image || block.backgroundImage ? <img src={block.backgroundImage || block.image || ''} className="h-72 w-full object-cover transition group-hover:scale-105" alt={block.title} /> : <div className="h-72 w-full bg-[#10244f]" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-xl font-bold">{block.title}</h2>
                    {block.subtitle && <p className="mt-1 text-sm text-slate-200">{block.subtitle}</p>}
                    {block.ctaLabel && <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#041743]">{block.ctaLabel}</span>}
                  </div>
                </Link>
              ))}
            </section>
          ) : (
            <section className="rounded-2xl border border-white/10 bg-[#041743] p-8 text-center text-slate-300">Aucun bloc d’accueil visible pour le moment.</section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl font-bold">Événements à l’affiche</h2>
              <Link to="/ma-fr/billeterie" className="rounded-full border border-white/40 px-4 py-1 text-sm">Tout voir</Link>
            </div>
            {events.length > 0 ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{events.map((event) => <EventCard key={event.id} event={event} />)}</div> : <div className="rounded-2xl border border-white/10 bg-[#041743] p-8 text-center text-slate-300">Aucun événement publié pour le moment.</div>}
          </section>

          {categories.length > 0 ? <CategoriesSection categories={categories} /> : <section className="rounded-2xl border border-white/10 bg-[#041743] p-8 text-center text-slate-300">Aucune catégorie active pour le moment.</section>}
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
