const movies = [
  {
    title: 'Nuit du Cinéma Marocain',
    description: 'Projection spéciale des meilleurs films marocains avec rencontre des réalisateurs.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80'
  },
  {
    title: 'Festival Court Métrage',
    description: 'Découvrez des courts-métrages créatifs dans une ambiance cinéma conviviale.',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80'
  }
];

export default function CinemaPage(): JSX.Element {
  return (
    <section className="space-y-5">
      <h1 className="text-3xl font-bold">Cinéma</h1>
      <p className="text-slate-600">Retrouvez les événements cinéma, projections spéciales et festivals du moment.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {movies.map((movie) => (
          <article key={movie.title} className="overflow-hidden rounded-2xl border bg-white">
            <img src={movie.image} alt={movie.title} className="h-52 w-full object-cover" />
            <div className="p-4">
              <h2 className="font-semibold">{movie.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{movie.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
