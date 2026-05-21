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

  const isPlanEvent = event.buyingMode === 'plan' && event.hasPlan === true;

  const handleAddToCart = (clickEvent: MouseEvent<HTMLButtonElement>): void => {
    clickEvent.stopPropagation();
    if (isPlanEvent) {
      navigate(route);
      return;
    }
    addItems([
      {
        id: uid('cart'),
        productType: 'event_ticket',
        slug: event.slug,
        productId: String(event.id),
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
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === 'Enter') navigate(route);
      }}
      className="group premium-surface premium-hover relative cursor-pointer overflow-hidden rounded-2xl bg-[#041743]/90 [transform-style:preserve-3d] hover:[transform:perspective(1200px)_translateY(-4px)_rotateX(1.2deg)] focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_40%)] opacity-70" />
      <div className="absolute right-3 top-3 z-10" onClick={(clickEvent) => clickEvent.stopPropagation()}><FavoriteButton itemId={event.slug} itemType="event" payload={{ slug: event.slug, title: event.title, image: event.image_url, location, date: event.starts_at_human, route, organizer: event.organizer }} /></div>
      <ResponsiveImage src={event.image_url} alt={event.title} aspect="video" loading="lazy" imgClassName="transition duration-500 group-hover:scale-105" />
      {event.badge && <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-white backdrop-blur">{event.badge}</span>}
      {isPlanEvent && <span className="absolute left-3 top-3 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">Plan interactif</span>}
      <div className="relative space-y-2 p-4">
        <p className="line-clamp-1 text-xs uppercase text-slate-300">{event.organizer}</p>
        <h3 className="line-clamp-2 font-semibold text-white">{event.title}</h3>
        <p className="line-clamp-1 text-sm text-slate-300">{location}</p>
        <p className="text-sm text-slate-300">{event.starts_at_human}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="font-semibold text-orange-300">{event.is_free ? 'Gratuit' : `${event.price_mad} MAD`}</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleAddToCart} className="rounded-full bg-orange-500 px-3 py-1 text-sm font-medium text-white shadow-md shadow-orange-900/30 transition hover:bg-orange-600">{isPlanEvent ? 'Voir le plan' : 'Acheter'}</button>
            <span className="rounded-full border border-white/40 px-3 py-1 text-sm font-medium transition group-hover:bg-white group-hover:text-[#041743]">Voir</span>
          </div>
        </div>
      </div>
    </article>
  );
}
