import { Link, useParams } from 'react-router-dom';
import PlatformTopNav from '../components/PlatformTopNav';
import TicketSelectionModal from '../components/commerce/TicketSelectionModal';
import FavoriteButton from '../components/FavoriteButton';
import SharePopover from '../components/SharePopover';
import SeatPlanModal from '../components/commerce/SeatPlanModal';
import { useEffect, useState } from 'react';
import { catalogApi } from '../services/api/laravelApi';

interface EventDetailsModel {
  id: string;
  slug: string;
  title: string;
  organizer?: { name: string; logo?: string; slug?: string };
  image: string;
  tags?: string[];
  location: string;
  date: string;
  time: string;
  price: string;
  description: string;
  type?: string;
  buyingMode?: string;
  hasPlan?: boolean;
  ticketTypes?: Array<{ id: string; name: string; price: number; available: number }>;
}

export default function EventDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const [event, setEvent] = useState<EventDetailsModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [seatModalOpen, setSeatModalOpen] = useState(false);

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const response = await catalogApi.eventBySlug(slug);
        const payload = response.data ?? response;
        setEvent({
          id: String(payload.id),
          slug: payload.slug,
          title: payload.title,
          organizer: payload.organizer,
          image: payload.image,
          tags: payload.tags,
          location: payload.location,
          date: payload.date,
          time: payload.time,
          price: payload.price ?? `${payload.ticketTypes?.[0]?.price ?? 0} MAD`,
          description: payload.description,
          type: payload.type,
          buyingMode: payload.buyingMode,
          hasPlan: payload.hasPlan,
          ticketTypes: payload.ticketTypes
        });
      } catch (apiError) {
        setError((apiError as Error).message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-[#020b22] p-8 text-white">Chargement...</div>;

  if (!event || error) {
    return (
      <div className="-mx-4 min-h-screen bg-[#020b22] text-white lg:-mx-8">
        <PlatformTopNav active="billeterie" />
        <section className="mx-auto max-w-[1200px] px-4 py-10 lg:px-8">
          <p>{error || 'Événement introuvable.'}</p>
        </section>
      </div>
    );
  }

  const showPlanOnly = event.type === 'sport' && event.buyingMode === 'plan' && event.hasPlan;

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
            <FavoriteButton itemId={event.slug} itemType={event.type === 'sport' ? 'sport' : 'event'} payload={{ slug: event.slug, title: event.title, image: event.image, location: event.location, date: `${event.date} · ${event.time}`, route: `/ma-fr/event/${event.slug}`, organizer: event.organizer?.name }} />
          </div>
          <div className="mb-5 flex items-center gap-3">
            <img src={event.organizer?.logo ?? event.image} alt={event.organizer?.name ?? 'Organisateur'} className="h-10 w-10 rounded-full object-cover" />
            <Link to={`/ma-fr/event/producer/${event.organizer?.slug ?? 'organisateur'}`} className="text-sm text-slate-200 underline">{event.organizer?.name ?? 'Organisateur'}</Link>
          </div>
          <h1 className="text-4xl font-bold leading-tight">{event.title}</h1>
          <p className="mt-4 text-slate-300">📍 {event.location}</p>
          <p className="mt-2 text-slate-300">🗓️ {event.date} · {event.time}</p>
          <hr className="my-6 border-white/10" />
          <p className="leading-7 text-slate-200">{event.description}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {!showPlanOnly && <button onClick={() => setTicketModalOpen(true)} className="w-full rounded-full bg-white px-6 py-4 text-lg font-bold text-[#03143a]">Acheter maintenant · {event.price}</button>}
            {event.hasPlan && event.type === 'sport' && <button onClick={() => setSeatModalOpen(true)} className="w-full rounded-full border border-white/30 bg-white/5 px-6 py-4 text-lg font-bold">Acheter via plan</button>}
          </div>
        </article>
      </section>

      <TicketSelectionModal event={event as any} open={ticketModalOpen} onClose={() => setTicketModalOpen(false)} />
      <SeatPlanModal event={event as any} open={seatModalOpen} onClose={() => setSeatModalOpen(false)} />
    </div>
  );
}
