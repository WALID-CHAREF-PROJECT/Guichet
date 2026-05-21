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
    } catch {
      setMessage('Ce champ est obligatoire.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-xl border border-sky-100/20 bg-gradient-to-br from-[#0b2148]/90 to-[#091730]/90 p-5 shadow-glass">
      <h2 className="text-lg font-bold uppercase">Restez informés!</h2>
      <p className="mt-1 text-xs text-slate-200">Soyez le premier à profiter d’offres exclusives et à être informé des dernières nouveautés.</p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrer votre adresse email"
            className="w-full rounded-full border border-sky-100/20 bg-[#0b2555] px-4 py-2 text-sm placeholder:text-slate-400"
          />
          {message && <p className="mt-2 text-xs text-amber-300">{message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="rounded-full border border-amber-300/55 bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-2 text-sm font-semibold text-[#251400] transition hover:brightness-105 disabled:opacity-70">
          {isSubmitting ? '...' : "S'inscrire"}
        </button>
      </form>
    </section>
  );
}
