import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getEvent } from '../services/api';
import { addToCart } from '../services/storage';
import { EventItem } from '../types/api';

export default function EventDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
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
  if (error || !event) return <p className="text-red-400">{error}</p>;

  return (
    <article className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <section className="space-y-5">
        <Link to="/events" className="text-sm text-slate-300">← Retour</Link>
        <img src={event.image_url} alt={event.title} className="h-[520px] w-full rounded-2xl object-cover" />
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#041743] p-6">
        <h1 className="text-4xl font-bold">{event.title}</h1>
        <p className="text-slate-300">{event.venue} · {event.city.name}</p>
        <p className="text-slate-300">{event.starts_at_human}</p>
        <div className="rounded-xl border border-white/10 bg-[#031233] p-4 text-sm">
          <p className="mb-1 text-slate-300">Récapitulatif de la réservation</p>
          <p>1x CAT B - Gradins (Phase 1)</p>
          <p className="mt-2">TOTAL À PAYER: <strong>{event.is_free ? 'Gratuit' : `${event.price_mad} MAD`}</strong></p>
        </div>
        <p className="text-sm leading-6 text-slate-200">{event.description}</p>

        <div className="space-y-3 pt-2">
          <button
            disabled={event.is_sold_out}
            onClick={() => {
              addToCart(event);
              window.dispatchEvent(new Event('ticketflow:update'));
            }}
            className="w-full rounded-full bg-white px-5 py-3 font-semibold text-[#041743] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {event.is_sold_out ? 'Complet' : 'Ajouter au panier'}
          </button>
          <button onClick={() => navigate('/cart')} className="w-full rounded-full border border-orange-400 px-5 py-3 font-semibold text-white">Passer ma commande</button>
        </div>
      </section>
    </article>
  );
}
