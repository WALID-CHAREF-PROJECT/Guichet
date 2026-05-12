import { PublicPlanZone } from '../../services/publicApi';
import PlanLegend from './PlanLegend';
import ZoneButton, { SeatDots } from './ZoneButton';
import { findZone, nameIncludes, PlanZoneSelect, sortedZones } from './planUtils';

export default function TheatrePlanMap({ zones, selectedId, onSelect }: { zones: PublicPlanZone[]; selectedId?: string; onSelect: PlanZoneSelect }): JSX.Element {
  const orderedZones = sortedZones(zones);
  const vip = findZone(orderedZones, [nameIncludes('vip'), nameIncludes('loge')], 0);
  const orchestre = findZone(orderedZones, [nameIncludes('orchestre'), nameIncludes('parterre')], 1);
  const mezzanine = findZone(orderedZones, [nameIncludes('mezzanine')], 2);
  const balcon = findZone(orderedZones, [nameIncludes('balcon')], 3);
  const galerie = findZone(orderedZones, [nameIncludes('galerie'), nameIncludes('gallery')], 4);
  const usedIds = new Set([vip, orchestre, mezzanine, balcon, galerie].filter(Boolean).map((zone) => zone?.id));
  const extraZones = orderedZones.filter((zone) => !usedIds.has(zone.id));

  return (
    <div className="rounded-[1.75rem] bg-slate-100 p-3 text-slate-900 shadow-inner sm:p-5">
      <PlanLegend zones={orderedZones} />
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white to-slate-200 p-4 shadow-xl sm:p-6">
        <div className="mx-auto mb-6 flex h-16 max-w-lg items-center justify-center rounded-b-[90%] bg-slate-950 text-xs font-black uppercase tracking-[0.45em] text-white shadow-2xl">Scène</div>
        <div className="grid gap-3 md:grid-cols-6">
          <ZoneButton zone={vip} selectedId={selectedId} onSelect={onSelect} className="min-h-[82px] rounded-[999px] px-6 md:col-span-4 md:col-start-2">
            {vip && <SeatDots zone={vip} rows={2} columns={18} compact curved />}
          </ZoneButton>
          <ZoneButton zone={orchestre} selectedId={selectedId} onSelect={onSelect} className="min-h-[165px] rounded-t-[2rem] rounded-b-[55%] px-8 md:col-span-6">
            {orchestre && <SeatDots zone={orchestre} rows={7} columns={22} curved />}
          </ZoneButton>
          <ZoneButton zone={mezzanine} selectedId={selectedId} onSelect={onSelect} className="min-h-[120px] rounded-[999px] px-8 md:col-span-4 md:col-start-2">
            {mezzanine && <SeatDots zone={mezzanine} rows={4} columns={16} curved />}
          </ZoneButton>
          <ZoneButton zone={balcon} selectedId={selectedId} onSelect={onSelect} className="min-h-[112px] rounded-[999px] px-8 md:col-span-6">
            {balcon && <SeatDots zone={balcon} rows={3} columns={24} compact curved />}
          </ZoneButton>
          <ZoneButton zone={galerie} selectedId={selectedId} onSelect={onSelect} className="min-h-[88px] rounded-t-[999px] px-8 md:col-span-6">
            {galerie && <SeatDots zone={galerie} rows={2} columns={26} compact curved />}
          </ZoneButton>
          {extraZones.map((zone) => <ZoneButton key={zone.id} zone={zone} selectedId={selectedId} onSelect={onSelect} className="min-h-[110px] rounded-3xl md:col-span-3" />)}
        </div>
      </div>
    </div>
  );
}
