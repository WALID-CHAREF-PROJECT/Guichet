import { useState } from 'react';
import NewsletterSection from '../components/NewsletterSection';

export default function SportPage(): JSX.Element {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <section className="relative space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Sport</h1>
        <button onClick={() => setShowFilters((value) => !value)} className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm">Plus de filtres</button>
      </div>

      <div className="grid place-items-center rounded-2xl border border-white/10 bg-[#03173f] py-20">
        <p className="text-center text-7xl font-light text-slate-300">BIENTÔT<br /><span className="font-semibold">DISPONIBLE</span></p>
      </div>

      {showFilters && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-white/20 bg-[#072252] p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Plus de filtres</h2>
            <button onClick={() => setShowFilters(false)}>✕</button>
          </div>
          <div className="space-y-4">
            <input className="w-full rounded-md border border-white/25 bg-transparent p-3" placeholder="Catégories" />
            <input className="w-full rounded-md border border-white/25 bg-transparent p-3" placeholder="Villes" />
            <div className="flex flex-wrap gap-2 text-sm">
              {['Choisir dans le calendrier', "Aujourd'hui", 'Cette semaine', 'ce weekend', 'Ce mois-ci'].map((label) => (
                <button key={label} className="rounded-md border border-white/25 px-3 py-2">{label}</button>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3">
              <button className="rounded-full border border-white/40 px-4 py-2">Réinitialiser</button>
              <button className="rounded-full bg-orange-500 px-5 py-2 font-semibold">Appliquer</button>
            </div>
          </div>
        </div>
      )}

      <NewsletterSection />
    </section>
  );
}
