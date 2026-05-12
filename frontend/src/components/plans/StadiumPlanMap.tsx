import { PublicPlanZone } from '../../services/publicApi';
import PlanLegend from './PlanLegend';
import ZoneButton, { SeatDots } from './ZoneButton';
import { findZone, nameIncludes, PlanZoneSelect, sortedZones } from './planUtils';

export default function StadiumPlanMap({ zones, selectedId, onSelect }: { zones: PublicPlanZone[]; selectedId?: string; onSelect: PlanZoneSelect }): JSX.Element {
  const orderedZones = sortedZones(zones);
  const nord = findZone(orderedZones, [nameIncludes('tribune nord'), nameIncludes('north')], 0);
  const sud = findZone(orderedZones, [nameIncludes('tribune sud'), nameIncludes('south')], 1);
  const est = findZone(orderedZones, [nameIncludes('tribune est'), nameIncludes('east')], 2);
  const ouest = findZone(orderedZones, [nameIncludes('tribune ouest'), nameIncludes('west')], 3);
  const virageNord = findZone(orderedZones, [nameIncludes('virage nord')], 4);
  const virageSud = findZone(orderedZones, [nameIncludes('virage sud')], 5);
  const vip = findZone(orderedZones, [nameIncludes('vip'), nameIncludes('premium'), nameIncludes('loge')], 6);
  const usedIds = new Set([nord, sud, est, ouest, virageNord, virageSud, vip].filter(Boolean).map((zone) => zone?.id));
  const extraZones = orderedZones.filter((zone) => !usedIds.has(zone.id));

  return (
    <div className="rounded-[1.75rem] bg-slate-100 p-3 text-slate-900 shadow-inner sm:p-5">
      <PlanLegend zones={orderedZones} />
      <div className="mx-auto max-w-5xl overflow-x-auto rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-200 p-4 shadow-xl">
        <div className="relative mx-auto grid min-w-[720px] max-w-4xl grid-cols-[1fr_1.25fr_1.25fr_1fr] grid-rows-[88px_88px_250px_88px_88px] gap-2 rounded-[2rem] bg-slate-200/70 p-3">
          <ZoneButton zone={virageNord} selectedId={selectedId} onSelect={onSelect} className="col-span-1 rounded-tl-[4rem] rounded-br-[1.25rem]" />
          <ZoneButton zone={nord} selectedId={selectedId} onSelect={onSelect} className="col-span-2 rounded-t-[4rem]">
            {nord && <SeatDots zone={nord} rows={3} columns={22} compact curved />}
          </ZoneButton>
          <ZoneButton zone={vip} selectedId={selectedId} onSelect={onSelect} className="col-span-1 rounded-tr-[4rem] rounded-bl-[1.25rem]" />

          <div className="col-span-1 row-span-3 grid gap-2">
            <ZoneButton zone={ouest} selectedId={selectedId} onSelect={onSelect} className="min-h-full rounded-l-[4rem]" labelClassName="[writing-mode:vertical-rl] rotate-180 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <div className="col-span-2 row-span-3 flex items-center justify-center rounded-[2rem] border-[10px] border-white bg-emerald-600 p-4 shadow-inner">
            <div className="relative h-full w-full overflow-hidden rounded-[1.3rem] border-2 border-white/80 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.12)_0_12%,rgba(16,185,129,0.18)_12%_24%)]">
              <div className="absolute inset-y-8 left-1/2 w-px bg-white/80" />
              <div className="absolute left-8 top-1/2 h-24 w-16 -translate-y-1/2 rounded-r-full border-2 border-l-0 border-white/80" />
              <div className="absolute right-8 top-1/2 h-24 w-16 -translate-y-1/2 rounded-l-full border-2 border-r-0 border-white/80" />
              <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/80" />
              <div className="flex h-full flex-col items-center justify-center text-center text-white drop-shadow">
                <span className="text-xs font-black uppercase tracking-[0.45em] sm:text-sm">Terrain</span>
                <span className="mt-2 text-xs font-semibold text-white/90">Pitch / Mal3ab</span>
              </div>
            </div>
          </div>
          <div className="col-span-1 row-span-3 grid gap-2">
            <ZoneButton zone={est} selectedId={selectedId} onSelect={onSelect} className="min-h-full rounded-r-[4rem]" labelClassName="[writing-mode:vertical-rl] absolute right-3 top-1/2 -translate-y-1/2" />
          </div>

          <ZoneButton zone={virageSud} selectedId={selectedId} onSelect={onSelect} className="col-span-1 rounded-bl-[4rem] rounded-tr-[1.25rem]" />
          <ZoneButton zone={sud} selectedId={selectedId} onSelect={onSelect} className="col-span-2 rounded-b-[4rem]">
            {sud && <SeatDots zone={sud} rows={3} columns={22} compact curved />}
          </ZoneButton>
          <div className="col-span-1 rounded-br-[4rem] bg-white/70" />
        </div>
        {extraZones.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{extraZones.map((zone) => <ZoneButton key={zone.id} zone={zone} selectedId={selectedId} onSelect={onSelect} className="min-h-[90px] rounded-3xl" />)}</div>}
      </div>
    </div>
  );
}
