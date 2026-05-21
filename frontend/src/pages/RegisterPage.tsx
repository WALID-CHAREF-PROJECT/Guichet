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
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!terms) {
      setMessage('Vous devez accepter les conditions.');
      return;
    }

    const result = await register({ firstName, lastName, email, password, phone, role: 'client' });

    if (!result.ok) {
      setMessage(result.message ?? 'Erreur inscription');
      return;
    }

    void marketing;
    navigate('/ma-fr/account');
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand-row">
          <span className="auth-brand-icon">✨</span>
          <div>
            <p className="auth-kicker">Billetterie Nouvelle Génération</p>
            <h1 className="auth-title">Inscription</h1>
          </div>
        </div>
        <p className="auth-subtitle">Créez votre compte Guichet et commencez votre expérience ticketing premium.</p>

        <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-4">
          <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className="auth-input" />
          <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom de famille" className="auth-input" />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="auth-input" />
          <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="auth-input" />
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Numéro mobile" className="auth-input" />
          <label className="auth-check-label"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /> J'accepte les conditions générales</label>
          <label className="auth-check-label"><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /> Recevoir les nouveautés</label>
          <button type="submit" className="auth-button">Créer mon compte</button>
        </form>

        {message && <p className="auth-message auth-message-error">{message}</p>}
        <p className="mt-4 text-sm text-slate-300">
          Vous avez déjà un compte ? <Link to="/ma-fr/login" className="font-semibold text-brand-300">Se connecter</Link>
        </p>
      </div>
    </section>
  );
}
