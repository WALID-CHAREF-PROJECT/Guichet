import { Link } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import { voyageCategories, voyages } from '../services/platformData';

export default function VoyagesPage(): JSX.Element {
  return (
    <section className="space-y-8">
      <ServiceTabs active="voyage" />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {voyageCategories.map((item) => <button key={item} className="shrink-0 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">{item}</button>)}
      </div>
      <h1 className="text-5xl font-bold">Les voyages les plus appréciés sur Guichet</h1>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {voyages.map((trip) => (
          <Link key={trip.slug} to={`/ma-fr/voyage/${trip.slug}`} className="overflow-hidden rounded-xl border border-white/10 bg-[#041743]">
            <img src={trip.image} alt={trip.title} className="h-64 w-full object-cover" />
            <div className="space-y-2 p-4">
              <p className="inline-block rounded bg-white/10 px-2 py-1 text-xs">{trip.location}</p>
              <h2 className="font-semibold">{trip.title}</h2>
              <p className="text-sm text-slate-300">{trip.departureDate}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{trip.price}</span>
                  {trip.oldPrice ? <span className="ml-2 text-xs text-slate-400 line-through">{trip.oldPrice}</span> : null}
                </div>
                <span className="rounded-full border border-white/50 px-4 py-1 text-xs">Voir l’offre</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
