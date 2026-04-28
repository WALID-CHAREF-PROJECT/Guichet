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
    <section className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#041743] p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-white">Réinitialiser le mot de passe</h1>
      <form onSubmit={(event) => void onSubmit(event)} className="mt-6 space-y-4">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <input required value={token} onChange={(e) => setToken(e.target.value)} placeholder="Token/code" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nouveau mot de passe" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmer mot de passe" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <button type="submit" className="w-full rounded bg-brand-600 px-4 py-2 font-medium text-white">Réinitialiser</button>
      </form>
      {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
    </section>
  );
}
