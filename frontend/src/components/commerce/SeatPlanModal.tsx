import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlatformEvent } from '../../services/platformData';
import { getEventPlan, PublicPlanZone } from '../../services/publicApi';
import { useCart } from '../../contexts/CartContext';
import { formatMad, uid } from '../../services/commerce/utils';
import PlanModal from '../plans/PlanModal';
import StadiumPlanMap from '../plans/StadiumPlanMap';
import TheatrePlanMap from '../plans/TheatrePlanMap';
import GenericPlanMap from '../plans/GenericPlanMap';
import SelectedPlanSummary from '../plans/SelectedPlanSummary';
import { isZoneSelectable, planZones, resolveZonePlanType } from '../plans/planUtils';

export default function SeatPlanModal({ event, open, onClose }: { event: PlatformEvent; open: boolean; onClose: () => void }): JSX.Element {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const planType = resolveZonePlanType(event.planType);
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
    addItems([{ id: uid('cart'), productType: 'event_ticket', slug: event.slug, productId: String(event.id), title: event.title, image: event.image, date: `${event.date} · ${event.time}`, location: event.location, ticketType: selectedZone.name, selectedZone: selectedZone.name, planType, quantity, unitPrice: selectedZone.price, subtotal }]);
    onClose();
    navigate('/ma-fr/panier');
  };

  return (
    <PlanModal open={open} onClose={onClose} eyebrow={event.title} title={title} helper={helper}>

        {planType === 'stadium' && <StadiumPlanMap zones={zones} selectedId={selectedZone?.id} onSelect={selectZone} />}
        {planType === 'theatre' && <TheatrePlanMap zones={zones} selectedId={selectedZone?.id} onSelect={selectZone} />}
        {planType === 'generic' && <GenericPlanMap zones={zones} selectedId={selectedZone?.id} onSelect={selectZone} />}

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <SelectedPlanSummary planType={planType} zone={selectedZone} quantity={quantity} subtotal={subtotal} onIncrease={() => selectedZone && setQuantity((value) => Math.min(selectedZone.availableCapacity, value + 1))} onDecrease={() => setQuantity((value) => Math.max(1, value - 1))} />
        </div>

        <button type="button" onClick={continueFlow} disabled={!selectedZone || !isZoneSelectable(selectedZone)} className="mt-6 w-full rounded-full bg-white px-6 py-3 font-bold text-[#031438] disabled:cursor-not-allowed disabled:opacity-50">
          Ajouter au panier{selectedZone ? ` · ${formatMad(subtotal)}` : ''}
        </button>
    </PlanModal>
  );
}
