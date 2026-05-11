import { Link, useParams } from 'react-router-dom';
import PlatformTopNav from '../components/PlatformTopNav';
import TicketSelectionModal from '../components/commerce/TicketSelectionModal';
import FavoriteButton from '../components/FavoriteButton';
import SharePopover from '../components/SharePopover';
import ResponsiveImage from '../components/ResponsiveImage';
import SeatPlanModal from '../components/commerce/SeatPlanModal';
import { useEffect, useState } from 'react';
import { getPublicEvent } from '../services/publicApi';
import { EventItem } from '../types/api';
import { PlatformEvent } from '../services/platformData';

function organizerSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function toPlatformEvent(event: EventItem): PlatformEvent {
  const location = event.location ?? [event.venue, event.city?.name].filter(Boolean).join(' · ');
  const date = event.date ?? event.starts_at_human;
  const time = event.time ?? '';
  return {
    id: Number(event.id),
    slug: event.slug,
    title: event.title,
    organizer: event.organizer,
    organizerLogo: event.image_url,
    image: event.image_url,
    tags: [event.type ?? event.category?.slug ?? 'event'],
    location,
    date,
    time,
    price: event.is_free ? 'Gratuit' : `${event.price_mad} MAD`,
    description: event.description,
    buyingMode: event.buyingMode ?? 'ticket',
    hasPlan: event.hasPlan === true && event.buyingMode === 'plan',
    planType: event.planType ?? null,
    seatingEnabled: event.seatingEnabled ?? false,
  };
}

export default function EventDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const [event, setEvent] = useState<PlatformEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [seatModalOpen, setSeatModalOpen] = useState(false);

  const load = (): void => {
    setLoading(true);
    getPublicEvent(slug)
      .then((item) => { setEvent(toPlatformEvent(item)); setError(''); })
      .catch((err: unknown) => { setEvent(null); setError(err instanceof Error ? err.message : 'Événement introuvable.'); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [slug]);

  const usesPlan = event?.buyingMode === 'plan' && event.hasPlan === true && Boolean(event.planType);
  const planCta = event?.planType === 'theatre' ? 'Choisir mes places' : event?.planType === 'stadium' ? 'Choisir ma zone' : 'Choisir sur le plan';

  if (loading || error || !event) {
    return (
      <div className="-mx-4 min-h-screen bg-[#020b22] text-white lg:-mx-8">
        <PlatformTopNav active="billeterie" />
        <section className="mx-auto max-w-[1200px] px-4 py-10 lg:px-8">
          {loading ? <p>Chargement de l’événement...</p> : <><p>{error || 'Événement introuvable.'}</p><button onClick={load} className="mt-4 rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Réessayer</button></>}
        </section>
      </div>
    );
  }

  return (
    <div className="-mx-4 min-h-screen bg-[#020b22] text-white lg:-mx-8">
      <PlatformTopNav active="billeterie" />
      <section className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="space-y-4">
          <Link to="/ma-fr/billeterie" className="text-sm text-slate-300">← Retour</Link>
          <div className="rounded-3xl border border-white/10 bg-[#06173c] p-3 shadow-xl shadow-black/25">
            <ResponsiveImage src={event.image} alt={event.title} aspect="video" loading="eager" className="max-h-[520px] min-h-[240px] rounded-2xl md:min-h-[360px]" />
          </div>
        </div>

        <article className="rounded-3xl border border-white/10 bg-[#06173c] p-6 lg:p-8">
          <div className="mb-6 flex items-center justify-end gap-2">
            <SharePopover title={event.title} />
            <FavoriteButton itemId={event.slug} itemType="event" payload={{ slug: event.slug, title: event.title, image: event.image, location: event.location, date: `${event.date} · ${event.time}`, route: `/ma-fr/event/${event.slug}`, organizer: event.organizer }} />
          </div>
          <div className="mb-5 flex items-center gap-3">
            <ResponsiveImage src={event.organizerLogo} alt={event.organizer} aspect="square" loading="lazy" className="h-10 w-10 rounded-full" />
            <Link to={`/ma-fr/event/producer/${organizerSlug(event.organizer)}`} className="text-sm text-slate-200 underline">{event.organizer}</Link>
          </div>
          <h1 className="text-4xl font-bold leading-tight">{event.title}</h1>
          <p className="mt-4 text-slate-300">📍 {event.location}</p>
          <p className="mt-2 text-slate-300">🗓️ {event.date} {event.time ? `· ${event.time}` : ''}</p>
          <hr className="my-6 border-white/10" />
          <p className="leading-7 text-slate-200">{event.description}</p>
          <div className="mt-8 space-y-3">
            {usesPlan ? (
              <>
                <button onClick={() => setSeatModalOpen(true)} className="w-full rounded-full bg-white px-6 py-4 text-lg font-bold text-[#03143a]">{planCta}</button>
                <p className="text-sm text-slate-300">Sélectionnez une zone sur le plan interactif, puis vérifiez le récapitulatif avant l’ajout au panier.</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-orange-300">{event.price}</p>
                <button onClick={() => setTicketModalOpen(true)} className="w-full rounded-full bg-white px-6 py-4 text-lg font-bold text-[#03143a]">Acheter / Ajouter au panier</button>
              </>
            )}
          </div>
        </article>
      </section>

      {!usesPlan && <TicketSelectionModal event={event} open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />}
      {usesPlan && <SeatPlanModal event={event} open={seatModalOpen} onClose={() => setSeatModalOpen(false)} />}
    </div>
  );
}
