import { Link, useParams } from 'react-router-dom';
import PlatformTopNav from '../components/PlatformTopNav';
import { getEventBySlug } from '../services/platformData';
import { backofficeService } from '../services/backoffice';
import TicketSelectionModal from '../components/commerce/TicketSelectionModal';
import FavoriteButton from '../components/FavoriteButton';
import SharePopover from '../components/SharePopover';
import SeatPlanModal from '../components/commerce/SeatPlanModal';
import { useState } from 'react';

export default function EventDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const dynamic = backofficeService.getPublicEventBySlug(slug);
  const fallbackEvent = getEventBySlug(slug);
  const event = dynamic ? {
    slug: dynamic.event.slug,
    title: dynamic.event.title,
    organizer: dynamic.organizer?.companyName ?? 'Organisateur',
    organizerLogo: dynamic.organizer?.logo ?? dynamic.event.image,
    image: dynamic.event.image,
    tags: dynamic.event.tags,
    location: dynamic.event.location,
    date: dynamic.event.date,
    time: dynamic.event.time,
    price: `${dynamic.event.ticketTypes[0]?.price ?? 0} MAD`,
    description: dynamic.event.description
  } : fallbackEvent;
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [seatModalOpen, setSeatModalOpen] = useState(false);

  if (!event) {
    return (
      <div className="-mx-4 min-h-screen bg-[#020b22] text-white lg:-mx-8">
        <PlatformTopNav active="billeterie" />
        <section className="mx-auto max-w-[1200px] px-4 py-10 lg:px-8">
          <p>Événement introuvable.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="-mx-4 min-h-screen bg-[#020b22] text-white lg:-mx-8">
      <PlatformTopNav active="billeterie" />
      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div className="space-y-4">
          <Link to="/ma-fr/billeterie" className="text-sm text-slate-300">← Retour</Link>
          <div className="rounded-3xl border border-white/10 bg-[#06173c] p-4">
            <img src={event.image} alt={event.title} className="h-full min-h-[560px] w-full rounded-2xl object-cover" />
          </div>
        </div>

        <article className="rounded-3xl border border-white/10 bg-[#06173c] p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-end gap-2">
            <SharePopover title={event.title} />
            <FavoriteButton itemId={event.slug} itemType="event" payload={{ slug: event.slug, title: event.title, image: event.image, location: event.location, date: `${event.date} · ${event.time}`, route: `/ma-fr/event/${event.slug}`, organizer: event.organizer }} />
          </div>
          <div className="mb-5 flex items-center gap-3">
            <img src={event.organizerLogo} alt={event.organizer} className="h-10 w-10 rounded-full object-cover" />
            <Link to={`/ma-fr/event/producer/${event.organizer.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`} className="text-sm text-slate-200 underline">{event.organizer}</Link>
          </div>
          <h1 className="text-4xl font-bold leading-tight">{event.title}</h1>
          <p className="mt-4 text-slate-300">📍 {event.location}</p>
          <p className="mt-2 text-slate-300">🗓️ {event.date} · {event.time}</p>
          <hr className="my-6 border-white/10" />
          <p className="leading-7 text-slate-200">{event.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button onClick={() => setTicketModalOpen(true)} className="w-full rounded-full bg-white px-6 py-4 text-lg font-bold text-[#03143a]">Acheter maintenant · {event.price}</button>
            <button onClick={() => setSeatModalOpen(true)} className="w-full rounded-full border border-white/30 bg-white/5 px-6 py-4 text-lg font-bold">Acheter via plan</button>
          </div>
        </article>
      </section>

      <TicketSelectionModal event={event} open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />
      <SeatPlanModal event={event} open={seatModalOpen} onClose={() => setSeatModalOpen(false)} />
    </div>
  );
}
