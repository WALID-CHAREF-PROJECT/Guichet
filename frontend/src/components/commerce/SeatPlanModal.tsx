import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlatformEvent, PlanType } from '../../services/platformData';
import { getEventPlan, PublicPlanZone } from '../../services/publicApi';
import { useCart } from '../../contexts/CartContext';
import { formatMad, uid } from '../../services/commerce/utils';
import ModalShell from './ModalShell';
import QuantityStepper from './QuantityStepper';

const fallbackZones: Record<Exclude<PlanType, 'generic'>, PublicPlanZone[]> = {
  theatre: [
    { id: 'orchestre', name: 'Orchestre', label: 'Face scène', price: 280, capacity: 220, availableCapacity: 180, available: true, color: '#38bdf8', planType: 'theatre' },
    { id: 'balcon', name: 'Balcon', label: 'Vue surélevée', price: 180, capacity: 140, availableCapacity: 100, available: true, color: '#818cf8', planType: 'theatre' },
    { id: 'mezzanine', name: 'Mezzanine', label: 'Centre mezzanine', price: 220, capacity: 90, availableCapacity: 45, available: true, color: '#a78bfa', planType: 'theatre' },
    { id: 'vip', name: 'VIP', label: 'Loges premium', price: 520, capacity: 32, availableCapacity: 12, available: true, color: '#f59e0b', planType: 'theatre' },
  ],
  stadium: [
    { id: 'nord', name: 'Tribune Nord', label: 'Virage Nord', price: 120, capacity: 1200, availableCapacity: 640, available: true, color: '#22c55e', planType: 'stadium' },
    { id: 'sud', name: 'Tribune Sud', label: 'Virage Sud', price: 120, capacity: 1200, availableCapacity: 580, available: true, color: '#14b8a6', planType: 'stadium' },
    { id: 'est', name: 'Tribune Est', label: 'Latérale Est', price: 180, capacity: 900, availableCapacity: 340, available: true, color: '#3b82f6', planType: 'stadium' },
    { id: 'ouest', name: 'Tribune Ouest', label: 'Latérale Ouest', price: 220, capacity: 820, availableCapacity: 260, available: true, color: '#6366f1', planType: 'stadium' },
    { id: 'vip', name: 'VIP', label: 'Salon premium', price: 650, capacity: 120, availableCapacity: 40, available: true, color: '#f97316', planType: 'stadium' },
  ],
};

function planZones(planType: PlanType | null | undefined): PublicPlanZone[] {
  return planType === 'stadium' ? fallbackZones.stadium : fallbackZones.theatre;
}

