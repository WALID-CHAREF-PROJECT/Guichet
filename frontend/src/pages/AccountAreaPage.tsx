import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { platformEvents, voyages } from '../services/platformData';

const menu = [
  { to: '/ma-fr/account', label: 'Tableau de bord', end: true },
  { to: '/ma-fr/account/profile', label: 'Mes informations' },
  { to: '/ma-fr/account/reservations', label: 'Mes réservations' },
  { to: '/ma-fr/account/travels', label: 'Mes voyages' },
  { to: '/ma-fr/account/movies', label: 'Mes films' },
  { to: '/ma-fr/account/favorites', label: 'Mes favoris' },
  { to: '/ma-fr/account/balance', label: 'Mon solde' },
  { to: '/ma-fr/account/security', label: 'Sécurité' },
  { to: '/ma-fr/account/status', label: 'Désactivation et suppression' }
];

export default function AccountAreaPage(): JSX.Element {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  if (!user) {
    return (
      <section className="rounded-2xl border border-white/10 bg-[#041743] p-8">
        <p>Veuillez vous connecter pour accéder à votre espace compte.</p>
        <Link className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-[#041743]" to="/ma-fr/login">Connexion</Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
      <aside className="space-y-3 rounded-3xl border border-white/10 bg-[#041743] p-4">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `block rounded-xl px-4 py-2 text-sm ${isActive ? 'bg-white text-[#041743] font-semibold' : 'bg-white/5 hover:bg-white/10'}`}
          >
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => {
            logout();
            navigate('/ma-fr/login');
          }}
          className="w-full rounded-xl bg-red-500/20 px-4 py-2 text-left text-sm text-red-200"
        >
          Se déconnecter
        </button>
      </aside>
      <Outlet />
    </div>
  );
}

export function AccountDashboard(): JSX.Element {
  const { scopedState, user } = useUser();
  const orders = scopedState?.orders ?? [];
  const totalSpent = orders.reduce((sum, order) => sum + order.totalNow, 0);
  const balance = (scopedState?.balanceTransactions ?? []).reduce((sum, txn) => sum + txn.amount, 0);

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-[#041743] p-6">
      <h1 className="text-3xl font-bold">Bienvenue {user?.firstName}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Commandes validées" value={String(orders.length)} />
        <StatCard label="Total dépensé" value={`${totalSpent.toFixed(0)} MAD`} />
        <StatCard label="Solde actuel" value={`${balance.toFixed(0)} MAD`} />
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }): JSX.Element {
  return <article className="rounded-2xl border border-white/10 bg-[#061d48] p-4"><p className="text-sm text-slate-300">{label}</p><p className="mt-3 text-2xl font-bold">{value}</p></article>;
}

export function AccountFavorites(): JSX.Element {
  const { scopedState } = useUser();
  const favorites = scopedState?.favorites ?? [];
  const items = platformEvents.filter((event) => favorites.includes(event.slug));
  if (!items.length) return <Empty title="Aucun favori" subtitle="Ajoutez des événements à vos favoris pour les retrouver ici." />;
  return <ListSection title="Mes favoris" items={items.map((item) => ({ label: item.title, to: `/ma-fr/event/${item.slug}` }))} />;
}

export function AccountReservations(): JSX.Element {
  const { scopedState } = useUser();
  const rows = (scopedState?.reservations ?? []).flatMap((order) => order.items.map((item) => ({ label: `${item.title} • ${order.reference}`, to: '/ma-fr/confirmation' })));
  if (!rows.length) return <Empty title="Aucune réservation" subtitle="Vos réservations apparaîtront ici." />;
  return <ListSection title="Mes réservations" items={rows} />;
}

export function AccountTravels(): JSX.Element {
  const { scopedState } = useUser();
  const rows = (scopedState?.travelBookings ?? []).map((item) => ({ label: item.title, to: `/ma-fr/voyage/${item.slug}` }));
  if (!rows.length) return <Empty title="Aucun voyage" subtitle="Vos réservations voyages apparaîtront ici." />;
  return <ListSection title="Mes voyages" items={rows} />;
}

export function AccountMovies(): JSX.Element {
  const { scopedState } = useUser();
  const rows = (scopedState?.cinemaBookings ?? []).map((item) => ({ label: item.title, to: `/ma-fr/cinema/${item.slug}` }));
  if (!rows.length) return <Empty title="Aucun film" subtitle="Vos réservations cinéma apparaîtront ici." />;
  return <ListSection title="Mes films" items={rows} />;
}

