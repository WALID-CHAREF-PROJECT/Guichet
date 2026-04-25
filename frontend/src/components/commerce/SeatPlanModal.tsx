import { useEffect, useMemo, useState } from 'react';
import { PlatformEvent } from '../../services/platformData';
import ModalShell from './ModalShell';
import { useCart } from '../../contexts/CartContext';
import { formatMad, uid } from '../../services/commerce/utils';
import { useNavigate } from 'react-router-dom';
import { catalogApi, SportPlanZone } from '../../services/api/laravelApi';

export default function SeatPlanModal({ event, open, onClose }: { event: PlatformEvent & { id?: string }; open: boolean; onClose: () => void }): JSX.Element {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const [zones, setZones] = useState<SportPlanZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<SportPlanZone | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const load = async (): Promise<void> => {
      try {
        const plan = await catalogApi.sportPlan(String((event as any).id ?? event.slug));
        setZones(plan.zones);
      } catch (apiError) {
        setError((apiError as Error).message);
      }
    };
    void load();
  }, [open, event]);

  const total = useMemo(() => (selectedZone ? selectedZone.price : 0), [selectedZone]);

  const continueFlow = async (): Promise<void> => {
    if (!selectedZone) return;
    await catalogApi.selectSportPlace(String((event as any).id ?? event.slug), { zoneId: selectedZone.id, quantity: 1 });
    await addItems([
      {
        id: uid('cart'),
        productType: 'sport_ticket',
        slug: event.slug,
        title: `${event.title} · ${selectedZone.name}`,
        image: event.image,
        date: `${event.date} · ${event.time}`,
        location: event.location,
        ticketType: selectedZone.name,
        selectedSeats: [selectedZone.id],
        quantity: 1,
        unitPrice: selectedZone.price,
        subtotal: selectedZone.price
      }
    ]);
    onClose();
    navigate('/ma-fr/panier');
  };

  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Plan du terrain</h3>
          <button onClick={onClose} className="rounded-full border border-white/20 p-2">✕</button>
        </div>
        {error && <p className="mb-3 text-sm text-red-300">{error}</p>}
        <div className="rounded-2xl bg-slate-100 p-5 text-slate-900">
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-semibold">
            <span>⚫ Indisponible</span>
            <span>🟢 Zone disponible</span>
            <span>🟠 Zone sélectionnée</span>
            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))} className="rounded border border-slate-300 px-2 py-1">−</button>
              <button onClick={() => setZoom((z) => Math.min(2.4, z + 0.2))} className="rounded border border-slate-300 px-2 py-1">+</button>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-white p-6" style={{ minHeight: 360 }}>
            <div className="absolute left-1/2 top-1/2 h-24 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-emerald-600 bg-emerald-200/70" />
            <div className="absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 gap-3 transition-transform duration-300 md:grid-cols-3" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: 'center' }}>
              {zones.map((zone) => {
                const disabled = !zone.available;
                const selected = selectedZone?.id === zone.id;
                return (
                  <button
                    key={zone.id}
                    onClick={() => !disabled && setSelectedZone(zone)}
                    disabled={disabled}
                    title={disabled ? `${zone.name} indisponible` : `${zone.name} - ${formatMad(zone.price)}`}
                    className={`min-w-28 rounded-xl px-3 py-2 text-xs font-semibold ${disabled ? 'cursor-not-allowed bg-slate-300 text-slate-500' : selected ? 'bg-orange-400 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                  >
                    <div>{zone.name}</div>
                    <div>{formatMad(zone.price)}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3 flex gap-2 text-xs">
            <button onClick={() => setPan((p) => ({ ...p, x: p.x - 20 }))} className="rounded border border-slate-300 px-2 py-1">←</button>
            <button onClick={() => setPan((p) => ({ ...p, x: p.x + 20 }))} className="rounded border border-slate-300 px-2 py-1">→</button>
            <button onClick={() => setPan((p) => ({ ...p, y: p.y - 20 }))} className="rounded border border-slate-300 px-2 py-1">↑</button>
            <button onClick={() => setPan((p) => ({ ...p, y: p.y + 20 }))} className="rounded border border-slate-300 px-2 py-1">↓</button>
          </div>
        </div>
        <button onClick={() => void continueFlow()} disabled={!selectedZone} className="mt-6 w-full rounded-full bg-white px-6 py-3 font-bold text-[#031438] disabled:opacity-50">
          Continuer · Total {formatMad(total)}
        </button>
      </div>
    </ModalShell>
  );
}
