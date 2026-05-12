import { ReactNode } from 'react';
import { formatMad } from '../../services/commerce/utils';
import { PublicPlanZone } from '../../services/publicApi';
import { defaultZoneColor, isZoneSelectable, unavailableColor, zoneBackground } from './planUtils';

export function SeatDots({ zone, rows = 4, columns = 12, compact = false, curved = false }: { zone: PublicPlanZone; rows?: number; columns?: number; compact?: boolean; curved?: boolean }): JSX.Element {
  const totalSeats = rows * columns;
  const unavailableEvery = Math.max(5, Math.round(totalSeats / Math.max(1, Math.min(10, Math.round(zone.availableCapacity / 24)))));
  return (
    <div className="flex flex-col items-center gap-1" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`${zone.id}-row-${rowIndex}`} className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, width: curved ? `${88 + rowIndex * 3}%` : '100%' }}>
          {Array.from({ length: columns }).map((__, colIndex) => {
            const index = rowIndex * columns + colIndex;
            const visuallyUnavailable = !isZoneSelectable(zone) || index % unavailableEvery === 0;
            return <span key={`${zone.id}-seat-${index}`} className={`${compact ? 'h-1.5 w-1.5' : 'h-2 w-2'} rounded-full shadow-sm`} style={{ backgroundColor: visuallyUnavailable ? unavailableColor : zone.color || defaultZoneColor, opacity: visuallyUnavailable ? 0.7 : 1 }} />;
          })}
        </div>
      ))}
    </div>
  );
}

export default function ZoneButton({ zone, selectedId, onSelect, className = '', children, labelClassName = '' }: { zone?: PublicPlanZone; selectedId?: string; onSelect: (zone: PublicPlanZone) => void; className?: string; children?: ReactNode; labelClassName?: string }): JSX.Element | null {
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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.34),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.16),transparent_45%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-2 text-white drop-shadow">
        <div className={labelClassName}>
          <p className="text-xs font-black uppercase tracking-wide sm:text-sm">{zone.name}</p>
          <p className="text-[11px] font-semibold text-white/90">{zone.label}</p>
        </div>
        {children ?? <SeatDots zone={zone} compact={className.includes('min-h-[76px]')} />}
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold sm:text-xs">
          <span className="rounded-full bg-black/25 px-2 py-1">{formatMad(zone.price)}</span>
          <span>{zone.availableCapacity}/{zone.capacity}</span>
        </div>
      </div>
    </button>
  );
}
