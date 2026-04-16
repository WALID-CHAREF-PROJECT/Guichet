import NewsletterSection from '../components/NewsletterSection';

const featured = [
  'https://images.unsplash.com/photo-1649786137948-8f75c6f7f4c9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80'
];

const nowShowing = [
  { title: 'The Drama', duration: '01:45:00', category: 'Comédie', image: featured[0] },
  { title: 'Super Mario Galaxy Le Film', duration: '01:40:00', category: 'Action', image: featured[1] },
  { title: 'Hôtel de la Paix', duration: '01:28:00', category: 'Horreur', image: featured[3] },
  { title: 'They Will Kill You', duration: '01:34:00', category: 'Action', image: featured[2] }
];

export default function CinemaPage(): JSX.Element {
  return (
    <section className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        {featured.map((image) => <img key={image} src={image} className="h-80 w-full rounded-lg object-cover" />)}
      </div>

      <h1 className="text-5xl font-bold">Toujours à l'affiche</h1>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {nowShowing.map((movie) => (
          <article key={movie.title} className="space-y-3 rounded-lg border border-white/10 bg-[#041743] p-3">
            <img src={movie.image} alt={movie.title} className="h-72 w-full rounded-md object-cover" />
            <h2 className="font-semibold">{movie.title}</h2>
            <p className="text-sm text-slate-300">Durée: {movie.duration}</p>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-[#0f295f] px-3 py-1 text-xs">{movie.category}</span>
              <button className="rounded-full border border-white/50 px-4 py-1 text-xs">Les séances</button>
            </div>
          </article>
        ))}
      </div>
      <NewsletterSection />
    </section>
  );
}
