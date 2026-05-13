import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';


const primaryMenu = [
  { to: '/ma-fr/account/profile', label: 'Mes informations', icon: '👤' },
  { to: '/ma-fr/account/security', label: 'Mot de passe', icon: '🔐' },
  { to: '/ma-fr/account/reservations', label: 'Mes réservations', icon: '🎟️' },
  { to: '/ma-fr/account/travels', label: 'Mes voyages', icon: '✈️' },
  { to: '/ma-fr/account/favorites', label: 'Mes favoris', icon: '❤️' },
  { to: '/ma-fr/account/balance', label: 'Mon solde', icon: '💳' },
];

const helpMenu = [
  { to: '/ma-fr/account/help/contact', label: 'Contacter le service client' },
  { to: '/ma-fr/account/help/legal', label: 'Conditions légales' },
  { to: '/ma-fr/account/help/faq', label: 'F.A.Q' },
  { to: '/ma-fr/account/help/refund', label: 'Politique de remboursement' },
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

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'G';
  const navClass = ({ isActive }: { isActive: boolean }): string => `flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm transition ${isActive ? 'border-orange-300/60 bg-orange-400/15 font-semibold text-white shadow-[0_10px_28px_rgba(249,115,22,0.14)]' : 'border-transparent bg-white/[0.04] text-slate-200 hover:border-white/15 hover:bg-white/[0.08] hover:text-white'}`;

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-[#071b45] via-[#041743] to-[#020b22] p-4 text-white shadow-[0_20px_55px_rgba(2,8,28,0.55)] lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-300 to-orange-600 text-lg font-black text-[#041743] shadow-lg shadow-orange-500/20">{initials}</div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold">{user.firstName} {user.lastName}</p>
              <p className="truncate text-xs text-slate-300">{user.email}</p>
            </div>
          </div>
          <Link to="/ma-fr/account" className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#020b22]/50 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10">
            <span>Tableau de bord</span><span>→</span>
          </Link>
        </div>

        <nav className="mt-5 space-y-2" aria-label="Menu du compte">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Compte</p>
          {primaryMenu.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              <span aria-hidden>{item.icon}</span><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Aide</p>
          <div className="mt-2 space-y-1.5">
            {helpMenu.map((item) => <NavLink key={item.to} to={item.to} className={navClass}>{item.label}</NavLink>)}
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/ma-fr/login');
          }}
          className="mt-6 w-full rounded-2xl border border-red-300/35 bg-red-500/15 px-4 py-3 text-left text-sm font-semibold text-red-100 transition hover:bg-red-500/25"
        >
          Se déconnecter
        </button>
      </aside>
      <main className="min-w-0 overflow-hidden">
        <Outlet />
      </main>
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
  const { favorites, removeFavorite } = useUser();
  if (!favorites.length) return <Empty title="Aucun favori" subtitle="Ajoutez des événements, films et voyages à vos favoris pour les retrouver ici." />;
  return (
    <section className="rounded-3xl border border-white/10 bg-[#041743] p-6">
      <h2 className="text-2xl font-bold">Mes favoris</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {favorites.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <Link to={item.route} className="block">
              <img src={item.image || 'https://placehold.co/800x480/0B2557/FFFFFF?text=Favori'} alt={item.title} className="h-36 w-full object-cover" />
            </Link>
            <div className="space-y-1 p-3 text-sm">
              <p className="text-xs uppercase text-orange-300">{item.itemType}</p>
              <Link to={item.route} className="block font-semibold hover:text-orange-200">{item.title}</Link>
              {item.location ? <p className="text-slate-300">📍 {item.location}</p> : null}
              {item.date ? <p className="text-slate-300">📅 {item.date}</p> : null}
              <div className="mt-2 flex items-center gap-2">
                <Link to={item.route} className="rounded-full border border-white/40 px-3 py-1 text-xs">Ouvrir</Link>
                <button onClick={() => removeFavorite(item.itemId, item.itemType)} className="rounded-full bg-white px-3 py-1 text-xs text-[#041743]">Retirer</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
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


export function AccountHelpPlaceholder({ title, subtitle }: { title: string; subtitle?: string }): JSX.Element {
  return <Empty title={title} subtitle={subtitle ?? 'Cette rubrique sera bientôt disponible. Notre équipe prépare une page claire et complète.'} />;
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
