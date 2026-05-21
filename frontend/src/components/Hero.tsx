import { Link } from 'react-router-dom';

export default function Hero(): JSX.Element {
  return (
    <section className="premium-surface rounded-3xl bg-gradient-to-r from-blue-700/80 via-indigo-700/80 to-orange-500/70 px-6 py-14 text-white">
      <p className="mb-2 text-sm uppercase tracking-widest text-sky-100">TicketFlow • Maroc</p>
      <h1 className="text-3xl font-bold md:text-5xl">Trouvez vos prochains événements en quelques clics</h1>
      <p className="mt-3 max-w-2xl text-white/90">Concerts, spectacles, festivals, sport et plus encore dans les principales villes du Maroc.</p>
      <Link to="/events" className="mt-6 inline-block rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-2 font-semibold text-slate-900 shadow-lg shadow-orange-900/35 transition hover:-translate-y-0.5">Explorer les événements</Link>
    </section>
  );
}
