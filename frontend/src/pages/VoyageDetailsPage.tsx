import { Link, useParams } from 'react-router-dom';
import ServiceTabs from '../components/ServiceTabs';
import { voyages } from '../services/platformData';
import { useState } from 'react';
import TravelReservationModal from '../components/commerce/TravelReservationModal';

export default function VoyageDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const voyage = voyages.find((item) => item.slug === slug);
  const [modalOpen, setModalOpen] = useState(false);
  const [openProgramme, setOpenProgramme] = useState(0);

  if (!voyage) return <p>Voyage introuvable.</p>;

  return (
    <section className="space-y-8">
      <ServiceTabs active="voyage" />
      <Link to="/ma-fr/voyage" className="text-sm text-slate-300">← Retour aux voyages</Link>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-3 sm:grid-cols-2">
          <img src={voyage.image} alt={voyage.title} className="h-80 w-full rounded-2xl object-cover sm:col-span-2" />
          <img src={voyage.image} alt={voyage.title} className="h-40 w-full rounded-2xl object-cover" />
          <img src={voyage.image} alt={voyage.title} className="h-40 w-full rounded-2xl object-cover" />
        </div>
        <article className="space-y-4 rounded-2xl border border-white/10 bg-white/10 p-6">
          <p className="text-sm text-orange-400">{voyage.location}</p>
          <h1 className="text-3xl font-bold">{voyage.title}</h1>
          <p className="text-sm text-slate-200">{voyage.departureDate}</p>
          <p className="text-2xl font-semibold">{voyage.price}</p>
          <div className="rounded-xl border border-white/10 bg-[#0b2557] p-3 text-sm text-slate-200">
            <p>Départs disponibles: 15 mars, 29 mars, 12 avril</p>
          </div>
          <button onClick={() => setModalOpen(true)} className="w-full rounded-full bg-white px-6 py-3 font-semibold text-[#031438]">Réservez maintenant</button>
        </article>
      </div>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-[#041743] p-5">
        <h2 className="text-2xl font-semibold">Programme du voyage</h2>
        {['Jour 1-3: Arrivée et visites', 'Jour 4-6: Activités premium', 'Jour 7+: Temps libre et retour'].map((item, index) => (
          <div key={item} className="rounded-xl border border-white/10 bg-white/5">
            <button onClick={() => setOpenProgramme((prev) => (prev === index ? -1 : index))} className="flex w-full items-center justify-between px-4 py-3 text-left">
              <span>{item}</span><span>{openProgramme === index ? '−' : '+'}</span>
            </button>
            {openProgramme === index && <p className="px-4 pb-4 text-sm text-slate-300">Programme détaillé, hébergements, transferts et excursions inclus selon l’option choisie.</p>}
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Offres similaires</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {voyages.filter((item) => item.slug !== voyage.slug).map((item) => (
            <Link key={item.slug} to={`/ma-fr/voyage/${item.slug}`} className="overflow-hidden rounded-xl border border-white/10 bg-[#041743]">
              <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
              <div className="p-3 text-sm">{item.title}</div>
            </Link>
          ))}
        </div>
      </section>

      <TravelReservationModal voyage={voyage} open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
