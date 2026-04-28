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
    <section className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#041743] p-8 shadow-sm">
      <h1 className="text-3xl font-bold text-white">Mot de passe oublié</h1>
      <form onSubmit={(event) => void onSubmit(event)} className="mt-6 space-y-4">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="w-full rounded border border-white/20 bg-white/5 px-3 py-2" />
        <button type="submit" className="w-full rounded bg-brand-600 px-4 py-2 font-medium text-white">Envoyer le lien</button>
      </form>
      {message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}
    </section>
  );
}
