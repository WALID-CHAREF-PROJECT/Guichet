import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    const rawUsers = localStorage.getItem('ticketflow_users');
    const users = rawUsers ? JSON.parse(rawUsers) as Array<{ email: string; password: string; name: string }> : [];
    const foundUser = users.find((user) => user.email === email.trim() && user.password === password);

    if (!foundUser) {
      setMessage('Email ou mot de passe invalide.');
      return;
    }

    localStorage.setItem('ticketflow_current_user', JSON.stringify(foundUser));
    navigate('/events');
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">Connexion</h1>
      <p className="mt-2 text-slate-600">Connectez-vous pour gérer vos billets facilement.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="w-full rounded border px-3 py-2" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full rounded border px-3 py-2" />
        <button type="submit" className="w-full rounded bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700">Se connecter</button>
      </form>
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      <p className="mt-4 text-sm text-slate-600">
        Nouveau sur TicketFlow ?{' '}
        <Link to="/register" className="font-semibold text-brand-600">Créer un compte</Link>
      </p>
    </section>
  );
}
