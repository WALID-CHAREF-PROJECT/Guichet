const trips = [
  {
    title: 'Escapade Atlas',
    description: 'Week-end aventure dans l’Atlas avec guide local, transport et activités inclus.',
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Voyage Essaouira',
    description: 'Profitez de la côte, de la médina et d’une expérience culinaire marocaine unique.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function VoyagesPage(): JSX.Element {
  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-bold">Voyages</h1>
      <p className="text-slate-600">Réservez vos prochaines expériences de voyage et découvertes locales.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {trips.map((trip) => (
          <article key={trip.title} className="overflow-hidden rounded-2xl border bg-white">
            <img src={trip.image} alt={trip.title} className="h-52 w-full object-cover" />
            <div className="p-4">
              <h2 className="font-semibold">{trip.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{trip.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
