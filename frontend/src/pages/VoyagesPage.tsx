import { Link, useParams, useSearchParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import { voyageCategories, voyages } from '../services/platformData';

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function VoyagesPage(): JSX.Element {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const filtered = voyages.filter((trip) => {
    const byCategoryRoute = category ? slugify(trip.collection) === category : true;
    const q = (searchParams.get('q') ?? '').toLowerCase();
    const byQuery = !q || trip.title.toLowerCase().includes(q) || trip.location.toLowerCase().includes(q);
    const selectedCategory = (searchParams.get('category') ?? '').toLowerCase();
    const byCategoryFilter = !selectedCategory || trip.collection.toLowerCase().includes(selectedCategory);
    const city = (searchParams.get('city') ?? '').toLowerCase();
    const byCity = !city || trip.location.toLowerCase().includes(city);
    return byCategoryRoute && byQuery && byCategoryFilter && byCity;
  });

  return (
    <section className="space-y-8">
      <ServiceTabs active="voyage" />
      <div className="flex gap-2 overflow-x-auto pb-1">
        {voyageCategories.map((item) => {
          const slug = slugify(item);
          const active = category === slug;
          return (
            <Link key={item} to={`/ma-fr/travel/category/${slug}`} className={`shrink-0 rounded-full border px-4 py-2 text-sm ${active ? 'border-white bg-white text-[#041743]' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}>
              {item}
            </Link>
          );
        })}
      </div>
      <h1 className="text-5xl font-bold">Les voyages les plus appréciés sur Guichet</h1>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((trip) => (
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
      {filtered.length === 0 && <div className="rounded-2xl border border-white/10 bg-[#041743] p-8 text-center text-slate-300">Aucun voyage disponible avec ces filtres.</div>}
    </section>
  );
}
