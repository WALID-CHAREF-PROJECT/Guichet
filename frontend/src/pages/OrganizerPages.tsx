import { Link, useParams } from 'react-router-dom';
import { platformEvents } from '../services/platformData';

export function OrganizerPublicPage(): JSX.Element {
  const { slug = '' } = useParams();
  const events = platformEvents.filter((event) => event.organizer.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug);
  const organizer = events[0];
  if (!organizer) return <section className="rounded-2xl border border-white/10 bg-[#041743] p-6">Organisateur introuvable.</section>;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#041743]">
      <div className="h-48 bg-gradient-to-r from-[#152f63] to-[#2d4a88]" />
      <div className="-mt-10 px-6 pb-6">
        <img src={organizer.organizerLogo} alt={organizer.organizer} className="h-20 w-20 rounded-full border-4 border-[#041743]" />
        <h1 className="mt-3 text-3xl font-bold">{organizer.organizer}</h1>
        <div className="mt-4 grid gap-3 md:grid-cols-3"><Stat label="Followers" value="12.4K" /><Stat label="Événements actifs" value={String(events.length)} /><Stat label="Événements passés" value="0" /></div>
        <h2 className="mt-6 text-xl font-semibold">Événements en cours</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">{events.map((event) => <Link key={event.id} to={`/ma-fr/event/${event.slug}`} className="rounded-xl border border-white/10 bg-white/5 p-3">{event.title}</Link>)}</div>
      </div>
    </section>
  );
}

const Stat = ({ label, value }: { label: string; value: string }) => <article className="rounded-xl bg-white/5 p-3"><p className="text-sm text-slate-300">{label}</p><p className="text-xl font-bold">{value}</p></article>;

export function OrganizerDashboardPage(): JSX.Element {
  const events = platformEvents;
  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-[#041743] p-6">
      <h1 className="text-3xl font-bold">Dashboard Organisateur</h1>
      <div className="grid gap-3 md:grid-cols-3"><Stat label="Créés" value={String(events.length)} /><Stat label="Actifs" value={String(events.length)} /><Stat label="Passés" value="0" /></div>
      <div className="flex gap-2"><Link to="/ma-fr/organizer/events/new" className="rounded-full bg-white px-4 py-2 text-[#041743]">Nouvel événement</Link><Link to="/ma-fr/organizer/orders" className="rounded-full border border-white/20 px-4 py-2">Voir commandes</Link></div>
    </section>
  );
}

export function OrganizerEventsPage(): JSX.Element {
  return <section className="rounded-3xl border border-white/10 bg-[#041743] p-6"><h2 className="text-2xl font-bold">Mes événements</h2><p className="text-slate-300">Liste des événements créés et actions d'édition.</p></section>;
}
export function OrganizerNewEventPage(): JSX.Element {
  return <section className="rounded-3xl border border-white/10 bg-[#041743] p-6"><h2 className="text-2xl font-bold">Créer un événement</h2><p className="text-slate-300">Formulaire mock fonctionnel.</p></section>;
}
export function OrganizerEditEventPage(): JSX.Element {
  const { id } = useParams();
  return <section className="rounded-3xl border border-white/10 bg-[#041743] p-6"><h2 className="text-2xl font-bold">Modifier événement {id}</h2></section>;
}
export function OrganizerOrdersPage(): JSX.Element {
  return <section className="rounded-3xl border border-white/10 bg-[#041743] p-6"><h2 className="text-2xl font-bold">Commandes reçues</h2></section>;
}
export function OrganizerProfilePage(): JSX.Element {
  return <section className="rounded-3xl border border-white/10 bg-[#041743] p-6"><h2 className="text-2xl font-bold">Profil organisateur</h2></section>;
}
