import { Link, useParams } from 'react-router-dom';
import PlatformTopNav from '../components/PlatformTopNav';
import { getEventBySlug } from '../services/platformData';

export default function EventDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const event = getEventBySlug(slug);

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
            <button className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs">Partager</button>
            <button className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs">♡</button>
          </div>
          <div className="mb-5 flex items-center gap-3">
            <img src={event.organizerLogo} alt={event.organizer} className="h-10 w-10 rounded-full object-cover" />
            <p className="text-sm text-slate-300">{event.organizer}</p>
          </div>
          <h1 className="text-4xl font-bold leading-tight">{event.title}</h1>
          <p className="mt-4 text-slate-300">📍 {event.location}</p>
          <p className="mt-2 text-slate-300">🗓️ {event.date} · {event.time}</p>
          <hr className="my-6 border-white/10" />
          <p className="leading-7 text-slate-200">{event.description}</p>
          <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-slate-300">
            <li>Entrée numérique sécurisée.</li>
            <li>Support client 7j/7.</li>
            <li>Places et tarifs selon disponibilité.</li>
          </ul>
          <button className="mt-8 w-full rounded-full bg-white px-6 py-4 text-lg font-bold text-[#03143a]">Acheter maintenant · {event.price}</button>
        </article>
      </section>
    </div>
  );
}
