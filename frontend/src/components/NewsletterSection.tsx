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
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-bold uppercase">Restez informés!</h2>
      <p className="mt-1 text-xs text-slate-300">Soyez le premier à profiter d’offres exclusives et à être informé des dernières nouveautés.</p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3 md:flex-row">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrer votre adresse email"
            className="w-full rounded-full border border-white/10 bg-[#051b48] px-4 py-2 text-sm placeholder:text-slate-400"
          />
          {message && <p className="mt-2 text-xs text-orange-400">{message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="rounded-full border border-orange-400 px-6 py-2 text-sm font-semibold text-white">
          {isSubmitting ? '...' : "S'inscrire"}
        </button>
      </form>
    </section>
  );
}
