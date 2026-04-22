import { Link, useSearchParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import { sports } from '../services/platformData';

export default function SportPage(): JSX.Element {
  const [searchParams] = useSearchParams();
  const filtered = sports.filter((item) => {
    const q = (searchParams.get('q') ?? '').toLowerCase();
    const city = (searchParams.get('city') ?? '').toLowerCase();
    return (!q || item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)) && (!city || item.location.toLowerCase().includes(city));
  });

  return (
    <section className="space-y-8">
      <ServiceTabs active="sport" />
      <div className="grid gap-5 md:grid-cols-2">
        {filtered.map((item) => (
          <Link key={item.id} to={`/ma-fr/event/${item.slug}`} className="overflow-hidden rounded-2xl border border-white/10 bg-[#041743]">
            <img src={item.image} alt={item.title} className="h-56 w-full object-cover" />
            <div className="space-y-1 p-4">
              <p className="text-xs uppercase tracking-wide text-orange-300">{item.category}</p>
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <p className="text-sm text-slate-300">{item.location} · {item.date}</p>
            </div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#03173f] py-12 text-center">
          <p className="text-lg font-semibold">Aucun résultat sportif</p>
          <p className="mt-2 text-slate-300">Ajustez les filtres ou revenez plus tard pour les nouveaux événements.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#03173f] py-12 text-center">
          <p className="text-slate-300">Plus d’événements sportifs arrivent bientôt.</p>
        </div>
      )}
    </section>
  );
}
