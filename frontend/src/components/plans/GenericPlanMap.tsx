import { PublicPlanZone } from '../../services/publicApi';
import PlanLegend from './PlanLegend';
import ZoneButton from './ZoneButton';
import { PlanZoneSelect, sortedZones } from './planUtils';

export default function GenericPlanMap({ zones, selectedId, onSelect }: { zones: PublicPlanZone[]; selectedId?: string; onSelect: PlanZoneSelect }): JSX.Element {
  const orderedZones = sortedZones(zones);
  return (
    <div className="rounded-[1.75rem] bg-slate-100 p-3 text-slate-900 shadow-inner sm:p-5">
      <PlanLegend zones={orderedZones} />
      <div className="mx-auto grid max-w-4xl gap-3 rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white to-slate-200 p-4 shadow-xl md:grid-cols-6">
        <div className="flex min-h-[96px] items-center justify-center rounded-[2rem] border-4 border-white bg-slate-900 text-xs font-black uppercase tracking-[0.35em] text-white shadow-inner md:col-span-6">Plan libre</div>
        {orderedZones.map((zone, index) => <ZoneButton key={zone.id} zone={zone} selectedId={selectedId} onSelect={onSelect} className={`${index === 0 ? 'min-h-[126px] rounded-[2rem] md:col-span-6' : 'min-h-[115px] rounded-3xl md:col-span-3'}`} />)}
      </div>
    </div>
  );
}
