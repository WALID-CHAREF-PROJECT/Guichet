export default function AboutPage(): JSX.Element {
  return (
    <section className="space-y-6">
      <div className="relative h-72 overflow-hidden rounded-3xl">
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80"
          alt="Public pendant un événement"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900/50" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl font-bold md:text-4xl">À propos de TicketFlow</h1>
          <p className="mt-2 max-w-xl text-white/90">Notre mission: rendre la billetterie simple, rapide et accessible partout au Maroc.</p>
        </div>
      </div>
      <p className="text-slate-700">TicketFlow accompagne les organisateurs et les participants avec une expérience moderne: découverte des événements, réservation sécurisée et support client réactif.</p>
    </section>
  );
}