export function AccountBalance(): JSX.Element {
  const { scopedState } = useUser();
  const transactions = scopedState?.balanceTransactions ?? [];
  const balance = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  return (
    <section className="rounded-3xl border border-white/10 bg-[#041743] p-6">
      <h2 className="text-2xl font-bold">Mon solde: {balance.toFixed(0)} MAD</h2>
      {!transactions.length ? <p className="mt-4 text-slate-300">Aucune transaction.</p> : (
        <table className="mt-4 w-full text-sm"><thead><tr className="text-left text-slate-300"><th>Libellé</th><th>Date</th><th>Montant</th></tr></thead><tbody>{transactions.map((txn) => <tr key={txn.id} className="border-t border-white/10"><td className="py-2">{txn.label}</td><td>{new Date(txn.createdAt).toLocaleDateString('fr-FR')}</td><td>{txn.amount} MAD</td></tr>)}</tbody></table>
      )}
    </section>
  );
}

export function AccountProfile(): JSX.Element {
  const { user, updateProfile } = useUser();
  if (!user) return <Empty title="Non connecté" subtitle="Connectez-vous." />;
  return (
    <section className="rounded-3xl border border-white/10 bg-[#041743] p-6">
      <h2 className="text-2xl font-bold">Mes informations</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input defaultValue={user.firstName} placeholder="Prénom" className="rounded bg-white/5 px-3 py-2" onBlur={(e) => updateProfile({ firstName: e.target.value })} />
        <input defaultValue={user.lastName} placeholder="Nom" className="rounded bg-white/5 px-3 py-2" onBlur={(e) => updateProfile({ lastName: e.target.value })} />
        <input defaultValue={user.email} placeholder="Email" className="rounded bg-white/5 px-3 py-2" onBlur={(e) => updateProfile({ email: e.target.value })} />
        <input defaultValue={user.phone} placeholder="Téléphone" className="rounded bg-white/5 px-3 py-2" onBlur={(e) => updateProfile({ phone: e.target.value })} />
      </div>
    </section>
  );
}

export function AccountSecurity(): JSX.Element {
  const { changePassword } = useUser();
  return (
    <section className="rounded-3xl border border-white/10 bg-[#041743] p-6">
      <h2 className="text-2xl font-bold">Sécurité</h2>
      <form className="mt-4 space-y-3" onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const msg = changePassword(String(form.get('currentPassword') ?? ''), String(form.get('newPassword') ?? ''), String(form.get('confirmPassword') ?? ''));
        alert(msg.message);
      }}>
        <input name="currentPassword" type="password" placeholder="Mot de passe actuel" className="w-full rounded bg-white/5 px-3 py-2" />
        <input name="newPassword" type="password" placeholder="Nouveau mot de passe" className="w-full rounded bg-white/5 px-3 py-2" />
        <input name="confirmPassword" type="password" placeholder="Confirmation" className="w-full rounded bg-white/5 px-3 py-2" />
        <button className="rounded-full bg-white px-4 py-2 text-[#041743]">Mettre à jour</button>
      </form>
    </section>
  );
}

export function AccountStatus(): JSX.Element {
  const [selected, setSelected] = React.useState<'deactivate' | 'delete'>('deactivate');
  return (
    <section className="rounded-3xl border border-white/10 bg-[#041743] p-6">
      <h2 className="text-2xl font-bold">Désactivation et suppression</h2>
      <div className="mt-4 space-y-2">
        <label className="flex items-center gap-2"><input type="radio" checked={selected === 'deactivate'} onChange={() => setSelected('deactivate')} /> Désactiver le compte</label>
        <label className="flex items-center gap-2"><input type="radio" checked={selected === 'delete'} onChange={() => setSelected('delete')} /> Supprimer le compte</label>
      </div>
      <button onClick={() => alert(selected === 'delete' ? 'Suppression simulée.' : 'Désactivation simulée.')} className="mt-4 rounded-full bg-red-500 px-4 py-2">{selected === 'delete' ? 'Supprimer mon compte' : 'Désactiver mon compte'}</button>
    </section>
  );
}

function Empty({ title, subtitle }: { title: string; subtitle: string }): JSX.Element {
  return <section className="rounded-3xl border border-white/10 bg-[#041743] p-8"><h2 className="text-2xl font-bold">{title}</h2><p className="mt-2 text-slate-300">{subtitle}</p></section>;
}

function ListSection({ title, items }: { title: string; items: Array<{ label: string; to: string }> }): JSX.Element {
  return (
    <section className="rounded-3xl border border-white/10 bg-[#041743] p-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="mt-4 space-y-2">{items.map((item) => <Link key={`${item.to}-${item.label}`} to={item.to} className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2">{item.label}</Link>)}</div>
    </section>
  );
}
