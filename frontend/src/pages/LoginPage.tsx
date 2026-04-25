import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

function roleHome(role: 'client' | 'organizer' | 'admin'): string {
  if (role === 'organizer') return '/ma-fr/organizer';
  if (role === 'admin') return '/ma-fr/admin';
  return '/ma-fr/account';
}

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    if (!result.ok) {
      setMessage(result.message ?? 'Erreur');
      setLoading(false);
      return;
    }
    navigate(roleHome(result.role ?? 'client'));
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#041743] shadow-sm lg:grid lg:grid-cols-2">
      <aside className="hidden bg-gradient-to-br from-[#031438] to-[#0d2f6e] p-8 lg:block">
        <div className="text-xl font-bold tracking-wide text-white">Guichet.com</div>
        <p className="mt-6 text-3xl font-bold text-white">Authentification</p>
        <p className="mt-2 text-slate-200">Connectez-vous à votre espace Guichet.com</p>
      </aside>
      <div className="p-8">
        <div className="mb-5 flex justify-end gap-3 text-xs text-slate-300"><button className="rounded border border-white/20 px-2 py-1">FR</button><button className="rounded border border-white/20 px-2 py-1">EN</button></div>
        <h1 className="text-3xl font-bold text-white">Authentification</h1>
        <p className="mt-2 text-slate-300">Connectez-vous à votre espace Guichet.com</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-300"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Se souvenir de moi</label>
            <Link to="/ma-fr/forgot-password" className="text-brand-300">Mot de passe oublié ?</Link>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-60">{loading ? 'Veuillez attendre...' : 'Connexion'}</button>
        </form>
        {message && <p className="mt-3 text-sm text-red-400">{message}</p>}
        <p className="mt-4 text-sm text-slate-300">Nouveau sur Guichet ? <Link to="/ma-fr/signup" className="font-semibold text-brand-300">Créer un compte</Link></p>
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-400"><a href="#">Contact</a><a href="#">Aide</a><a href="#">Mentions légales</a></div>
      </div>
    </section>
  );
}
