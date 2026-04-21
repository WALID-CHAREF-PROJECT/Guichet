import { Link, useParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import { voyages } from '../services/platformData';

export default function VoyageDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const voyage = voyages.find((item) => item.slug === slug);

  if (!voyage) return <p>Voyage introuvable.</p>;

  return (
    <section className="space-y-8">
      <ServiceTabs active="voyage" />
      <Link to="/ma-fr/voyage" className="text-sm text-slate-300">← Retour aux voyages</Link>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <img src={voyage.image} alt={voyage.title} className="h-full min-h-80 w-full rounded-2xl object-cover" />
        <article className="space-y-4 rounded-2xl bg-white/10 p-6">
          <p className="text-sm text-orange-400">{voyage.location}</p>
          <h1 className="text-3xl font-bold">{voyage.title}</h1>
          <p className="text-sm text-slate-200">{voyage.departureDate}</p>
          <p className="text-2xl font-semibold">{voyage.price}</p>
          <button className="w-full rounded-full bg-white px-6 py-3 font-semibold text-[#031438]">Découvrez les dates de départ</button>
        </article>
      </div>
    </section>
  );
}
