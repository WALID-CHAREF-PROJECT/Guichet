import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlatformEvent, PlanType } from '../../services/platformData';
import { getEventPlan, PublicPlanZone } from '../../services/publicApi';
import { useCart } from '../../contexts/CartContext';
import { formatMad, uid } from '../../services/commerce/utils';
import ModalShell from './ModalShell';
import QuantityStepper from './QuantityStepper';

type SupportedPlanType = 'theatre' | 'stadium' | 'generic';
type ZoneMatcher = (zone: PublicPlanZone) => boolean;

const unavailableColor = '#cbd5e1';
const defaultZoneColor = '#f97316';

const fallbackZones: Record<SupportedPlanType, PublicPlanZone[]> = {
  theatre: [
    { id: 'orchestre-vip', name: 'Orchestre VIP', label: 'Premiers rangs premium', price: 650, capacity: 48, availableCapacity: 18, available: true, color: '#f59e0b', planType: 'theatre', sortOrder: 0 },
    { id: 'orchestre', name: 'Orchestre', label: 'Face scène', price: 320, capacity: 220, availableCapacity: 180, available: true, color: '#38bdf8', planType: 'theatre', sortOrder: 1 },
    { id: 'mezzanine', name: 'Mezzanine', label: 'Centre mezzanine', price: 260, capacity: 96, availableCapacity: 45, available: true, color: '#a78bfa', planType: 'theatre', sortOrder: 2 },
    { id: 'balcon', name: 'Balcon', label: 'Vue surélevée', price: 220, capacity: 160, availableCapacity: 100, available: true, color: '#818cf8', planType: 'theatre', sortOrder: 3 },
    { id: 'galerie', name: 'Galerie', label: 'Placement économique', price: 140, capacity: 180, availableCapacity: 120, available: true, color: '#14b8a6', planType: 'theatre', sortOrder: 4 },
  ],
  stadium: [
    { id: 'tribune-nord', name: 'Tribune Nord', label: 'Virage Nord', price: 120, capacity: 1200, availableCapacity: 640, available: true, color: '#22c55e', planType: 'stadium', sortOrder: 0 },
    { id: 'tribune-sud', name: 'Tribune Sud', label: 'Virage Sud', price: 120, capacity: 1200, availableCapacity: 580, available: true, color: '#14b8a6', planType: 'stadium', sortOrder: 1 },
    { id: 'tribune-est', name: 'Tribune Est', label: 'Latérale Est', price: 180, capacity: 900, availableCapacity: 340, available: true, color: '#3b82f6', planType: 'stadium', sortOrder: 2 },
    { id: 'tribune-ouest', name: 'Tribune Ouest', label: 'Latérale Ouest', price: 220, capacity: 820, availableCapacity: 260, available: true, color: '#6366f1', planType: 'stadium', sortOrder: 3 },
    { id: 'vip', name: 'VIP', label: 'Salon premium', price: 650, capacity: 120, availableCapacity: 40, available: true, color: '#f97316', planType: 'stadium', sortOrder: 4 },
    { id: 'virage', name: 'Virage', label: 'Supporters', price: 90, capacity: 1600, availableCapacity: 900, available: true, color: '#ef4444', planType: 'stadium', sortOrder: 5 },
  ],
  generic: [
    { id: 'premium', name: 'Premium', label: 'Meilleure visibilité', price: 360, capacity: 120, availableCapacity: 80, available: true, color: '#f59e0b', planType: 'generic', sortOrder: 0 },
    { id: 'central', name: 'Central', label: 'Zone centrale', price: 240, capacity: 240, availableCapacity: 160, available: true, color: '#38bdf8', planType: 'generic', sortOrder: 1 },
    { id: 'lateral', name: 'Latéral', label: 'Accès rapide', price: 180, capacity: 160, availableCapacity: 90, available: true, color: '#818cf8', planType: 'generic', sortOrder: 2 },
    { id: 'eco', name: 'Éco', label: 'Tarif accessible', price: 120, capacity: 220, availableCapacity: 140, available: true, color: '#14b8a6', planType: 'generic', sortOrder: 3 },
  ],
};

