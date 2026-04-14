import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getEvent } from '../services/api';
import { addToCart } from '../services/storage';
import { EventItem } from '../types/api';

export default function EventDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvent(slug)
      .then(setEvent)
      .catch(() => setError('Événement introuvable.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p>Chargement...</p>;
  if (error || !event) return <p className="text-red-600">{error}</p>;

  return (
    <article className="space-y-6">
      <Link to="/events" className="text-brand-600">← Retour</Link>
      <img src={event.image_url} alt={event.title} className="h-72 w-full rounded-2xl object-cover" />
      <h1 className="text-4xl font-bold">{event.title}</h1>
      <p className="text-slate-600">Organisé par {event.organizer}</p>
      <div className="grid gap-2 rounded-xl border p-4 md:grid-cols-2">
        <p><strong>Ville:</strong> {event.city.name}</p>
        <p><strong>Lieu:</strong> {event.venue}</p>
        <p><strong>Date:</strong> {event.starts_at_human}</p>
        <p><strong>Prix:</strong> {event.is_free ? 'Gratuit' : `${event.price_mad} MAD`}</p>
      </div>
      <p className="leading-7">{event.description}</p>
      <button
        disabled={event.is_sold_out}
        onClick={() => {
          addToCart(event);
          window.dispatchEvent(new Event('ticketflow:update'));
        }}
        className="rounded bg-brand-600 px-5 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {event.is_sold_out ? 'Complet' : 'Ajouter au panier'}
      </button>
    </article>
  );
}
