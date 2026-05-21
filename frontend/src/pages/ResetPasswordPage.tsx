import { FormEvent, useState } from 'react';
import { resetPassword } from '../services/api/authClient';

export default function ResetPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    try {
      const result = await resetPassword({ email, token, password, password_confirmation: confirmPassword });
      setMessage(result.message);
    } catch (error) {
      setMessage((error as Error).message);
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card auth-card-compact">
        <div className="auth-brand-row">
          <span className="auth-brand-icon">🛡️</span>
          <div>
            <p className="auth-kicker">Restauration d'accès</p>
            <h1 className="auth-title">Réinitialiser le mot de passe</h1>
          </div>
        </div>
        <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="auth-input" />
          <input required value={token} onChange={(e) => setToken(e.target.value)} placeholder="Token/code" className="auth-input" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nouveau mot de passe" className="auth-input" />
          <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmer mot de passe" className="auth-input" />
          <button type="submit" className="auth-button">Réinitialiser</button>
        </form>
        {message && <p className="auth-message auth-message-success">{message}</p>}
      </div>
    </section>
  );
}
