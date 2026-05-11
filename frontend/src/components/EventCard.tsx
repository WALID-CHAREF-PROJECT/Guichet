import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventItem } from '../types/api';
import { useCart } from '../contexts/CartContext';
import { uid } from '../services/commerce/utils';
import FavoriteButton from './FavoriteButton';
import ResponsiveImage from './ResponsiveImage';

interface Props { event: EventItem }

function eventLocation(event: EventItem): string {
  return event.location ?? [event.venue, event.city?.name].filter(Boolean).join(' · ');
}

export default function EventCard({ event }: Props): JSX.Element {
  const { addItems } = useCart();
  const navigate = useNavigate();
  const route = `/ma-fr/event/${event.slug}`;
  const location = eventLocation(event);

  const handleAddToCart = (clickEvent: MouseEvent<HTMLButtonElement>): void => {
    clickEvent.stopPropagation();
    addItems([
      {
        id: uid('cart'),
        productType: 'event_ticket',
        slug: event.slug,
        title: event.title,
        image: event.image_url,
        date: event.starts_at_human,
        location,
        ticketType: 'Normal',
        quantity: 1,
        unitPrice: event.price_mad,
        subtotal: event.price_mad
      }
    ]);
  };

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={event.title}
      onClick={() => navigate(route)}
      onKeyDown={(keyboardEvent) => { if (keyboardEvent.key === 'Enter') navigate(route); }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#041743] shadow-sm shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl hover:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      <div className="absolute right-3 top-3 z-10" onClick={(clickEvent) => clickEvent.stopPropagation()}><FavoriteButton itemId={event.slug} itemType="event" payload={{ slug: event.slug, title: event.title, image: event.image_url, location, date: event.starts_at_human, route, organizer: event.organizer }} /></div>
      <ResponsiveImage src={event.image_url} alt={event.title} aspect="video" loading="lazy" imgClassName="transition duration-500 group-hover:scale-105" />
      {event.badge && <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-white backdrop-blur">{event.badge}</span>}
      <div className="space-y-2 p-4">
        <p className="line-clamp-1 text-xs uppercase text-slate-400">{event.organizer}</p>
        <h3 className="line-clamp-2 font-semibold text-white">{event.title}</h3>
        <p className="line-clamp-1 text-sm text-slate-300">{location}</p>
        <p className="text-sm text-slate-300">{event.starts_at_human}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="font-semibold text-orange-400">{event.is_free ? 'Gratuit' : `${event.price_mad} MAD`}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleAddToCart} className="rounded-full bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600">Ajouter</button>
            <span className="rounded-full border border-white/40 px-3 py-1 text-sm font-medium transition group-hover:bg-white group-hover:text-[#041743]">Voir</span>
          </div>
        </div>
      </div>
    </article>
  );
}
