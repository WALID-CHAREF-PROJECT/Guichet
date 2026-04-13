import { FormEvent, useState } from 'react';
import { subscribeNewsletter } from '../services/api';

export default function NewsletterSection(): JSX.Element {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);
    try {
      const res = await subscribeNewsletter(email.trim());
      setMessage(res.message);
      setEmail('');
    } catch (error) {
      const fallbackMessage = 'Erreur lors de la souscription.';
      if (error instanceof Error) {
        setMessage(error.message || fallbackMessage);
      } else {
        setMessage(fallbackMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl bg-gradient-to-r from-blue-50 to-orange-50 p-8">
      <h2 className="text-2xl font-semibold text-slate-900">Recevez les nouveautés TicketFlow</h2>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 md:flex-row">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Votre email" className="flex-1 rounded border border-blue-200 px-3 py-2" />
        <button type="submit" disabled={isSubmitting} className="rounded bg-orange-500 px-5 py-2 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300">
          {isSubmitting ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </section>
  );
}
