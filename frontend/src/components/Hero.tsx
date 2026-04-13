import { Link } from 'react-router-dom';

export default function Hero(): JSX.Element {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-orange-500 px-6 py-14 text-white">
      <p className="mb-2 text-sm uppercase tracking-widest">TicketFlow • Maroc</p>
      <h1 className="text-3xl font-bold md:text-5xl">Trouvez vos prochains événements en quelques clics</h1>
      <p className="mt-3 max-w-2xl text-white/90">Concerts, spectacles, festivals, sport et plus encore dans les principales villes du Maroc.</p>
      <Link to="/events" className="mt-6 inline-block rounded bg-orange-500 px-5 py-2 font-medium text-white transition hover:bg-orange-600">Explorer les événements</Link>
    </section>
  );
}
