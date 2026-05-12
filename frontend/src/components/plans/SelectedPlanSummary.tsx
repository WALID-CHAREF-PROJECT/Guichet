import QuantityStepper from '../commerce/QuantityStepper';
import { formatMad } from '../../services/commerce/utils';
import { PublicPlanZone } from '../../services/publicApi';
import { ZonePlanType } from './planUtils';

export default function SelectedPlanSummary({ planType, zone, quantity, subtotal, onIncrease, onDecrease }: { planType: ZonePlanType; zone: PublicPlanZone | null; quantity: number; subtotal: number; onIncrease: () => void; onDecrease: () => void }): JSX.Element {
  if (!zone) return <p className="text-sm text-slate-300">Sélectionnez une zone active sur le plan visuel pour afficher le récapitulatif avant l’ajout au panier.</p>;

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
