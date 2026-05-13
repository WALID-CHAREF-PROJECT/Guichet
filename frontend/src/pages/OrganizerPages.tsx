import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { backofficeService, BackofficeEvent, EventStatus, TicketType } from '../services/backoffice';
import { useUser } from '../contexts/UserContext';
import { getPublicOrganizer as fetchPublicOrganizer, PublicOrganizerProfile } from '../services/publicApi';
import { EventItem } from '../types/api';

const sidebarItems = [
  { to: '/ma-fr/organizer/dashboard', label: 'Tableau de bord' },
  { to: '/ma-fr/organizer/profile', label: 'Mon profil' },
  { to: '/ma-fr/organizer/events', label: 'Mes événements' },
  { to: '/ma-fr/organizer/events/new', label: 'Créer un événement' },
  { to: '/ma-fr/organizer/orders', label: 'Commandes / Réservations' },
  { to: '/ma-fr/organizer/customers', label: 'Clients' },
  { to: '/ma-fr/organizer/reports', label: 'Rapports' },
  { to: '/ma-fr/organizer/payouts', label: 'Paiements / Payouts' },
  { to: '/ma-fr/organizer/settings', label: 'Paramètres' }
];

function OrganizerShell({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }): JSX.Element {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { logout } = useUser();

  return (
    <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <aside className={`rounded-3xl border border-white/10 bg-[#041743] p-4 ${open ? 'block' : 'hidden'} lg:block`}>
        <h2 className="mb-4 text-xl font-semibold">Espace Organisateur</h2>
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `block rounded-xl px-3 py-2 text-sm transition ${isActive || pathname === item.to ? 'bg-white text-[#041743] font-semibold' : 'text-slate-200 hover:bg-white/10'}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="mt-5 w-full rounded-xl border border-red-300/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">Déconnexion</button>
      </aside>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-[#041743] p-4">
          <div>
            <button onClick={() => setOpen((v) => !v)} className="rounded-lg border border-white/20 px-3 py-1 text-sm lg:hidden">Menu</button>
            <h1 className="mt-2 text-2xl font-bold">{title}</h1>
          </div>
          {actions}
        </div>
        {children}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }): JSX.Element {
  return <article className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-300">{label}</p><p className="text-2xl font-bold">{value}</p></article>;
}

export function OrganizerDashboardPage(): JSX.Element {
  const { user } = useUser();
  const [reload, setReload] = useState(0);
  const events = backofficeService.getOrganizerEvents(user?.id ?? '');
  const orders = backofficeService.getOrganizerOrders(user?.id ?? '');
  const payouts = backofficeService.getOrganizerPayouts(user?.id ?? '');
  const customers = backofficeService.getOrganizerCustomers(user?.id ?? '');
  useEffect(() => {
    const sync = (): void => setReload((n) => n + 1);
    window.addEventListener('ticketflow:update', sync);
    return () => window.removeEventListener('ticketflow:update', sync);
  }, []);
  void reload;

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  return (
    <OrganizerShell title="Tableau de bord organisateur" actions={<Link className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#041743]" to="/ma-fr/organizer/events/new">Nouvel événement</Link>}>
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Total events" value={String(events.length)} />
        <Stat label="Active events" value={String(events.filter((event) => event.status === 'published').length)} />
        <Stat label="Draft events" value={String(events.filter((event) => event.status === 'draft').length)} />
        <Stat label="Past events" value={String(events.filter((event) => event.status === 'past').length)} />
        <Stat label="Total reservations" value={String(orders.length)} />
        <Stat label="Revenue generated" value={`${revenue.toLocaleString()} MAD`} />
        <Stat label="Pending payouts" value={`${payouts.filter((payout) => payout.status === 'pending').reduce((sum, payout) => sum + payout.amount, 0)} MAD`} />
        <Stat label="Number of customers" value={String(customers.length)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Upcoming events">{events.slice(0, 4).map((event) => <p key={event.id} className="rounded-lg bg-white/5 p-2 text-sm">{event.title} · {event.date}</p>)}</Panel>
        <Panel title="Recent orders">{orders.slice(0, 4).map((order) => <p key={order.id} className="rounded-lg bg-white/5 p-2 text-sm">{order.reference} · {order.customerName} · {order.total} MAD</p>)}</Panel>
        <Panel title="Quick actions"><div className="flex flex-wrap gap-2"><Link to="/ma-fr/organizer/events/new" className="rounded-full bg-white px-3 py-1 text-[#041743]">Créer</Link><Link to="/ma-fr/organizer/orders" className="rounded-full border border-white/20 px-3 py-1">Commandes</Link><Link to="/ma-fr/organizer/reports" className="rounded-full border border-white/20 px-3 py-1">Rapports</Link></div></Panel>
        <Panel title="Top performing events">{[...events].sort((a, b) => b.revenue - a.revenue).slice(0, 3).map((event) => <p key={event.id} className="rounded-lg bg-white/5 p-2 text-sm">{event.title} · {event.revenue} MAD</p>)}</Panel>
      </div>
    </OrganizerShell>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return <article className="space-y-2 rounded-2xl border border-white/10 bg-[#041743] p-4"><h3 className="font-semibold">{title}</h3>{children || <p className="text-slate-400">Aucune donnée.</p>}</article>;
}

export function OrganizerEventsPage(): JSX.Element {
  const { user } = useUser();
  const [q, setQ] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const sync = (): void => setReload((n) => n + 1);
    window.addEventListener('ticketflow:update', sync);
    return () => window.removeEventListener('ticketflow:update', sync);
  }, []);
  void reload;
  const events = backofficeService.getOrganizerEvents(user?.id ?? '').filter((event) => event.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <OrganizerShell title="Mes événements" actions={<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher" className="rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-sm" />}>
      <div className="overflow-auto rounded-2xl border border-white/10 bg-[#041743] p-4">
        <table className="min-w-full text-left text-sm">
          <thead><tr className="text-slate-300"><th>Poster</th><th>Titre</th><th>Catégorie</th><th>Ville / Lieu</th><th>Date</th><th>Status</th><th>Tickets</th><th>Revenue</th><th>Actions</th></tr></thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-white/10 align-top">
                <td className="py-2"><img src={event.image} alt={event.title} className="h-12 w-12 rounded object-cover" /></td>
                <td>{event.title}</td><td>{event.category}</td><td>{event.city} / {event.location}</td><td>{event.date}</td><td>{event.status}</td><td>{event.ticketsSold}</td><td>{event.revenue} MAD</td>
                <td className="space-x-1 py-2">
                  <Link className="rounded bg-white/10 px-2 py-1" to={`/ma-fr/event/${event.slug}`}>View</Link>
                  <Link className="rounded bg-white/10 px-2 py-1" to={`/ma-fr/organizer/events/${event.id}/edit`}>Edit</Link>
                  <ActionButton onClick={() => backofficeService.updateOrganizerEvent(user?.id ?? '', event.id, { status: event.status === 'published' ? 'draft' : 'published' })}>{event.status === 'published' ? 'Unpublish' : 'Publish'}</ActionButton>
                  <ActionButton onClick={() => backofficeService.updateOrganizerEvent(user?.id ?? '', event.id, { status: 'archived' })}>Archive</ActionButton>
                  <ActionButton onClick={() => backofficeService.duplicateOrganizerEvent(user?.id ?? '', event.id)}>Duplicate</ActionButton>
                  <ActionButton onClick={() => backofficeService.deleteOrganizerEvent(user?.id ?? '', event.id)}>Delete</ActionButton>
                  <ActionButton onClick={() => backofficeService.updateOrganizerEvent(user?.id ?? '', event.id, { featured: !event.featured })}>{event.featured ? 'Unfeature req' : 'Feature req'}</ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!events.length && <p className="py-6 text-center text-slate-400">Aucun événement.</p>}
      </div>
    </OrganizerShell>
  );
}

function ActionButton({ onClick, children }: { onClick: () => void; children: ReactNode }): JSX.Element {
  return <button onClick={onClick} className="rounded bg-white/10 px-2 py-1">{children}</button>;
}

type EventFormState = {
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  date: string;
  time: string;
  city: string;
  location: string;
  mapsLink: string;
  image: string;
  featuredImage: string;
  tags: string;
  status: EventStatus;
  terms: string;
};

const defaultEventForm: EventFormState = {
  title: '', slug: '', category: 'Concerts', shortDescription: '', description: '', date: '', time: '', city: '', location: '', mapsLink: '', image: '', featuredImage: '', tags: '', status: 'draft', terms: ''
};

function EventForm({ initial, onSubmit }: { initial?: BackofficeEvent; onSubmit: (payload: Omit<BackofficeEvent, 'id' | 'organizerId' | 'ticketsSold' | 'revenue' | 'createdAt' | 'updatedAt'>) => void }): JSX.Element {
  const navigate = useNavigate();
  const [form, setForm] = useState<EventFormState>(initial ? { ...defaultEventForm, ...initial, tags: initial.tags.join(', ') } : defaultEventForm);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(initial?.ticketTypes ?? [
    { id: 'normal', name: 'Normal', price: 100, stock: 100, seatPlanRequired: false },
    { id: 'vip', name: 'VIP', price: 300, stock: 50, seatPlanRequired: true }
  ]);
  const handleImageUpload = (key: 'image' | 'featuredImage') => async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setForm((prev) => ({ ...prev, [key]: reader.result }));
    };
    reader.readAsDataURL(file);
  };
  const submit = (e: FormEvent): void => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.date || !form.city || !form.location) return;
    onSubmit({
      ...form,
      gallery: form.image ? [form.image] : [],
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      featured: initial?.featured ?? false,
      buyingMode: 'ticket',
      hasPlan: false,
      planType: null,
      seatingEnabled: false,
      planZones: [],
      ticketTypes
    });
    navigate('/ma-fr/organizer/events');
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-[#041743] p-4">
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(form).filter(([k]) => !['status', 'description', 'shortDescription', 'terms', 'tags'].includes(k)).map(([key, value]) => (
          key === 'image' || key === 'featuredImage'
            ? (
              <label key={key} className="space-y-2 text-sm">
                <span className="capitalize">{key}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload(key)} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-2 file:py-1 file:text-[#041743]" />
                <input value={String(value)} placeholder="Or paste image URL" onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" />
                {typeof value === 'string' && value ? <img src={value} alt={`${key} preview`} className="h-20 w-full rounded-lg object-cover" /> : null}
              </label>
            )
            : <label key={key} className="space-y-1 text-sm"><span className="capitalize">{key}</span><input value={String(value)} onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" /></label>
        ))}
      </div>
      <label className="block text-sm">Short description<textarea value={form.shortDescription} onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" /></label>
      <label className="block text-sm">Full description<textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" /></label>
      <label className="block text-sm">Tags<textarea value={form.tags} onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" /></label>
      <div className="grid gap-2 md:grid-cols-2">
        <label className="text-sm">Status<select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as 'draft' | 'published' | 'archived' }))} className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2"><option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option></select></label>
        <label className="text-sm">Terms<textarea value={form.terms} onChange={(e) => setForm((prev) => ({ ...prev, terms: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2" /></label>
      </div>
      <div className="space-y-2 rounded-2xl border border-white/10 p-3">
        <h3 className="font-semibold">Ticket types</h3>
        {ticketTypes.map((ticket, index) => (
          <div key={ticket.id} className="grid gap-2 md:grid-cols-5">
            <input value={ticket.name} onChange={(e) => setTicketTypes((prev) => prev.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} className="rounded-xl border border-white/20 bg-white/5 px-2 py-1" placeholder="Nom" />
            <input type="number" value={ticket.price} onChange={(e) => setTicketTypes((prev) => prev.map((item, i) => i === index ? { ...item, price: Number(e.target.value) } : item))} className="rounded-xl border border-white/20 bg-white/5 px-2 py-1" placeholder="Prix" />
            <input type="number" value={ticket.stock} onChange={(e) => setTicketTypes((prev) => prev.map((item, i) => i === index ? { ...item, stock: Number(e.target.value) } : item))} className="rounded-xl border border-white/20 bg-white/5 px-2 py-1" placeholder="Stock" />
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={ticket.seatPlanRequired} onChange={(e) => setTicketTypes((prev) => prev.map((item, i) => i === index ? { ...item, seatPlanRequired: e.target.checked } : item))} /> seat plan</label>
            <button type="button" onClick={() => setTicketTypes((prev) => prev.filter((_, i) => i !== index))} className="rounded-xl border border-white/20 px-2 py-1">Supprimer</button>
          </div>
        ))}
        <button type="button" onClick={() => setTicketTypes((prev) => [...prev, { id: String(Math.random()), name: '', price: 0, stock: 0, seatPlanRequired: false }])} className="rounded-xl border border-white/20 px-3 py-1">Ajouter ticket</button>
      </div>
      <div className="flex gap-2"><button type="submit" className="rounded-full bg-white px-5 py-2 font-semibold text-[#041743]">Sauvegarder</button><button type="button" onClick={() => setForm((prev) => ({ ...prev, status: 'published' }))} className="rounded-full border border-white/20 px-5 py-2">Publish</button></div>
    </form>
  );
}

export function OrganizerNewEventPage(): JSX.Element {
  const { user } = useUser();
  return <OrganizerShell title="Créer un événement"><EventForm onSubmit={(payload) => backofficeService.createOrganizerEvent(user?.id ?? '', payload)} /></OrganizerShell>;
}

export function OrganizerEditEventPage(): JSX.Element {
  const { id = '' } = useParams();
  const { user } = useUser();
  const event = backofficeService.getOrganizerEvent(user?.id ?? '', id);
  if (!event) return <OrganizerShell title="Modifier événement"><div className="rounded-2xl border border-white/10 bg-[#041743] p-6">Événement introuvable.</div></OrganizerShell>;
  return <OrganizerShell title={`Modifier ${event.title}`}><EventForm initial={event} onSubmit={(payload) => backofficeService.updateOrganizerEvent(user?.id ?? '', id, payload)} /></OrganizerShell>;
}

export function OrganizerOrdersPage(): JSX.Element {
  const { user } = useUser();
  const [filters, setFilters] = useState({ event: 'all', status: 'all', payment: 'all', date: '' });
  const orders = backofficeService.getOrganizerOrders(user?.id ?? '').filter((order) => (filters.event === 'all' || order.productId === filters.event) && (filters.status === 'all' || order.bookingStatus === filters.status) && (filters.payment === 'all' || order.paymentStatus === filters.payment) && (!filters.date || order.createdAt.slice(0, 10) === filters.date));
  const events = backofficeService.getOrganizerEvents(user?.id ?? '');
  return (
    <OrganizerShell title="Commandes / Réservations">
      <div className="grid gap-2 rounded-2xl border border-white/10 bg-[#041743] p-3 md:grid-cols-4">
        <select value={filters.event} onChange={(e) => setFilters((prev) => ({ ...prev, event: e.target.value }))} className="rounded-lg border border-white/20 bg-white/5 p-2"><option value="all">Tous les events</option>{events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}</select>
        <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="rounded-lg border border-white/20 bg-white/5 p-2"><option value="all">Statut booking</option><option value="confirmed">confirmed</option><option value="checked_in">checked_in</option><option value="cancelled">cancelled</option></select>
        <select value={filters.payment} onChange={(e) => setFilters((prev) => ({ ...prev, payment: e.target.value }))} className="rounded-lg border border-white/20 bg-white/5 p-2"><option value="all">Paiement</option><option value="paid">paid</option><option value="pending">pending</option><option value="cancelled">cancelled</option></select>
        <input type="date" value={filters.date} onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))} className="rounded-lg border border-white/20 bg-white/5 p-2" />
      </div>
      <Panel title="Liste des commandes">{orders.map((order) => <p key={order.id} className="rounded-lg bg-white/5 p-2 text-sm">{order.reference} · {order.customerName} · {order.productName} · {order.ticketType} · {order.quantity} · {order.total} MAD · {order.paymentStatus}</p>)}</Panel>
    </OrganizerShell>
  );
}

export function OrganizerCustomersPage(): JSX.Element {
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const customers = backofficeService.getOrganizerCustomers(user?.id ?? '').filter((customer) => customer.name.toLowerCase().includes(query.toLowerCase()) || customer.email.toLowerCase().includes(query.toLowerCase()));
  return <OrganizerShell title="Clients" actions={<input value={query} onChange={(e) => setQuery(e.target.value)} className="rounded-xl border border-white/20 bg-white/5 p-2" placeholder="Search" />}><Panel title="Liste clients">{customers.map((customer) => <p key={customer.email} className="rounded-lg bg-white/5 p-2 text-sm">{customer.name} · {customer.email} · {customer.phone} · {customer.bookings} bookings · {customer.totalSpent} MAD · {customer.lastBookingDate.slice(0, 10)}</p>)}</Panel></OrganizerShell>;
}

export function OrganizerReportsPage(): JSX.Element {
  const { user } = useUser();
  const orders = backofficeService.getOrganizerOrders(user?.id ?? '');
  const events = backofficeService.getOrganizerEvents(user?.id ?? '');
  const byDay = useMemo(() => orders.reduce<Record<string, number>>((acc, order) => {
    const key = order.createdAt.slice(0, 10);
    acc[key] = (acc[key] ?? 0) + order.total;
    return acc;
  }, {}), [orders]);

  return (
    <OrganizerShell title="Rapports">
      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="Revenue over time">{Object.entries(byDay).map(([day, amount]) => <div key={day} className="mb-2"><div className="mb-1 flex justify-between text-xs"><span>{day}</span><span>{amount} MAD</span></div><div className="h-2 rounded bg-white/10"><div className="h-2 rounded bg-brand-500" style={{ width: `${Math.min(100, (amount / 1500) * 100)}%` }} /></div></div>)}</Panel>
        <Panel title="Best selling events">{[...events].sort((a, b) => b.ticketsSold - a.ticketsSold).slice(0, 5).map((event) => <p key={event.id} className="rounded-lg bg-white/5 p-2 text-sm">{event.title} · {event.ticketsSold} billets</p>)}</Panel>
        <Panel title="Best selling ticket types"><p className="rounded-lg bg-white/5 p-2 text-sm">VIP · 52%</p><p className="rounded-lg bg-white/5 p-2 text-sm">Normal · 31%</p><p className="rounded-lg bg-white/5 p-2 text-sm">Carré Or · 17%</p></Panel>
        <Panel title="Occupancy / cancellation"><p className="rounded-lg bg-white/5 p-2 text-sm">Occupancy moyenne: 67%</p><p className="rounded-lg bg-white/5 p-2 text-sm">Annulations: 4.2%</p></Panel>
      </div>
    </OrganizerShell>
  );
}

export function OrganizerPayoutsPage(): JSX.Element {
  const { user } = useUser();
  const payouts = backofficeService.getOrganizerPayouts(user?.id ?? '');
  const total = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const paid = payouts.filter((payout) => payout.status === 'paid').reduce((sum, payout) => sum + payout.amount, 0);
  return (
    <OrganizerShell title="Paiements / Payouts">
      <div className="grid gap-3 md:grid-cols-3"><Stat label="Total earned" value={`${total} MAD`} /><Stat label="Paid out" value={`${paid} MAD`} /><Stat label="Pending payout" value={`${total - paid} MAD`} /></div>
      <Panel title="Payout history">{payouts.map((payout) => <p key={payout.id} className="rounded-lg bg-white/5 p-2 text-sm">{payout.reference} · {payout.date} · {payout.amount} MAD · {payout.status}</p>)}</Panel>
    </OrganizerShell>
  );
}

export function OrganizerProfilePage(): JSX.Element {
  const { user } = useUser();
  const profile = backofficeService.getOrganizerProfile(user?.id ?? '');
  const [form, setForm] = useState(profile);
  useEffect(() => setForm(profile), [profile]);
  if (!form) return <OrganizerShell title="Mon profil"><div className="rounded-2xl border border-white/10 bg-[#041743] p-4">Profil introuvable.</div></OrganizerShell>;
  return (
    <OrganizerShell title="Mon profil">
      <form onSubmit={(e) => { e.preventDefault(); backofficeService.updateOrganizerProfile(user?.id ?? '', form); }} className="grid gap-3 rounded-2xl border border-white/10 bg-[#041743] p-4 md:grid-cols-2">
        {(['companyName', 'logo', 'coverImage', 'description', 'email', 'phone', 'city', 'address', 'website', 'socialLinks', 'supportInfo'] as const).map((field) => (
          <label key={field} className="text-sm">{field}<input value={form[field] ?? ''} onChange={(e) => setForm((prev) => prev ? ({ ...prev, [field]: e.target.value }) : prev)} className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 p-2" /></label>
        ))}
        <button type="submit" className="rounded-full bg-white px-4 py-2 font-semibold text-[#041743] md:col-span-2">Sauvegarder le profil</button>
      </form>
    </OrganizerShell>
  );
}

export function OrganizerSettingsPage(): JSX.Element {
  return (
    <OrganizerShell title="Paramètres">
      <div className="grid gap-3 md:grid-cols-2">
        <Panel title="Notifications"><label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Nouveaux paiements</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Nouvelles commandes</label></Panel>
        <Panel title="Payout preferences"><label className="block text-sm">RIB<input className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 p-2" defaultValue="MA64 0000 0000" /></label><label className="block text-sm">Fréquence<select className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 p-2"><option>Hebdomadaire</option><option>Mensuelle</option></select></label></Panel>
        <Panel title="Branding"><label className="block text-sm">Couleur primaire<input className="mt-1 w-full rounded-xl border border-white/20 bg-white/5 p-2" defaultValue="#0b4dd8" /></label></Panel>
        <Panel title="Default event options"><label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> Publier en brouillon</label><label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Demander validation admin</label></Panel>
      </div>
    </OrganizerShell>
  );
}

export function OrganizerPublicPage(): JSX.Element {
  const { slug = '' } = useParams();
  const [organizer, setOrganizer] = useState<PublicOrganizerProfile | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (): void => {
    setLoading(true);
    fetchPublicOrganizer(slug)
      .then((payload) => { setOrganizer(payload.organizer); setEvents(payload.events); setError(''); })
      .catch((err: unknown) => { setOrganizer(null); setEvents([]); setError(err instanceof Error ? err.message : 'Organisateur introuvable.'); })
      .finally(() => setLoading(false));
  };

  useEffect(load, [slug]);

  if (loading) {
    return <section className="rounded-3xl border border-white/10 bg-[#041743] p-8 text-white shadow-2xl">Chargement du profil organisateur...</section>;
  }

  if (error || !organizer) {
    return (
      <section className="rounded-3xl border border-white/10 bg-[#041743] p-8 text-white shadow-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-orange-200">Profil public</p>
        <h1 className="mt-2 text-3xl font-black">Organisateur introuvable</h1>
        <p className="mt-3 max-w-2xl text-slate-300">{error || 'Ce profil n’est pas disponible publiquement.'}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/ma-fr/billeterie" className="rounded-full bg-white px-5 py-2.5 font-semibold text-[#041743]">Retour à la billetterie</Link>
          <button onClick={load} className="rounded-full border border-white/20 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10">Réessayer</button>
        </div>
      </section>
    );
  }

  const contact = [organizer.city, organizer.address].filter(Boolean).join(' · ');

  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#041743] via-[#061d48] to-[#020b22] text-white shadow-2xl shadow-black/30">
      <div className="relative min-h-[230px] bg-[#10244f]">
        {organizer.cover_image ? <img src={organizer.cover_image} alt={organizer.company_name} className="absolute inset-0 h-full w-full object-cover opacity-80" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#041743] via-[#041743]/35 to-transparent" />
        <div className="relative flex min-h-[230px] items-end p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            {organizer.logo ? <img src={organizer.logo} alt={organizer.company_name} className="h-24 w-24 rounded-3xl border-4 border-[#041743] object-cover shadow-xl" /> : <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-[#041743] bg-white/10 text-4xl shadow-xl">🏢</div>}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-200">Producteur / organisateur</p>
                {organizer.verified ? <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-2 py-1 text-xs font-semibold text-emerald-100">Vérifié</span> : null}
              </div>
              <h1 className="mt-2 text-3xl font-black md:text-5xl">{organizer.company_name}</h1>
              {contact ? <p className="mt-2 text-sm text-slate-200">📍 {contact}</p> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
            <h2 className="text-xl font-bold">À propos</h2>
            <p className="mt-3 leading-7 text-slate-300">{organizer.description || 'Cet organisateur publie prochainement sa présentation.'}</p>
          </article>

          <article>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Catalogue</p>
                <h2 className="text-2xl font-black">Événements publiés</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">{events.length} événement{events.length > 1 ? 's' : ''}</span>
            </div>
            {events.length > 0 ? (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {events.map((event) => (
                  <Link key={event.id} to={`/ma-fr/event/${event.slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] transition hover:-translate-y-0.5 hover:border-orange-300/40">
                    <img src={event.image_url} alt={event.title} className="h-36 w-full object-cover transition group-hover:scale-[1.02]" />
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-orange-200">{event.city?.name || event.location || 'Événement'}</p>
                      <h3 className="mt-1 text-lg font-bold">{event.title}</h3>
                      <p className="mt-2 text-sm text-slate-300">{event.starts_at_human || event.date || 'Date à confirmer'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-8 text-center text-slate-300">Aucun événement publié pour le moment.</div>
            )}
          </article>
        </div>

        <aside className="h-fit rounded-3xl border border-white/10 bg-[#020b22]/60 p-5">
          <h2 className="text-lg font-bold">Contact & support</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p><span className="text-slate-500">Ville</span><br />{organizer.city || 'Non renseignée'}</p>
            <p><span className="text-slate-500">Adresse</span><br />{organizer.address || 'Non renseignée'}</p>
            <p><span className="text-slate-500">Email support</span><br />{organizer.support_email || 'Non renseigné'}</p>
            <p><span className="text-slate-500">Téléphone support</span><br />{organizer.support_phone || 'Non renseigné'}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
