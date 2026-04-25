import { useMemo, useState } from 'react';
import { PlatformEvent } from '../../services/platformData';
import { TicketType } from '../../types/commerce';
import { formatMad, uid } from '../../services/commerce/utils';
import QuantityStepper from './QuantityStepper';
import ModalShell from './ModalShell';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const defaultTickets: TicketType[] = [
  { id: 'normal', name: 'Normal', price: 150, category: 'standard', available: 200, requiresSeatSelection: false },
  { id: 'vip', name: 'VIP', price: 280, category: 'vip', available: 60, requiresSeatSelection: false },
  { id: 'vvip', name: 'VVIP', price: 420, category: 'vvip', available: 20, requiresSeatSelection: false },
  { id: 'carre-or', name: 'Carré Or', price: 520, category: 'gold', available: 14, requiresSeatSelection: false }
];

export default function TicketSelectionModal({ event, open, onClose }: { event: PlatformEvent; open: boolean; onClose: () => void }): JSX.Element {
  const navigate = useNavigate();
  const { addItems } = useCart();
  const [selection, setSelection] = useState<Record<string, number>>({});

  const tickets: TicketType[] = (event as any).ticketTypes?.length
    ? (event as any).ticketTypes.map((ticket: any) => ({
        id: String(ticket.id),
        name: ticket.name,
        price: Number(ticket.price),
        category: ticket.category ?? "standard",
        available: Number(ticket.available ?? 0),
        requiresSeatSelection: false
      }))
    : defaultTickets;

  const totalQty = useMemo(() => Object.values(selection).reduce((sum, qty) => sum + qty, 0), [selection]);

  const increment = (ticketId: string): void => setSelection((s) => ({ ...s, [ticketId]: (s[ticketId] ?? 0) + 1 }));
  const decrement = (ticketId: string): void => setSelection((s) => ({ ...s, [ticketId]: Math.max(0, (s[ticketId] ?? 0) - 1) }));

  const onContinue = (): void => {
    const items = tickets
      .map((ticket) => ({ ticket, qty: selection[ticket.id] ?? 0 }))
      .filter(({ qty }) => qty > 0)
      .map(({ ticket, qty }) => ({
        id: uid('cart'),
        productType: 'event_ticket' as const,
        slug: event.slug,
        title: event.title,
        image: event.image,
        date: `${event.date} · ${event.time}`,
        location: event.location,
        ticketType: ticket.name,
        quantity: qty,
        unitPrice: ticket.price,
        subtotal: qty * ticket.price
      }));

    addItems(items);
    onClose();
    navigate('/ma-fr/panier');
  };

  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
        <img src={event.image} alt={event.title} className="h-full min-h-[460px] w-full object-cover" />
        <div className="p-6 lg:p-8">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-300">{event.organizer}</p>
              <h3 className="text-2xl font-bold">Choisissez vos billets</h3>
            </div>
            <button onClick={onClose} className="rounded-full border border-white/20 p-2">✕</button>
          </div>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0d2759] p-4">
                <div>
                  <p className="font-semibold">{ticket.name}</p>
                  <p className="text-sm text-orange-300">{formatMad(ticket.price)}</p>
                </div>
                <QuantityStepper value={selection[ticket.id] ?? 0} onIncrease={() => increment(ticket.id)} onDecrease={() => decrement(ticket.id)} />
              </div>
            ))}
          </div>
          <button disabled={totalQty === 0} onClick={onContinue} className="mt-8 w-full rounded-full bg-white px-6 py-3 font-bold text-[#031438] disabled:cursor-not-allowed disabled:opacity-50">
            Continuer ({totalQty})
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
