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

  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setMessage(result.message ?? 'Erreur');
      return;
    }
    navigate(roleHome(result.role ?? 'client'));
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#041743] p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-white">Connexion</h1>
      <p className="mt-2 text-slate-300">Connectez-vous pour gérer vos billets facilement.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <button type="submit" className="w-full rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">Se connecter</button>
      </form>
      {message && <p className="mt-3 text-sm text-red-400">{message}</p>}
      <p className="mt-4 text-sm text-slate-300">
        Nouveau sur Guichet ?{' '}
        <Link to="/ma-fr/signup" className="font-semibold text-brand-300">Créer un compte</Link>
      </p>
    </section>
  );
}
