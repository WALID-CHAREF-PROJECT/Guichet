import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

function roleHome(role: 'client' | 'organizer' | 'producer' | 'admin'): string {
  if (role === 'organizer' || role === 'producer') return '/ma-fr/organizer/dashboard';
  if (role === 'admin') return '/ma-fr/admin';
  return '/ma-fr/account';
}

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const result = await login(email, password);
    if (!result.ok) {
      setMessage(result.message ?? 'Erreur');
      return;
    }
    navigate(roleHome(result.role ?? 'client'));
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand-row">
          <span className="auth-brand-icon">🎟️</span>
          <div>
            <p className="auth-kicker">Guichet Premium Access</p>
            <h1 className="auth-title">Connexion</h1>
          </div>
        </div>
        <p className="auth-subtitle">Connectez-vous pour gérer vos billets, réservations et favoris facilement.</p>

        <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="auth-input" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="auth-input" />
          <button type="submit" className="auth-button">Se connecter</button>
        </form>

        {message && <p className="auth-message auth-message-error">{message}</p>}
        <p className="mt-4 text-sm text-slate-300">
          <Link to="/ma-fr/forgot-password" className="font-semibold text-brand-300">Mot de passe oublié ?</Link>
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Nouveau sur Guichet ? <Link to="/ma-fr/signup" className="font-semibold text-brand-300">Créer un compte</Link>
        </p>
      </div>
    </section>
  );
}
