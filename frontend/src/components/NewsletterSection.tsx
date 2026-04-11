import { FormEvent, useState } from 'react';
import { subscribeNewsletter } from '../services/api';

export default function NewsletterSection(): JSX.Element {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    try {
      const res = await subscribeNewsletter(email);
      setMessage(res.message);
      setEmail('');
    } catch {
      setMessage('Erreur lors de la souscription.');
    }
  }

  return (
    <section className="rounded-3xl bg-slate-100 p-8">
      <h2 className="text-2xl font-semibold">Recevez les nouveautés TicketFlow</h2>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 md:flex-row">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="flex-1 rounded border px-3 py-2" />
        <button className="rounded bg-brand-600 px-5 py-2 text-white">S'inscrire</button>
      </form>
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </section>
  );
}
