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
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#041743] shadow-sm">
      <div className="relative h-52 bg-slate-200">
        <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
        {event.badge && <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-white">{event.badge}</span>}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase text-slate-400">{event.organizer}</p>
        <h3 className="line-clamp-2 font-semibold">{event.title}</h3>
        <p className="text-sm text-slate-300">{event.venue} · {event.city.name}</p>
        <p className="text-sm text-slate-300">{event.starts_at_human}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-orange-400">{event.is_free ? 'Gratuit' : `${event.price_mad} MAD`}</span>
          <div className="flex items-center gap-2">
            <button onClick={handleAddToCart} className="rounded-full bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600">Ajouter</button>
            <Link to={`/events/${event.slug}`} className="rounded-full border border-white/40 px-3 py-1 text-sm font-medium">Voir</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
