import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export default function RegisterPage(): JSX.Element {
  const navigate = useNavigate();
  const { register } = useUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'client' | 'organizer'>('client');
  const [companyName, setCompanyName] = useState('');
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [message, setMessage] = useState('');

  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!terms) {
      setMessage('Vous devez accepter les conditions.');
      return;
    }

    const result = register({ firstName, lastName, email, password, phone, role, companyName: role === 'organizer' ? companyName : undefined });

    if (!result.ok) {
      setMessage(result.message ?? 'Erreur inscription');
      return;
    }

    void marketing;
    navigate(role === 'organizer' ? '/ma-fr/organizer' : '/ma-fr/account');
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#041743] p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-white">Inscription</h1>
      <p className="mt-2 text-slate-300">Créez un compte Guichet et démarrez avec un espace vide personnel.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setRole('client')} className={`rounded-lg px-3 py-2 text-sm ${role === 'client' ? 'bg-white text-[#041743]' : 'border border-white/20 text-white'}`}>Client</button>
          <button type="button" onClick={() => setRole('organizer')} className={`rounded-lg px-3 py-2 text-sm ${role === 'organizer' ? 'bg-white text-[#041743]' : 'border border-white/20 text-white'}`}>Organisateur</button>
        </div>
        <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom de famille" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        {role === 'organizer' && <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nom de l'entreprise" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />}
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Numéro mobile" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> J'accepte les conditions générales</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Recevoir les nouveautés</label>
        <button type="submit" className="w-full rounded bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600">Créer mon compte</button>
      </form>
      {message && <p className="mt-3 text-sm text-red-400">{message}</p>}
      <p className="mt-4 text-sm text-slate-300">
        Vous avez déjà un compte ?{' '}
        <Link to="/ma-fr/login" className="font-semibold text-brand-300">Se connecter</Link>
      </p>
    </section>
  );
}
