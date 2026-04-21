import { useMemo, useState } from 'react';
import { VoyageItem } from '../../services/platformData';
import ModalShell from './ModalShell';
import QuantityStepper from './QuantityStepper';
import { formatMad, parseMadPrice, uid } from '../../services/commerce/utils';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export default function TravelReservationModal({ voyage, open, onClose }: { voyage: VoyageItem; open: boolean; onClose: () => void }): JSX.Element {
  const { addItems } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const unit = parseMadPrice(voyage.price);

  const totals = useMemo(() => {
    const subtotal = unit * quantity;
    const advance = Math.round(subtotal * 0.35);
    return { subtotal, advance, remaining: subtotal - advance };
  }, [quantity, unit]);

  const reserve = (): void => {
    addItems([
      {
        id: uid('cart'),
        productType: 'travel_booking',
        slug: voyage.slug,
        title: voyage.title,
        image: voyage.image,
        date: voyage.departureDate,
        selectedDate: voyage.departureDate,
        location: voyage.location,
        quantity,
        unitPrice: unit,
        subtotal: totals.subtotal,
        advanceAmount: totals.advance,
        remainingAmount: totals.remaining
      }
    ]);
    onClose();
    navigate('/ma-fr/panier');
  };

  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="max-w-xl p-6 lg:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Réservation voyage</h3>
          <button onClick={onClose} className="rounded-full border border-white/20 p-2">✕</button>
        </div>
        <h4 className="text-lg font-semibold">{voyage.title}</h4>
        <p className="mt-1 text-sm text-slate-300">{voyage.departureDate}</p>
        <div className="mt-5 space-y-2 rounded-2xl border border-white/10 bg-[#0d2759] p-4 text-sm">
          <p className="flex items-center justify-between"><span>Prix total</span><strong>{formatMad(totals.subtotal)}</strong></p>
          <p className="flex items-center justify-between"><span>Avance à payer</span><strong>{formatMad(totals.advance)}</strong></p>
          <p className="flex items-center justify-between"><span>Reste à payer</span><strong>{formatMad(totals.remaining)}</strong></p>
        </div>
        <div className="mt-5">
          <QuantityStepper value={quantity} min={1} onDecrease={() => setQuantity((n) => Math.max(1, n - 1))} onIncrease={() => setQuantity((n) => n + 1)} />
        </div>
        <button onClick={reserve} className="mt-6 w-full rounded-full bg-white px-6 py-3 font-bold text-[#031438]">Réservez maintenant</button>
      </div>
    </ModalShell>
  );
}
