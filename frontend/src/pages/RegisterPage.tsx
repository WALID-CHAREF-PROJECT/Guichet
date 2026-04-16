import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUsers, saveUsers, setCurrentUser } from '../services/storage';

export default function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  function onSubmit(event: FormEvent): void {
    event.preventDefault();

    const users = getUsers();
    const alreadyExists = users.some((user) => user.email === email.trim());

    if (alreadyExists) {
      setMessage('Cet email est déjà utilisé.');
      return;
    }

    users.push({ name: name.trim(), email: email.trim(), password, role: 'user' });
    saveUsers(users);
    setCurrentUser({ name: name.trim(), email: email.trim() });
    window.dispatchEvent(new Event('ticketflow:update'));
    navigate('/events');
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-slate-900">Inscription</h1>
      <p className="mt-2 text-slate-600">Créez votre compte pour réserver vos places plus vite.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom complet" className="w-full rounded border px-3 py-2" />
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="w-full rounded border px-3 py-2" />
        <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe (6 caractères minimum)" className="w-full rounded border px-3 py-2" />
        <button type="submit" className="w-full rounded bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600">Créer mon compte</button>
      </form>
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      <p className="mt-4 text-sm text-slate-600">
        Vous avez déjà un compte ?{' '}
        <Link to="/login" className="font-semibold text-brand-600">Se connecter</Link>
      </p>
    </section>
  );
}