function resolvePlanType(planType: PlanType | null | undefined): SupportedPlanType {
  if (planType === 'stadium' || planType === 'generic') return planType;
  return 'theatre';
}

function planZones(planType: PlanType | null | undefined): PublicPlanZone[] {
  return fallbackZones[resolvePlanType(planType)];
}

function sortedZones(zones: PublicPlanZone[]): PublicPlanZone[] {
  return [...zones].sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.name.localeCompare(b.name));
}

function isZoneSelectable(zone: PublicPlanZone): boolean {
  return zone.available && zone.availableCapacity > 0;
}

function zoneBackground(zone: PublicPlanZone): string {
  return isZoneSelectable(zone) ? zone.color || defaultZoneColor : unavailableColor;
}

function findZone(zones: PublicPlanZone[], matchers: ZoneMatcher[], fallbackIndex: number): PublicPlanZone | undefined {
  return matchers.map((matcher) => zones.find(matcher)).find(Boolean) ?? zones[fallbackIndex];
}

function nameIncludes(value: string): ZoneMatcher {
  return (zone) => `${zone.name} ${zone.label}`.toLowerCase().includes(value);
}

function SeatDots({ zone, rows = 4, columns = 12, compact = false }: { zone: PublicPlanZone; rows?: number; columns?: number; compact?: boolean }): JSX.Element {
  const totalSeats = rows * columns;
  const unavailableEvery = Math.max(3, Math.round(totalSeats / Math.max(1, Math.min(10, Math.round(zone.availableCapacity / 20)))));
  return (
    <div className={`grid ${compact ? 'gap-1' : 'gap-1.5'}`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} aria-hidden="true">
      {Array.from({ length: totalSeats }).map((_, index) => {
        const visuallyUnavailable = !isZoneSelectable(zone) || index % unavailableEvery === 0;
        return (
          <span
            key={`${zone.id}-seat-${index}`}
            className={`${compact ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'} rounded-full shadow-sm`}
            style={{ backgroundColor: visuallyUnavailable ? unavailableColor : zone.color || defaultZoneColor, opacity: visuallyUnavailable ? 0.75 : 1 }}
          />
        );
      })}
    </div>
  );
}

function SeatMapZoneButton({
  zone,
  selectedId,
  onSelect,
  className = '',
  children,
}: {
  zone?: PublicPlanZone;
  selectedId?: string;
  onSelect: (zone: PublicPlanZone) => void;
  className?: string;
  children?: ReactNode;
}): JSX.Element | null {
  if (!zone) return null;
  const selectable = isZoneSelectable(zone);
  return (
    <button
      type="button"
      onClick={() => selectable && onSelect(zone)}
      disabled={!selectable}
      className={`group relative overflow-hidden border-2 p-3 text-left shadow-lg transition ${selectedId === zone.id ? 'z-10 scale-[1.025] border-slate-950 ring-4 ring-orange-300' : 'border-white hover:-translate-y-0.5 hover:border-slate-300'} ${!selectable ? 'cursor-not-allowed opacity-55 grayscale' : ''} ${className}`}
      style={{ background: zoneBackground(zone) }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.16),transparent_45%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-3 text-white drop-shadow">
        <div>
          <p className="text-sm font-black uppercase tracking-wide">{zone.name}</p>
          <p className="text-xs font-semibold text-white/90">{zone.label}</p>
        </div>
        {children ?? <SeatDots zone={zone} compact={className.includes('min-h-[86px]')} />}
        <div className="flex items-center justify-between gap-2 text-xs font-bold">
          <span className="rounded-full bg-black/25 px-2 py-1">{formatMad(zone.price)}</span>
          <span>{zone.availableCapacity} dispo</span>
        </div>
      </div>
    </button>
  );
}

