const photos = [
  'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521335629791-ce4aec67dd53?auto=format&fit=crop&w=1200&q=80'
];

export default function GalleryPage(): JSX.Element {
  return (
    <section>
      <h1 className="text-3xl font-bold">Galerie photos</h1>
      <p className="mt-2 text-slate-600">Découvrez l'ambiance de nos événements.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo} className="overflow-hidden rounded-2xl border">
            <img src={photo} alt="Événement TicketFlow" className="h-56 w-full object-cover transition hover:scale-105" />
          </div>
        ))}
      </div>
    </section>
  );
}
