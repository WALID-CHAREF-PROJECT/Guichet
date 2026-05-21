import { FormEvent, useState } from 'react';
import { forgotPassword } from '../services/api/authClient';

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const result = await forgotPassword(email);
    setMessage(result.message + (result.devNote ? ` ${result.devNote}` : ''));
  }

  return (
    <section className="auth-shell">
      <div className="auth-card auth-card-compact">
        <div className="auth-brand-row">
          <span className="auth-brand-icon">🔐</span>
          <div>
            <p className="auth-kicker">Sécurité Compte</p>
            <h1 className="auth-title">Mot de passe oublié</h1>
          </div>
        </div>
        <form onSubmit={(event) => void onSubmit(event)} className="mt-8 space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="auth-input" />
          <button type="submit" className="auth-button">Envoyer le lien</button>
        </form>
        {message && <p className="auth-message auth-message-success">{message}</p>}
      </div>
    </section>
  );
}
