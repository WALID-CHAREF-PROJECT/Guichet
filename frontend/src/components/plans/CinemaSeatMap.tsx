import { useMemo } from 'react';
import { formatMad } from '../../services/commerce/utils';
import { CinemaSeat, CinemaSeatCategory, MovieSession, cinemaTemplateDimensions, generateCinemaSeats } from '../../services/publicApi';

const zoneStyles: Record<CinemaSeatCategory, { dot: string; label: string }> = {
  Balcon: { dot: 'bg-blue-500', label: 'BALCON' },
  Standard: { dot: 'bg-blue-500', label: 'STANDARD' },
  VIP: { dot: 'bg-lime-500', label: 'VIP' },
  VVIP: { dot: 'bg-fuchsia-500', label: 'VVIP' },
};

function categoryPrice(seats: CinemaSeat[], category: CinemaSeatCategory): number {
  return seats.find((seat) => seat.category === category)?.price ?? 0;
}

function SeatLegend({ seats }: { seats: CinemaSeat[] }): JSX.Element {
  const legendItems: Array<{ key: string; label: string; className: string; price?: number }> = [
    { key: 'reserved', label: 'Indisponible', className: 'bg-slate-400' },
    { key: 'Balcon', label: 'BALCON', className: zoneStyles.Balcon.dot, price: categoryPrice(seats, 'Balcon') || categoryPrice(seats, 'Standard') },
    { key: 'VIP', label: 'VIP', className: zoneStyles.VIP.dot, price: categoryPrice(seats, 'VIP') },
    { key: 'VVIP', label: 'VVIP', className: zoneStyles.VVIP.dot, price: categoryPrice(seats, 'VVIP') },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] font-bold text-slate-700">
      {legendItems.map((item) => (
        <span key={item.key} className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${item.className}`} />
          <span>{item.label}{item.price ? ` · ${formatMad(item.price)}` : ''}</span>
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><span className="h-3 w-3 rounded-full border-2 border-amber-400 bg-white shadow-[0_0_0_2px_rgba(245,158,11,0.28)]" /> Sélectionné</span>
    </div>
  );
}

function SeatDot({ seat, selected, onToggleSeat }: { seat: CinemaSeat; selected: boolean; onToggleSeat: (seat: CinemaSeat) => void }): JSX.Element {
  const disabled = seat.status !== 'available';
  const color = disabled ? 'bg-slate-400 hover:bg-slate-400' : zoneStyles[seat.category].dot;
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${seat.row}${seat.number} ${seat.category} ${formatMad(seat.price)}${disabled ? ' indisponible' : ''}`}
      title={`${seat.row}${seat.number} · ${seat.category} · ${formatMad(seat.price)}${disabled ? ' · indisponible' : ''}`}
      onClick={() => !disabled && onToggleSeat(seat)}
      disabled={disabled}
      className={`h-2.5 w-2.5 shrink-0 rounded-[3px] transition sm:h-3 sm:w-3 ${color} ${disabled ? 'cursor-not-allowed opacity-80' : 'hover:scale-125 hover:shadow-md'} ${selected ? 'scale-125 ring-2 ring-amber-300 ring-offset-1 ring-offset-white shadow-[0_0_0_3px_rgba(245,158,11,0.25)]' : ''}`}
    />
  );
}

export function SelectedSeatSummary({ movieTitle, session, selectedSeats, onAddToCart }: { movieTitle: string; session: MovieSession; selectedSeats: CinemaSeat[]; onAddToCart: () => void }): JSX.Element {
  const subtotal = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const countsByCategory = selectedSeats.reduce<Record<string, { count: number; price: number }>>((acc, seat) => {
    acc[seat.category] = { count: (acc[seat.category]?.count ?? 0) + 1, price: seat.price };
    return acc;
  }, {});

  return (
    <aside className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 text-white shadow-xl">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-100">Sélection</p>
          <h4 className="text-lg font-black">{movieTitle}</h4>
          <p className="text-sm text-slate-300">{session.session_date} · {session.session_time} · {session.hallName ?? session.hall_name ?? 'Salle 1'}</p>
          <p className="text-2xl font-black text-white">{selectedSeats.length > 0 ? selectedSeats.map((seat) => `${seat.row}${seat.number}`).join(', ') : 'Aucun siège'}</p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-200">
            {Object.entries(countsByCategory).map(([category, item]) => <span key={category} className="rounded-full bg-white/10 px-3 py-1">{item.count} × {category} ({formatMad(item.price)})</span>)}
          </div>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 text-[#031438] md:min-w-48">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total</p>
          <p className="text-2xl font-black">{formatMad(subtotal)}</p>
          <p className="text-xs font-semibold text-slate-500">{selectedSeats.length} place(s)</p>
        </div>
      </div>
      <button type="button" onClick={onAddToCart} disabled={selectedSeats.length === 0} className="mt-4 w-full rounded-full bg-white px-6 py-3 font-bold text-[#031438] disabled:cursor-not-allowed disabled:opacity-50">Ajouter au panier</button>
    </aside>
  );
}

export default function CinemaSeatMap({ session, selectedSeats, onToggleSeat }: { session: MovieSession; selectedSeats: string[]; onToggleSeat: (seat: CinemaSeat) => void }): JSX.Element {
  const seats = useMemo(() => session.seats && session.seats.length > 0 ? session.seats : generateCinemaSeats(session), [session]);
  const selectedSet = new Set(selectedSeats);
  const rows = Array.from(new Set(seats.map((seat) => seat.row)));
  const dimensions = cinemaTemplateDimensions(session.seatTemplate);

  return (
    <div className="rounded-[1.75rem] bg-[#f7f9fc] p-3 text-slate-900 shadow-inner sm:p-5">
      <div className="mx-auto max-w-5xl overflow-x-auto rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-2xl sm:p-5">
        <div className="mx-auto min-w-[690px] max-w-4xl">
          <SeatLegend seats={seats} />
          <div className="mx-auto mt-4 flex h-9 w-52 items-center justify-center rounded-b-[70%] bg-slate-200 text-[10px] font-black uppercase tracking-[0.35em] text-slate-700 shadow-inner">Écran</div>
          <div className="mt-7 space-y-1.5">
            {rows.map((row, rowIndex) => {
              const rowSeats = seats.filter((seat) => seat.row === row);
              const sidePadding = Math.max(0, (dimensions.maxColumns - rowSeats.length) / 2) * 13;
              return (
                <div key={row} className="grid grid-cols-[2rem_1fr_2rem] items-center gap-2">
                  <span className="text-center text-[10px] font-black text-slate-400">{row}</span>
                  <div className="flex items-center justify-center" style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}>
                    <div className={`flex items-center justify-center gap-1 ${rowIndex < rows.length - 2 ? '[&>*:nth-child(6)]:mr-5 [&>*:nth-last-child(6)]:ml-5' : '[&>*:nth-child(12)]:mr-7'}`}>
                      {rowSeats.map((seat) => <SeatDot key={seat.id} seat={seat} selected={selectedSet.has(seat.id)} onToggleSeat={onToggleSeat} />)}
                    </div>
                  </div>
                  <span className="text-center text-[10px] font-black text-slate-400">{row}</span>
                </div>
              );
            })}
          </div>
          <div className="mx-auto mt-6 grid max-w-2xl gap-2">
            <div className="mx-auto h-1.5 w-3/4 rounded-full bg-blue-500/90" />
            <div className="mx-auto h-1.5 w-2/3 rounded-full bg-blue-500/90" />
          </div>
        </div>
      </div>
    </div>
  );
}