function TheatreLayout({ zones, selectedId, onSelect }: { zones: PublicPlanZone[]; selectedId?: string; onSelect: (zone: PublicPlanZone) => void }): JSX.Element {
  return (
    <div className="rounded-3xl bg-slate-100 p-5 text-slate-900">
      <div className="mx-auto mb-6 h-10 w-72 rounded-b-[50%] bg-slate-950 text-center text-xs font-black uppercase tracking-[0.45em] text-white shadow-xl">Scène</div>
      <div className="mx-auto grid max-w-2xl gap-4">
        {zones.map((zone, index) => (
          <button
            key={zone.id}
            onClick={() => onSelect(zone)}
            disabled={!zone.available}
            className={`min-h-[74px] rounded-[999px] border-4 p-4 text-left shadow-sm transition ${selectedId === zone.id ? 'scale-[1.02] border-slate-950 ring-4 ring-orange-300' : 'border-white hover:scale-[1.01]'} ${!zone.available ? 'cursor-not-allowed opacity-40' : ''}`}
            style={{ background: zone.color, marginInline: `${index * 22}px` }}
          >
            <div className="flex items-center justify-between gap-3 text-white drop-shadow">
              <span className="font-black">{zone.name}</span>
              <span className="rounded-full bg-black/25 px-3 py-1 text-sm font-bold">{formatMad(zone.price)}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-white/90">{zone.availableCapacity} places disponibles · {zone.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StadiumLayout({ zones, selectedId, onSelect }: { zones: PublicPlanZone[]; selectedId?: string; onSelect: (zone: PublicPlanZone) => void }): JSX.Element {
  const byName = (needle: string) => zones.find((zone) => zone.name.toLowerCase().includes(needle)) ?? zones[0];
  const layout = [byName('nord'), byName('ouest'), byName('vip'), byName('est'), byName('sud')].filter(Boolean);
  return (
    <div className="rounded-3xl bg-slate-100 p-5 text-slate-900">
      <div className="grid grid-cols-3 gap-3">
        <ZoneButton className="col-span-3 rounded-t-[3rem]" zone={layout[0]} selectedId={selectedId} onSelect={onSelect} />
        <ZoneButton className="min-h-[190px] rounded-l-[3rem]" zone={layout[1]} selectedId={selectedId} onSelect={onSelect} />
        <div className="flex min-h-[190px] flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-inner">
          <span className="font-black uppercase tracking-[0.4em]">Terrain</span>
          <span className="mt-2 text-xs font-semibold">mal3ab / pitch</span>
        </div>
        <ZoneButton className="min-h-[190px] rounded-r-[3rem]" zone={layout[3]} selectedId={selectedId} onSelect={onSelect} />
        <ZoneButton className="col-span-2 rounded-b-[3rem]" zone={layout[4]} selectedId={selectedId} onSelect={onSelect} />
        <ZoneButton className="rounded-3xl" zone={layout[2]} selectedId={selectedId} onSelect={onSelect} />
      </div>
    </div>
  );
}

function ZoneButton({ zone, selectedId, onSelect, className }: { zone: PublicPlanZone; selectedId?: string; onSelect: (zone: PublicPlanZone) => void; className?: string }): JSX.Element {
  return (
    <button
      onClick={() => onSelect(zone)}
      disabled={!zone.available}
      className={`border-4 border-white p-4 text-left text-white shadow-sm transition hover:scale-[1.01] ${selectedId === zone.id ? 'ring-4 ring-orange-300' : ''} ${!zone.available ? 'cursor-not-allowed opacity-40' : ''} ${className ?? ''}`}
      style={{ background: zone.color }}
    >
      <p className="font-black drop-shadow">{zone.name}</p>
      <p className="text-sm font-semibold drop-shadow">{formatMad(zone.price)}</p>
      <p className="text-xs font-semibold drop-shadow">{zone.availableCapacity} dispo</p>
    </button>
  );
}

export default function SeatPlanModal({ event, open, onClose }: { event: PlatformEvent; open: boolean; onClose: () => void }): JSX.Element {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const planType = event.planType === 'stadium' ? 'stadium' : event.planType === 'generic' ? 'generic' : 'theatre';
  const [zones, setZones] = useState<PublicPlanZone[]>(() => planZones(planType));
  const [selectedZone, setSelectedZone] = useState<PublicPlanZone | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!open) return;
    setSelectedZone(null);
    setQuantity(1);
    getEventPlan(event.id, planType)
      .then((payload) => setZones(payload.zones.length > 0 ? payload.zones : planZones(planType)))
      .catch(() => setZones(planZones(planType)));
  }, [event.id, open, planType]);

  const subtotal = useMemo(() => (selectedZone ? selectedZone.price * quantity : 0), [quantity, selectedZone]);
  const title = planType === 'stadium' ? 'Plan du stade' : 'Plan de salle';
  const helper = planType === 'stadium' ? 'Choisissez une tribune autour du terrain.' : 'Choisissez une zone face à la scène.';

  const continueFlow = (): void => {
    if (!selectedZone) return;
    addItems([
      {
        id: uid('cart'),
        productType: 'event_ticket',
        slug: event.slug,
        productId: String(event.id),
        title: event.title,
        image: event.image,
        date: `${event.date} · ${event.time}`,
        location: event.location,
        ticketType: selectedZone.name,
        selectedZone: selectedZone.name,
        planType,
        quantity,
        unitPrice: selectedZone.price,
        subtotal,
      },
    ]);
    onClose();
    navigate('/ma-fr/panier');
  };

  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 lg:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-orange-200">{event.title}</p>
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-sm text-slate-300">{helper}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-white/20 p-2">✕</button>
        </div>

        {planType === 'stadium' ? <StadiumLayout zones={zones} selectedId={selectedZone?.id} onSelect={setSelectedZone} /> : <TheatreLayout zones={zones} selectedId={selectedZone?.id} onSelect={setSelectedZone} />}

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          {selectedZone ? (
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm text-slate-300">Zone sélectionnée</p>
                <p className="text-xl font-black">{selectedZone.name} · {formatMad(selectedZone.price)}</p>
                <p className="text-sm text-slate-300">{selectedZone.availableCapacity} places disponibles · Sous-total {formatMad(subtotal)}</p>
              </div>
              <QuantityStepper value={quantity} onIncrease={() => setQuantity((value) => Math.min(selectedZone.availableCapacity, value + 1))} onDecrease={() => setQuantity((value) => Math.max(1, value - 1))} />
            </div>
          ) : (
            <p className="text-sm text-slate-300">Sélectionnez une zone pour afficher le récapitulatif avant l’ajout au panier.</p>
          )}
        </div>

        <button onClick={continueFlow} disabled={!selectedZone} className="mt-6 w-full rounded-full bg-white px-6 py-3 font-bold text-[#031438] disabled:cursor-not-allowed disabled:opacity-50">
          Ajouter au panier{selectedZone ? ` · ${formatMad(subtotal)}` : ''}
        </button>
      </div>
    </ModalShell>
  );
}
