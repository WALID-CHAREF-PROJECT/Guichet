import { Link } from 'react-router-dom';

const trips = [
  {
    slug: 'splendeurs-france-suisse-italie',
    title: 'Splendeurs de la France, de la Suisse et de l’Italie 9 jours inoubliables',
    city: 'Paris',
    startDate: 'Départ le 15 mars 2026',
    price: '13 900 MAD',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80'
  },
  {
    slug: 'istanbul-sharm',
    title: 'ISTANBUL & SHARM EL SHEIKH 11 jours',
    city: 'Istanbul',
    startDate: 'Départ le 04 avr. 2026',
    price: '7 900 MAD',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80'
  },
  {
    slug: 'jordanie',
    title: 'Jordanie, terre de contrastes et de merveilles',
    city: 'Amman',
    startDate: 'Départ le 04 avr. 2026',
    price: '17 500 MAD',
    image: 'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=900&q=80'
  }
];

export default function VoyagesPage(): JSX.Element {
  return (
    <section className="space-y-8">
      <h1 className="text-5xl font-bold">Les voyages les plus appréciés sur Guichet</h1>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {trips.map((trip) => (
          <article key={trip.slug} className="overflow-hidden rounded-xl border border-white/10 bg-[#041743]">
            <img src={trip.image} alt={trip.title} className="h-64 w-full object-cover" />
            <div className="space-y-2 p-4">
              <p className="inline-block rounded bg-white/10 px-2 py-1 text-xs">{trip.city}</p>
              <h2 className="font-semibold">{trip.title}</h2>
              <p className="text-sm text-slate-300">{trip.startDate}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{trip.price}</span>
                <Link to={`/voyages/${trip.slug}`} className="rounded-full border border-white/50 px-4 py-1 text-xs">Voir l’offre</Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
