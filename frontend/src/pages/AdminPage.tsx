import { ReactNode, useEffect, useMemo, useState } from 'react';
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
    <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className={`rounded-3xl border border-white/15 bg-gradient-to-b from-[#0a1f56] to-[#050f2b] p-5 shadow-[0_18px_60px_rgba(2,8,28,0.6)] backdrop-blur-xl ${open ? 'block' : 'hidden'} lg:block`}>
        <h2 className="mb-4 text-xl font-semibold">Administration</h2>
        <nav className="space-y-1">{menu.map((item) => <NavLink key={item.to} to={item.to} className={({ isActive }) => `block rounded-2xl px-3 py-2 text-sm transition-all duration-300 ${isActive ? 'bg-white text-[#041743] font-semibold shadow-lg shadow-white/20' : 'hover:bg-white/10 hover:scale-[1.02]'}`}>{item.label}</NavLink>)}</nav>
        <button onClick={logout} className="mt-4 w-full rounded-2xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-red-200 transition-transform duration-300 hover:scale-[1.02]">Déconnexion</button>
      </aside>
      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0a1f56]/80 to-[#0b2f7f]/70 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.45)] backdrop-blur-xl"><button onClick={() => setOpen((v) => !v)} className="rounded-xl border border-white/20 px-3 py-1 text-sm lg:hidden">Menu</button><h1 className="mt-2 text-2xl font-bold">{title}</h1></div>
        {children}
      </div>
    </section>
  );
}

function StatCard({ label, value, icon, gradient }: { label: string; value: string; icon: string; gradient: string }): JSX.Element {
  return <article className={`group rounded-2xl border border-white/15 ${gradient} p-5 shadow-[0_16px_32px_rgba(2,6,23,0.4)] backdrop-blur-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_22px_40px_rgba(2,6,23,0.65)]`}><div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl">{icon}</div><p className="text-sm text-slate-200">{label}</p><p className="text-3xl font-semibold tracking-tight">{value}</p></article>;
}

function Panel({ title, children }: { title: string; children: ReactNode }): JSX.Element {
  return <article className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5 shadow-[0_16px_40px_rgba(1,7,22,0.45)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]"><h3 className="font-semibold text-slate-100">{title}</h3>{children}</article>;
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

  const revenueTotal = db.orders.reduce((sum, order) => sum + order.total, 0);
  const producerCount = db.organizers.length;
  const activePackCount = db.packs.filter((pack) => pack.isActive).length;
  const revenueSeries = useMemo(() => {
    const buckets = new Map<string, number>();
    db.orders.forEach((order) => {
      const key = order.createdAt.slice(0, 7);
      buckets.set(key, (buckets.get(key) ?? 0) + order.total);
    });
    return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
  }, [db.orders]);

  const categorySeries = useMemo(() => {
    const counter = new Map<string, number>();
    db.events.forEach((event) => counter.set(event.category, (counter.get(event.category) ?? 0) + 1));
    return Array.from(counter.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [db.events]);

  if (section === 'dashboard' || pathname === '/ma-fr/admin') {
    const chartWidth = 520;
    const chartHeight = 220;
    const maxRevenue = Math.max(...revenueSeries.map(([, v]) => v), 1);
    const points = revenueSeries.map((entry, index) => {
      const x = revenueSeries.length > 1 ? (index / (revenueSeries.length - 1)) * (chartWidth - 40) + 20 : chartWidth / 2;
      const y = chartHeight - (entry[1] / maxRevenue) * 150 - 20;
      return `${x},${y}`;
    }).join(' ');
    const maxCategory = Math.max(...categorySeries.map(([, count]) => count), 1);

    return (
      <Shell title="Tableau de bord admin">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total producers" value={String(producerCount)} icon="🏭" gradient="bg-gradient-to-br from-cyan-500/30 to-indigo-700/30" />
          <StatCard label="Total events" value={String(db.events.length)} icon="🎫" gradient="bg-gradient-to-br from-fuchsia-500/30 to-violet-700/30" />
          <StatCard label="Revenue" value={`${revenueTotal.toLocaleString()} MAD`} icon="💰" gradient="bg-gradient-to-br from-emerald-500/30 to-teal-700/30" />
          <StatCard label="Active packs" value={String(activePackCount)} icon="📦" gradient="bg-gradient-to-br from-amber-500/30 to-orange-700/30" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Revenue trend">
            <div className="rounded-2xl border border-white/10 bg-[#031335]/70 p-4">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-56 w-full">
                <polyline fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth="1" points={`20,${chartHeight - 20} ${chartWidth - 20},${chartHeight - 20}`} />
                <polyline fill="none" stroke="url(#revenueGradient)" strokeWidth="4" strokeLinecap="round" points={points} />
                <defs><linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
              </svg>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-300 sm:grid-cols-6">{revenueSeries.map(([month, value]) => <p key={month}>{month} · {value}</p>)}</div>
            </div>
          </Panel>

          <Panel title="Events per category">
            <div className="space-y-3 rounded-2xl border border-white/10 bg-[#031335]/70 p-4">{categorySeries.map(([name, count]) => <div key={name} className="space-y-1"><div className="flex justify-between text-sm"><span>{name}</span><span>{count}</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-violet-400" style={{ width: `${(count / maxCategory) * 100}%` }} /></div></div>)}</div>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Quick actions"><div className="grid gap-3 sm:grid-cols-3"><button className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:bg-white/15">Create producer</button><button className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:bg-white/15">Create pack</button><button className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02] hover:bg-white/15">View reports</button></div></Panel>
          <Panel title="Recent orders">{db.orders.slice(0, 5).map((order) => <p key={order.id} className="rounded-xl bg-white/5 p-3 text-sm">{order.reference} · {order.productName} · {order.total} MAD</p>)}</Panel>
        </div>
      </Shell>
    );
  }

  // remaining sections unchanged
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