function SeatMapLegend({ zones }: { zones: PublicPlanZone[] }): JSX.Element {
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500">Légende & prix</p>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
          <span className="h-3 w-3 rounded-full" style={{ background: unavailableColor }} /> Indisponible
        </span>
        {sortedZones(zones).map((zone) => (
          <span key={`legend-${zone.id}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
            <span className="h-3 w-3 rounded-full" style={{ background: zoneBackground(zone) }} /> {zone.name} · {formatMad(zone.price)}
          </span>
        ))}
      </div>
    </div>
  );
}

function TheatreSeatMap({ zones, selectedId, onSelect }: { zones: PublicPlanZone[]; selectedId?: string; onSelect: (zone: PublicPlanZone) => void }): JSX.Element {
  const orderedZones = sortedZones(zones);
  const vip = findZone(orderedZones, [nameIncludes('vip'), nameIncludes('loge')], 0);
  const orchestre = findZone(orderedZones, [nameIncludes('orchestre'), nameIncludes('parterre')], 1);
  const mezzanine = findZone(orderedZones, [nameIncludes('mezzanine')], 2);
  const balcon = findZone(orderedZones, [nameIncludes('balcon')], 3);
  const galerie = findZone(orderedZones, [nameIncludes('galerie'), nameIncludes('gallery')], 4);
  const usedIds = new Set([vip, orchestre, mezzanine, balcon, galerie].filter(Boolean).map((zone) => zone?.id));
  const extraZones = orderedZones.filter((zone) => !usedIds.has(zone.id));

  return (
    <div className="rounded-[2rem] bg-slate-100 p-4 text-slate-900 shadow-inner sm:p-5">
      <SeatMapLegend zones={orderedZones} />
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white to-slate-200 p-4 shadow-xl sm:p-6">
        <div className="mx-auto mb-5 flex h-14 max-w-md items-center justify-center rounded-b-[80%] bg-slate-950 text-xs font-black uppercase tracking-[0.45em] text-white shadow-2xl">Scène / Stage</div>
        <div className="grid gap-3 md:grid-cols-6">
          <SeatMapZoneButton zone={vip} selectedId={selectedId} onSelect={onSelect} className="md:col-span-6 min-h-[86px] rounded-[999px] px-5">
            {vip && <SeatDots zone={vip} rows={2} columns={18} />}
          </SeatMapZoneButton>
          <SeatMapZoneButton zone={orchestre} selectedId={selectedId} onSelect={onSelect} className="md:col-span-6 min-h-[170px] rounded-t-[2rem] rounded-b-[50%] px-6">
            {orchestre && <SeatDots zone={orchestre} rows={6} columns={18} />}
          </SeatMapZoneButton>
          <SeatMapZoneButton zone={mezzanine} selectedId={selectedId} onSelect={onSelect} className="md:col-span-4 md:col-start-2 min-h-[125px] rounded-[999px] px-6">
            {mezzanine && <SeatDots zone={mezzanine} rows={4} columns={14} />}
          </SeatMapZoneButton>
          <SeatMapZoneButton zone={balcon} selectedId={selectedId} onSelect={onSelect} className="md:col-span-6 min-h-[115px] rounded-[999px] px-6">
            {balcon && <SeatDots zone={balcon} rows={3} columns={20} />}
          </SeatMapZoneButton>
          <SeatMapZoneButton zone={galerie} selectedId={selectedId} onSelect={onSelect} className="md:col-span-6 min-h-[90px] rounded-t-[999px] px-6">
            {galerie && <SeatDots zone={galerie} rows={2} columns={20} />}
          </SeatMapZoneButton>
          {extraZones.map((zone) => <SeatMapZoneButton key={zone.id} zone={zone} selectedId={selectedId} onSelect={onSelect} className="min-h-[110px] rounded-3xl md:col-span-3" />)}
        </div>
      </div>
    </div>
  );
}

function StadiumSeatMap({ zones, selectedId, onSelect }: { zones: PublicPlanZone[]; selectedId?: string; onSelect: (zone: PublicPlanZone) => void }): JSX.Element {
  const orderedZones = sortedZones(zones);
  const nord = findZone(orderedZones, [nameIncludes('nord'), nameIncludes('north')], 0);
  const sud = findZone(orderedZones, [nameIncludes('sud'), nameIncludes('south')], 1);
  const est = findZone(orderedZones, [nameIncludes('est'), nameIncludes('east')], 2);
  const ouest = findZone(orderedZones, [nameIncludes('ouest'), nameIncludes('west')], 3);
  const vip = findZone(orderedZones, [nameIncludes('vip'), nameIncludes('premium')], 4);
  const virage = findZone(orderedZones, [nameIncludes('virage'), nameIncludes('support')], 5);
  const usedIds = new Set([nord, sud, est, ouest, vip, virage].filter(Boolean).map((zone) => zone?.id));
  const extraZones = orderedZones.filter((zone) => !usedIds.has(zone.id));

  return (
    <div className="rounded-[2rem] bg-slate-100 p-4 text-slate-900 shadow-inner sm:p-5">
      <SeatMapLegend zones={orderedZones} />
      <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-slate-200 bg-gradient-to-br from-white to-slate-200 p-3 shadow-xl sm:p-5">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <SeatMapZoneButton zone={nord} selectedId={selectedId} onSelect={onSelect} className="col-span-4 min-h-[95px] rounded-t-[3rem]" />
          <SeatMapZoneButton zone={ouest} selectedId={selectedId} onSelect={onSelect} className="col-span-1 min-h-[260px] rounded-l-[3rem]" />
          <div className="col-span-2 flex min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-[2rem] border-4 border-white bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-700 p-3 text-center text-white shadow-inner">
            <div className="h-full w-full rounded-[1.4rem] border-2 border-white/75 p-4">
              <div className="flex h-full flex-col items-center justify-center rounded-[1rem] border border-white/60 bg-white/10">
                <span className="text-xs font-black uppercase tracking-[0.45em] sm:text-sm">Terrain</span>
                <span className="mt-2 text-xs font-semibold text-white/85">Pitch / Mal3ab</span>
              </div>
            </div>
          </div>
          <SeatMapZoneButton zone={est} selectedId={selectedId} onSelect={onSelect} className="col-span-1 min-h-[260px] rounded-r-[3rem]" />
          <SeatMapZoneButton zone={vip} selectedId={selectedId} onSelect={onSelect} className="col-span-2 min-h-[105px] rounded-bl-[3rem]" />
          <SeatMapZoneButton zone={virage} selectedId={selectedId} onSelect={onSelect} className="col-span-2 min-h-[105px] rounded-br-[3rem]" />
          <SeatMapZoneButton zone={sud} selectedId={selectedId} onSelect={onSelect} className="col-span-4 min-h-[95px] rounded-b-[3rem]" />
          {extraZones.map((zone) => <SeatMapZoneButton key={zone.id} zone={zone} selectedId={selectedId} onSelect={onSelect} className="col-span-2 min-h-[105px] rounded-3xl" />)}
        </div>
      </div>
    </div>
  );
}

function GenericSeatMap({ zones, selectedId, onSelect }: { zones: PublicPlanZone[]; selectedId?: string; onSelect: (zone: PublicPlanZone) => void }): JSX.Element {
  const orderedZones = sortedZones(zones);
  return (
    <div className="rounded-[2rem] bg-slate-100 p-4 text-slate-900 shadow-inner sm:p-5">
      <SeatMapLegend zones={orderedZones} />
      <div className="mx-auto grid max-w-4xl gap-3 rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white to-slate-200 p-4 shadow-xl md:grid-cols-6">
        <div className="flex min-h-[105px] items-center justify-center rounded-[2rem] border-4 border-white bg-slate-900 text-xs font-black uppercase tracking-[0.35em] text-white shadow-inner md:col-span-6">Zone centrale</div>
        {orderedZones.map((zone, index) => (
          <SeatMapZoneButton
            key={zone.id}
            zone={zone}
            selectedId={selectedId}
            onSelect={onSelect}
            className={`${index === 0 ? 'md:col-span-6 min-h-[135px] rounded-[2rem]' : 'md:col-span-3 min-h-[125px] rounded-3xl'}`}
          />
        ))}
      </div>
    </div>
  );
}

function SeatMapZoneDetails({ planType, zone, quantity, subtotal, onIncrease, onDecrease }: { planType: SupportedPlanType; zone: PublicPlanZone | null; quantity: number; subtotal: number; onIncrease: () => void; onDecrease: () => void }): JSX.Element {
  if (!zone) {
    return <p className="text-sm text-slate-300">Sélectionnez une zone active sur le plan visuel pour afficher le récapitulatif avant l’ajout au panier.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="text-sm text-slate-300">Zone sélectionnée · {planType}</p>
        <p className="text-xl font-black">{zone.name} · {formatMad(zone.price)}</p>
        <p className="text-sm text-slate-300">{zone.availableCapacity} places restantes · Quantité {quantity} · Sous-total {formatMad(subtotal)}</p>
      </div>
      <QuantityStepper value={quantity} onIncrease={onIncrease} onDecrease={onDecrease} />
    </div>
  );
}

export default function SeatPlanModal({ event, open, onClose }: { event: PlatformEvent; open: boolean; onClose: () => void }): JSX.Element {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const planType = resolvePlanType(event.planType);
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

  useEffect(() => {
    if (!selectedZone) return;
    setQuantity((value) => Math.min(Math.max(1, value), Math.max(1, selectedZone.availableCapacity)));
  }, [selectedZone]);

  const subtotal = useMemo(() => (selectedZone ? selectedZone.price * quantity : 0), [quantity, selectedZone]);
  const title = planType === 'stadium' ? 'Plan du stade' : planType === 'generic' ? 'Plan interactif' : 'Plan de salle';
  const helper = planType === 'stadium' ? 'Choisissez une tribune autour du terrain.' : planType === 'generic' ? 'Choisissez une zone sur le plan visuel.' : 'Choisissez une zone face à la scène.';

  const selectZone = (zone: PublicPlanZone): void => {
    if (!isZoneSelectable(zone)) return;
    setSelectedZone(zone);
    setQuantity(1);
  };

  const continueFlow = (): void => {
    if (!selectedZone || !isZoneSelectable(selectedZone)) return;
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
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-orange-200">{event.title}</p>
            <h3 className="text-2xl font-bold">{title}</h3>
            <p className="text-sm text-slate-300">{helper}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/20 p-2">✕</button>
        </div>

        {planType === 'stadium' && <StadiumSeatMap zones={zones} selectedId={selectedZone?.id} onSelect={selectZone} />}
        {planType === 'theatre' && <TheatreSeatMap zones={zones} selectedId={selectedZone?.id} onSelect={selectZone} />}
        {planType === 'generic' && <GenericSeatMap zones={zones} selectedId={selectedZone?.id} onSelect={selectZone} />}

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <SeatMapZoneDetails
            planType={planType}
            zone={selectedZone}
            quantity={quantity}
            subtotal={subtotal}
            onIncrease={() => selectedZone && setQuantity((value) => Math.min(selectedZone.availableCapacity, value + 1))}
            onDecrease={() => setQuantity((value) => Math.max(1, value - 1))}
          />
        </div>

        <button type="button" onClick={continueFlow} disabled={!selectedZone || !isZoneSelectable(selectedZone)} className="mt-6 w-full rounded-full bg-white px-6 py-3 font-bold text-[#031438] disabled:cursor-not-allowed disabled:opacity-50">
          Ajouter au panier{selectedZone ? ` · ${formatMad(subtotal)}` : ''}
        </button>
      </div>
    </ModalShell>
  );
}
