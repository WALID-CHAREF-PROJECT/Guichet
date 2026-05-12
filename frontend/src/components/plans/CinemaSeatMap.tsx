import { useMemo } from 'react';
import { formatMad } from '../../services/commerce/utils';
import { CinemaSeat, MovieSession, cinemaTemplateDimensions, generateCinemaSeats } from '../../services/publicApi';

const seatStateClass: Record<CinemaSeat['status'] | 'selected', string> = {
  available: 'bg-sky-500 text-white hover:bg-sky-400',
  reserved: 'cursor-not-allowed bg-slate-300 text-slate-500',
  unavailable: 'cursor-not-allowed bg-slate-300 text-slate-500',
  selected: 'bg-orange-500 text-white ring-2 ring-orange-200',
};

export default function CinemaSeatMap({ session, selectedSeats, onToggleSeat }: { session: MovieSession; selectedSeats: string[]; onToggleSeat: (seat: CinemaSeat) => void }): JSX.Element {
  const seats = useMemo(() => session.seats && session.seats.length > 0 ? session.seats : generateCinemaSeats(session), [session]);
  const selectedSet = new Set(selectedSeats);
  const rows = Array.from(new Set(seats.map((seat) => seat.row)));
  const dimensions = cinemaTemplateDimensions(session.seatTemplate);

  return (
    <div className="rounded-[1.75rem] bg-slate-100 p-3 text-slate-900 shadow-inner sm:p-5">
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-slate-500">Légende cinéma</p>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><span className="h-3 w-3 rounded-full bg-sky-500" /> Disponible</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><span className="h-3 w-3 rounded-full bg-orange-500" /> Sélectionné</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5"><span className="h-3 w-3 rounded-full bg-slate-300" /> Réservé / indisponible</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">{formatMad(Number(session.price || 0))} / siège</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl overflow-x-auto rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white to-slate-200 p-4 shadow-xl">
        <div className="mx-auto min-w-[620px] max-w-4xl">
          <div className="mx-auto mb-8 h-10 max-w-2xl rounded-b-[100%] bg-slate-950 text-center text-xs font-black uppercase tracking-[0.45em] leading-10 text-white shadow-2xl">Écran</div>
          <div className="space-y-2">
            {rows.map((row) => {
              const rowSeats = seats.filter((seat) => seat.row === row);
              return (
                <div key={row} className="grid items-center gap-2" style={{ gridTemplateColumns: `2rem repeat(${dimensions.columns}, minmax(1.65rem, 1fr)) 2rem` }}>
                  <span className="text-center text-xs font-black text-slate-500">{row}</span>
                  {rowSeats.map((seat, index) => {
                    const state = selectedSet.has(seat.id) ? 'selected' : seat.status;
                    const afterAisle = (index + 1) === Math.floor(dimensions.columns / 3) || (index + 1) === Math.ceil((dimensions.columns / 3) * 2);
                    return (
                      <button
                        key={seat.id}
                        type="button"
                        onClick={() => seat.status === 'available' && onToggleSeat(seat)}
                        disabled={seat.status !== 'available'}
                        className={`h-7 rounded-t-lg rounded-b-sm text-[10px] font-black shadow-sm transition ${seatStateClass[state]} ${afterAisle ? 'mr-5' : ''}`}
                        title={`${seat.row}${seat.number} · ${formatMad(seat.price)}`}
                      >
                        {seat.number}
                      </button>
                    );
                  })}
                  <span className="text-center text-xs font-black text-slate-500">{row}</span>
                </div>
              );
            })}
          </div>
          <div className="mx-auto mt-7 h-2 w-2/3 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
}
