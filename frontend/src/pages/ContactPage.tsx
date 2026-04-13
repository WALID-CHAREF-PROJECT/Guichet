import { FormEvent, useState } from 'react';

export default function ContactPage(): JSX.Element {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent): void {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="mt-2 text-slate-600">Une question sur une réservation ? Écrivez-nous.</p>
      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <input required placeholder="Nom" className="rounded border px-3 py-2" />
        <input type="email" required placeholder="Email" className="rounded border px-3 py-2" />
        <textarea required placeholder="Votre message" rows={5} className="rounded border px-3 py-2" />
        <button className="w-fit rounded bg-brand-600 px-4 py-2 text-white hover:bg-brand-700" type="submit">Envoyer</button>
      </form>
      {sent && <p className="mt-3 text-green-700">Message envoyé avec succès.</p>}
    </section>
  );
}
