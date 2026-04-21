import { Link, useLocation } from 'react-router-dom';
import { platformEvents } from '../services/platformData';
import { getCurrentUser, getUsers } from '../services/storage';

export default function AdminPage(): JSX.Element {
  const user = getCurrentUser();
  const { pathname } = useLocation();

  if (!user || user.role !== 'admin') {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#041743] p-8">
        <h1 className="text-3xl font-bold">Admin</h1>
        <p className="mt-3 text-slate-300">Accès refusé. Connectez-vous avec admin@guichet.ma / Admin@123.</p>
        <Link to="/ma-fr/login" className="mt-4 inline-block rounded bg-brand-600 px-4 py-2 text-white">Connexion</Link>
      </section>
    );
  }

  const users = getUsers();
  const tabs = [
    { to: '/ma-fr/admin', label: 'Dashboard' },
    { to: '/ma-fr/admin/events', label: 'Events' },
    { to: '/ma-fr/admin/users', label: 'Users' },
    { to: '/ma-fr/admin/orders', label: 'Orders' },
    { to: '/ma-fr/admin/organizers', label: 'Organizers' },
    { to: '/ma-fr/admin/content', label: 'Content' }
  ];

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-[#041743] p-6">
      <nav className="flex flex-wrap gap-2">{tabs.map((tab) => <Link key={tab.to} to={tab.to} className={`rounded-full px-3 py-1 text-sm ${pathname === tab.to ? 'bg-white text-[#041743]' : 'bg-white/10'}`}>{tab.label}</Link>)}</nav>
      <div className="grid gap-3 md:grid-cols-4">
        <Card label="Utilisateurs" value={String(users.length)} />
        <Card label="Organisateurs" value={String(users.filter((u) => u.role === 'organizer').length)} />
        <Card label="Événements" value={String(platformEvents.length)} />
        <Card label="Featured" value="3" />
      </div>
      <p className="text-slate-300">Section active: {pathname}</p>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }): JSX.Element {
  return <article className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-slate-300">{label}</p><p className="text-2xl font-bold">{value}</p></article>;
}
