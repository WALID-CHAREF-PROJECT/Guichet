import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const itinerary = [
  'Paris',
  'Paris',
  'Paris',
  'Paris - Genève - Aoste',
  'Aoste - Venise',
  'Venise - Ravenne - Assise - Rome',
  'Rome',
  'Rome'
];

const infoSections = ['Services inclus', 'Services non inclus', 'Hébergement', 'Politique du voyage', 'Bon à savoir', 'Conditions de paiement'];

export default function VoyageDetailsPage(): JSX.Element {
  const { slug = '' } = useParams();
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  const title = useMemo(
    () => (slug.includes('france') ? 'Splendeurs de la France, de la Suisse et de l’Italie 9 jours inoubliables' : 'Détails du voyage'),
    [slug]
  );

  return (
    <section className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80" alt={title} className="h-full min-h-80 w-full rounded-2xl object-cover" />
        <article className="space-y-4 rounded-2xl bg-white/10 p-6">
          <p className="text-sm text-orange-400">France - paris</p>
          <h1 className="text-3xl font-bold">{title}</h1>
          <h2 className="text-2xl font-semibold">Le voyage en bref</h2>
          <p className="text-sm text-slate-200">Un voyage exceptionnel à travers trois joyaux européens, découverte de Paris, la beauté naturelle de la Suisse et le charme éternel de l’Italie.</p>
          <button className="w-full rounded-full bg-white px-6 py-3 font-semibold text-[#031438]">Découvrez les dates de départ</button>
        </article>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-4 text-3xl font-bold">Programme du voyage</h2>
        <div className="space-y-3">
          {itinerary.map((item, idx) => {
            const day = idx + 1;
            const isOpen = openDay === day;
            return (
              <button
                key={day}
                onClick={() => setOpenDay(isOpen ? null : day)}
                className="w-full rounded-lg border border-white/15 bg-[#061b47] p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Jour {day} — {item}</p>
                  <span className="text-2xl text-orange-400">{isOpen ? '−' : '+'}</span>
                </div>
                {isOpen && <p className="mt-2 text-sm text-slate-300">Programme détaillé de la journée, visites guidées et temps libre.</p>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="mb-4 text-3xl font-bold">Tout ce que vous devez savoir sur ce voyage</h2>
        <div className="space-y-3">
          {infoSections.map((section) => {
            const isOpen = openInfo === section;
            return (
              <button key={section} onClick={() => setOpenInfo(isOpen ? null : section)} className="w-full rounded-lg border border-white/15 bg-[#061b47] p-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{section}</span>
                  <span className="text-2xl text-orange-400">{isOpen ? '−' : '+'}</span>
                </div>
                {isOpen && <p className="mt-2 text-sm text-slate-300">Informations détaillées à afficher dans cet accordéon.</p>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
