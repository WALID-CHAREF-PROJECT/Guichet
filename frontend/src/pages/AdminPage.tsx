import { ReactNode, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { backofficeService } from '../services/backoffice';
import { getUsers } from '../services/storage';
import { useUser } from '../contexts/UserContext';

const menu = [
  { to: '/ma-fr/admin/dashboard', label: 'Tableau de bord' },
  { to: '/ma-fr/admin/users', label: 'Utilisateurs' },
  { to: '/ma-fr/admin/organizers', label: 'Fournisseurs / Organisateurs' },
  { to: '/ma-fr/admin/events', label: 'Événements' },
  { to: '/ma-fr/admin/orders', label: 'Commandes' },
  { to: '/ma-fr/admin/travels', label: 'Voyages' },
  { to: '/ma-fr/admin/movies', label: 'Films' },
  { to: '/ma-fr/admin/categories', label: 'Catégories' },
  { to: '/ma-fr/admin/content', label: 'Contenu' },
  { to: '/ma-fr/admin/producers', label: 'Producteurs (packs)' },
  { to: '/ma-fr/admin/packs', label: 'Packs producteurs' },
  { to: '/ma-fr/admin/settings', label: 'Paramètres' }
];

function Shell({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  const { logout } = useUser();
  const [open, setOpen] = useState(false);
  return (
    <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <aside className={`rounded-3xl border border-white/10 bg-[#041743] p-4 ${open ? 'block' : 'hidden'} lg:block`}>
        <h2 className="mb-4 text-xl font-semibold">Administration</h2>
        <nav className="space-y-1">{menu.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `block rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-white text-[#041743] font-semibold' : 'hover:bg-white/10'}`}>{item.label}</NavLink>)}</nav>
        <button onClick={logout} className="mt-4 w-full rounded-xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-red-200">Déconnexion</button>
      </aside>
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-[#041743] p-4"><button onClick={() => setOpen((v) => !v)} className="rounded border border-white/20 px-3 py-1 text-sm lg:hidden">Menu</button><h1 className="mt-2 text-2xl font-bold">{title}</h1></div>
        {children}
      </div>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }): JSX.Element {
  return <article className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-300">{label}</p><p className="text-2xl font-bold">{value}</p></article>;
}
function Panel({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return <article className="space-y-2 rounded-2xl border border-white/10 bg-[#041743] p-4"><h3 className="font-semibold">{title}</h3>{children}</article>;
}

export default function AdminPage(): JSX.Element {
  const { pathname } = useLocation();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const sync = (): void => setTick((n) => n + 1);
    window.addEventListener('ticketflow:update', sync);
    return () => window.removeEventListener('ticketflow:update', sync);
  }, []);
  void tick;

  const db = backofficeService.getAdminData();
  const users = getUsers();
  const section = pathname.split('/')[3] ?? 'dashboard';

  if (section === 'dashboard' || pathname === '/ma-fr/admin') {
    return (
      <Shell title="Tableau de bord admin">
        <div className="grid gap-3 md:grid-cols-4">
          <Card label="Total users" value={String(users.length)} />
          <Card label="Total organizers" value={String(db.organizers.length)} />
          <Card label="Total events" value={String(db.events.length)} />
          <Card label="Total orders" value={String(db.orders.length)} />
          <Card label="Total revenue" value={`${db.orders.reduce((sum, order) => sum + order.total, 0)} MAD`} />
          <Card label="Pending approvals" value={String(db.organizers.filter((organizer) => !organizer.isApproved).length)} />
          <Card label="Active categories" value={String(db.categories.filter((category) => category.isActive).length)} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Recent signups">{users.slice(-5).map((user) => <p key={user.id} className="rounded bg-white/5 p-2 text-sm">{user.firstName} {user.lastName} · {user.email}</p>)}</Panel>
          <Panel title="Recent orders">{db.orders.slice(0, 5).map((order) => <p key={order.id} className="rounded bg-white/5 p-2 text-sm">{order.reference} · {order.productName} · {order.total} MAD</p>)}</Panel>
          <Panel title="Recent events">{db.events.slice(0, 5).map((event) => <p key={event.id} className="rounded bg-white/5 p-2 text-sm">{event.title} · {event.status}</p>)}</Panel>
          <Panel title="Quick moderation"><div className="flex gap-2"><button className="rounded bg-white/10 px-3 py-1">Valider organizer</button><button className="rounded bg-white/10 px-3 py-1">Feature event</button></div></Panel>
        </div>
      </Shell>
    );
  }

  if (section === 'users') {
    return <Shell title="Utilisateurs"><Panel title="Gestion utilisateurs">{users.map((user) => <div key={user.id} className="mb-2 flex flex-wrap items-center gap-2 rounded bg-white/5 p-2 text-sm"><span>{user.firstName} {user.lastName}</span><span>{user.email}</span><span>{user.role}</span><span>{user.active ? 'active' : 'inactive'}</span><button onClick={() => backofficeService.updateUser(user.id, { active: !user.active })} className="rounded bg-white/10 px-2">activate/deactivate</button><button onClick={() => backofficeService.updateUser(user.id, { role: user.role === 'client' ? 'organizer' : 'client' })} className="rounded bg-white/10 px-2">change role</button><button onClick={() => backofficeService.deleteUser(user.id)} className="rounded bg-red-500/20 px-2">delete</button><button className="rounded bg-white/10 px-2">reset password</button></div>)}</Panel></Shell>;
  }

  if (section === 'organizers') {
    return <Shell title="Fournisseurs / Organisateurs"><Panel title="Gestion organisateurs">{db.organizers.map((organizer) => <div key={organizer.id} className="mb-2 flex flex-wrap items-center gap-2 rounded bg-white/5 p-2 text-sm"><span>{organizer.companyName}</span><span>{organizer.email}</span><span>{organizer.city}</span><span>{organizer.isApproved ? 'approved' : 'pending'}</span><button onClick={() => backofficeService.updateOrganizer(organizer.id, { isApproved: true })} className="rounded bg-white/10 px-2">approve</button><button onClick={() => backofficeService.updateOrganizer(organizer.id, { isApproved: false })} className="rounded bg-white/10 px-2">reject</button><Link to={`/ma-fr/event/producer/${organizer.slug}`} className="rounded bg-white/10 px-2">open page</Link></div>)}</Panel></Shell>;
  }

  if (section === 'events') {
    return <Shell title="Événements"><Panel title="Gestion événements">{db.events.map((event) => <div key={event.id} className="mb-2 flex flex-wrap gap-2 rounded bg-white/5 p-2 text-sm"><span>{event.title}</span><span>{event.organizerId}</span><span>{event.category}</span><span>{event.city}</span><span>{event.status}</span><button onClick={() => backofficeService.updateEventByAdmin(event.id, { status: event.status === 'published' ? 'draft' : 'published' })} className="rounded bg-white/10 px-2">publish/unpublish</button><button onClick={() => backofficeService.updateEventByAdmin(event.id, { status: 'archived' })} className="rounded bg-white/10 px-2">archive</button><button onClick={() => backofficeService.updateEventByAdmin(event.id, { featured: !event.featured })} className="rounded bg-white/10 px-2">feature</button><button onClick={() => backofficeService.deleteEventByAdmin(event.id)} className="rounded bg-red-500/20 px-2">delete</button><Link className="rounded bg-white/10 px-2" to={`/ma-fr/event/${event.slug}`}>open</Link></div>)}</Panel></Shell>;
  }

  if (section === 'orders') {
    return <Shell title="Commandes"><Panel title="Toutes les commandes">{db.orders.map((order) => <p key={order.id} className="rounded bg-white/5 p-2 text-sm">{order.reference} · {order.customerName} · {order.organizerId} · {order.productType} · {order.productName} · {order.total} · {order.paymentStatus}</p>)}</Panel></Shell>;
  }

  if (section === 'travels') {
    return <Shell title="Voyages"><Panel title="Gestion voyages"><button className="mb-2 rounded bg-white px-3 py-1 text-[#041743]" onClick={() => backofficeService.createTravel({ image: '', title: 'Nouveau voyage', category: 'Voyage organisé', destination: 'Rabat', departureDate: '2026-07-01', price: 4500, status: 'draft', featured: false })}>Créer</button>{db.travels.map((travel) => <div key={travel.id} className="mb-2 flex flex-wrap gap-2 rounded bg-white/5 p-2 text-sm"><span>{travel.title}</span><span>{travel.destination}</span><span>{travel.departureDate}</span><span>{travel.price} MAD</span><button onClick={() => backofficeService.updateTravel(travel.id, { status: travel.status === 'published' ? 'draft' : 'published' })} className="rounded bg-white/10 px-2">publish/unpublish</button><button onClick={() => backofficeService.updateTravel(travel.id, { featured: !travel.featured })} className="rounded bg-white/10 px-2">feature</button></div>)}</Panel></Shell>;
  }

  if (section === 'movies') {
    return <Shell title="Films"><Panel title="Gestion films"><button className="mb-2 rounded bg-white px-3 py-1 text-[#041743]" onClick={() => backofficeService.createMovie({ poster: '', title: 'Nouveau film', genre: 'Action', duration: '1h30', releaseDate: '2026-06-20', cinemas: 'Megarama', status: 'draft', featured: false })}>Créer</button>{db.movies.map((movie) => <div key={movie.id} className="mb-2 flex flex-wrap gap-2 rounded bg-white/5 p-2 text-sm"><span>{movie.title}</span><span>{movie.genre}</span><span>{movie.duration}</span><span>{movie.releaseDate}</span><button onClick={() => backofficeService.updateMovie(movie.id, { status: movie.status === 'published' ? 'draft' : 'published' })} className="rounded bg-white/10 px-2">publish/unpublish</button><button onClick={() => backofficeService.updateMovie(movie.id, { featured: !movie.featured })} className="rounded bg-white/10 px-2">feature</button></div>)}</Panel></Shell>;
  }

  if (section === 'categories') {
    return <Shell title="Catégories"><Panel title="Category management"><button onClick={() => backofficeService.createCategory({ type: 'event', name: 'Nouvelle catégorie', slug: 'nouvelle-categorie', icon: '⭐', isActive: true, order: db.categories.length + 1 })} className="mb-2 rounded bg-white px-3 py-1 text-[#041743]">Add category</button>{db.categories.map((category) => <div key={category.id} className="mb-2 flex flex-wrap gap-2 rounded bg-white/5 p-2 text-sm"><span>{category.type}</span><span>{category.name}</span><span>{category.slug}</span><span>{category.order}</span><button onClick={() => backofficeService.updateCategory(category.id, { isActive: !category.isActive })} className="rounded bg-white/10 px-2">activate/deactivate</button><button onClick={() => backofficeService.updateCategory(category.id, { order: Math.max(1, category.order - 1) })} className="rounded bg-white/10 px-2">reorder</button><button onClick={() => backofficeService.deleteCategory(category.id)} className="rounded bg-red-500/20 px-2">delete</button></div>)}</Panel></Shell>;
  }

  if (section === 'content') {
    return <Shell title="Contenu"><Panel title="Homepage content"><button onClick={() => backofficeService.addContent({ type: 'banner', title: 'Nouveau banner', subtitle: 'Promo', visible: true, order: db.content.length + 1 })} className="mb-2 rounded bg-white px-3 py-1 text-[#041743]">Add content block</button>{db.content.map((item) => <div key={item.id} className="mb-2 flex flex-wrap gap-2 rounded bg-white/5 p-2 text-sm"><span>{item.type}</span><span>{item.title}</span><span>{item.order}</span><button onClick={() => backofficeService.updateContent(item.id, { visible: !item.visible })} className="rounded bg-white/10 px-2">toggle visibility</button><button onClick={() => backofficeService.updateContent(item.id, { order: Math.max(1, item.order - 1) })} className="rounded bg-white/10 px-2">reorder</button></div>)}</Panel></Shell>;
  }

  return <Shell title="Paramètres"><Panel title="Platform settings"><label className="block text-sm">Branding<input defaultValue={db.settings.platformName} onBlur={(e) => backofficeService.updateSettings({ platformName: e.target.value })} className="mt-1 w-full rounded border border-white/20 bg-white/5 p-2" /></label><label className="block text-sm">Support email<input defaultValue={db.settings.supportEmail} onBlur={(e) => backofficeService.updateSettings({ supportEmail: e.target.value })} className="mt-1 w-full rounded border border-white/20 bg-white/5 p-2" /></label><label className="block text-sm">Default currency<input defaultValue={db.settings.currency} onBlur={(e) => backofficeService.updateSettings({ currency: e.target.value })} className="mt-1 w-full rounded border border-white/20 bg-white/5 p-2" /></label></Panel></Shell>;
}
