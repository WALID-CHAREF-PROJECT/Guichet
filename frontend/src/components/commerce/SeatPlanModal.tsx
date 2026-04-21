import { useMemo, useState } from 'react';
import { PlatformEvent } from '../../services/platformData';
import { Seat, SeatZone } from '../../types/commerce';
import ModalShell from './ModalShell';
import { useCart } from '../../contexts/CartContext';
import { formatMad, uid } from '../../services/commerce/utils';
import { useNavigate } from 'react-router-dom';

function buildSeats(): Seat[] {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const zones: SeatZone[] = ['carre_or', 'orchestre', 'balcon'];
  return rows.flatMap((row, rowIndex) =>
    Array.from({ length: 12 }).map((_, index) => {
      const zone = zones[Math.min(2, Math.floor(rowIndex / 2))];
      const basePrice = zone === 'carre_or' ? 550 : zone === 'orchestre' ? 280 : 180;
      const unavailable = Math.random() < 0.12;
      return {
        id: `${row}-${index + 1}`,
        row,
        number: index + 1,
        zone,
        price: basePrice,
        status: unavailable ? 'unavailable' : 'available'
      } satisfies Seat;
    })
  );
}

const zoneColor: Record<SeatZone, string> = {
  carre_or: 'bg-amber-400',
  orchestre: 'bg-sky-500',
  balcon: 'bg-indigo-500'
};

export default function SeatPlanModal({ event, open, onClose }: { event: PlatformEvent; open: boolean; onClose: () => void }): JSX.Element {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const [seats, setSeats] = useState<Seat[]>(() => buildSeats());

  const selectedSeats = useMemo(() => seats.filter((seat) => seat.status === 'selected'), [seats]);

  const toggleSeat = (id: string): void => {
    setSeats((current) =>
      current.map((seat) => {
        if (seat.id !== id || seat.status === 'unavailable') return seat;
        return { ...seat, status: seat.status === 'selected' ? 'available' : 'selected' };
      })
    );
  };

  const continueFlow = (): void => {
    if (selectedSeats.length === 0) return;
    const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    addItems([
      {
        id: uid('cart'),
        productType: 'event_ticket',
        slug: event.slug,
        title: `${event.title} · Plan`,
        image: event.image,
        date: `${event.date} · ${event.time}`,
        location: event.location,
        ticketType: 'Placement numéroté',
        selectedSeats: selectedSeats.map((seat) => seat.id),
        quantity: selectedSeats.length,
        unitPrice: Math.round(total / selectedSeats.length),
        subtotal: total
      }
    ]);
    onClose();
    navigate('/ma-fr/panier');
  };

  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Plan de salle</h3>
          <button onClick={onClose} className="rounded-full border border-white/20 p-2">✕</button>
        </div>
        <div className="rounded-2xl bg-slate-100 p-5 text-slate-900">
          <div className="mb-4 flex flex-wrap gap-4 text-xs font-semibold">
            <span>⚫ Indisponible</span>
            <span>🟡 Carré Or</span>
            <span>🔵 Orchestre</span>
            <span>🟣 Balcon</span>
          </div>
          <div className="mx-auto mb-5 h-7 w-52 rounded-full bg-slate-900/80 text-center text-xs font-bold tracking-[0.35em] text-white">SCENE</div>
          <div className="grid grid-cols-12 gap-2 rounded-xl bg-white p-4">
            {seats.map((seat) => {
              const isUnavailable = seat.status === 'unavailable';
              const isSelected = seat.status === 'selected';
              return (
                <button
                  key={seat.id}
                  onClick={() => toggleSeat(seat.id)}
                  disabled={isUnavailable}
                  title={`${seat.id} - ${formatMad(seat.price)}`}
                  className={`h-5 w-5 rounded-full ${isUnavailable ? 'bg-slate-400' : isSelected ? 'ring-2 ring-slate-900' : zoneColor[seat.zone]}`}
                />
              );
            })}
          </div>
        </div>
        <button onClick={continueFlow} disabled={selectedSeats.length === 0} className="mt-6 w-full rounded-full bg-white px-6 py-3 font-bold text-[#031438] disabled:opacity-50">
          Continuer ({selectedSeats.length} place{selectedSeats.length > 1 ? 's' : ''})
        </button>
      </div>
    </ModalShell>
  );
}
