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
      className="group premium-surface premium-hover relative cursor-pointer overflow-hidden rounded-2xl border border-sky-100/15 bg-gradient-to-b from-[#0c2247]/95 to-[#06152f]/95 shadow-glass transition duration-300 [transform-style:preserve-3d] hover:-translate-y-1 hover:border-sky-200/40 hover:shadow-[0_18px_42px_rgba(8,47,110,0.45)] hover:[transform:perspective(1200px)_translateY(-4px)_rotateX(1.2deg)] focus:outline-none focus:ring-2 focus:ring-orange-400"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_40%)] opacity-70" />
      <div className="absolute right-3 top-3 z-10" onClick={(clickEvent) => clickEvent.stopPropagation()}>
        <FavoriteButton
          itemId={event.slug}
          itemType="event"
          payload={{
            slug: event.slug,
            title: event.title,
            image: event.image_url,
            location,
            date: event.starts_at_human,
            route,
            organizer: event.organizer
          }}
        />
      </div>
      <ResponsiveImage
        src={event.image_url}
        alt={event.title}
        aspect="video"
        loading="lazy"
        imgClassName="transition duration-500 group-hover:scale-105"
      />
      {event.badge && (
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-slate-950/65 px-3 py-1 text-xs text-white backdrop-blur-md">
          {event.badge}
        </span>
      )}
      {isPlanEvent && (
        <span className="absolute left-3 top-3 rounded-full bg-amber-500/95 px-3 py-1 text-xs font-semibold text-[#241300] shadow-lg shadow-amber-500/30 backdrop-blur">
          Plan interactif
        </span>
      )}
      <div className="space-y-2 p-4">
        <p className="line-clamp-1 text-xs uppercase text-slate-400">{event.organizer}</p>
        <h3 className="line-clamp-2 font-semibold text-white">{event.title}</h3>
        <p className="line-clamp-1 text-sm text-slate-300">{location}</p>
        <p className="text-sm text-slate-300">{event.starts_at_human}</p>
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="font-semibold text-amber-300">
            {event.is_free ? 'Gratuit' : `${event.price_mad} MAD`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-full border border-amber-200/40 bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 text-sm font-semibold text-[#2d1a00] shadow-md shadow-amber-500/20 transition hover:brightness-105"
            >
              {isPlanEvent ? 'Voir le plan' : 'Acheter'}
            </button>
            <span className="rounded-full border border-sky-100/35 bg-white/[0.02] px-3 py-1 text-sm font-medium text-slate-100 transition group-hover:border-sky-200/60 group-hover:bg-white group-hover:text-[#041743]">
              Voir
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}