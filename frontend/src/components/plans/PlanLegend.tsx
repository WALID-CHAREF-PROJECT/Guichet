import { formatMad } from '../../services/commerce/utils';
import { PublicPlanZone } from '../../services/publicApi';
import { sortedZones, unavailableColor, zoneBackground } from './planUtils';

export default function PlanLegend({ zones, title = 'Légende & prix' }: { zones: PublicPlanZone[]; title?: string }): JSX.Element {
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500">{title}</p>
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
