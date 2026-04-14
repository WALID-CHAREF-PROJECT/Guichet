import { Link } from 'react-router-dom';
import { addToCart } from '../services/storage';
import { EventItem } from '../types/api';

interface Props { event: EventItem }

export default function EventCard({ event }: Props): JSX.Element {
  const handleAddToCart = (): void => {
    addToCart(event);
    window.dispatchEvent(new Event('ticketflow:update'));
  };

  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="relative h-40 bg-slate-200">
        <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
        {event.badge && <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-white">{event.badge}</span>}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase text-slate-500">{event.organizer}</p>
        <h3 className="line-clamp-2 font-semibold">{event.title}</h3>
        <p className="text-sm text-slate-600">{event.venue} · {event.city.name}</p>
        <p className="text-sm text-slate-600">{event.starts_at_human}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-brand-600">{event.is_free ? 'Gratuit' : `${event.price_mad} MAD`}</span>
          <div className="flex items-center gap-2">
            <button onClick={handleAddToCart} className="rounded bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600">Ajouter</button>
            <Link to={`/events/${event.slug}`} className="text-sm font-medium text-brand-600">Voir</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
