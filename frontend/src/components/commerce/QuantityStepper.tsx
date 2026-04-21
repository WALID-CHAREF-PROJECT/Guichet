interface Props {
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  min?: number;
}

export default function QuantityStepper({ value, onDecrease, onIncrease, min = 0 }: Props): JSX.Element {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-3 py-1.5">
      <button type="button" disabled={value <= min} onClick={onDecrease} className="h-6 w-6 rounded-full bg-white/10 text-sm disabled:opacity-30">−</button>
      <span className="min-w-4 text-center text-sm font-semibold">{value}</span>
      <button type="button" onClick={onIncrease} className="h-6 w-6 rounded-full bg-white/10 text-sm">+</button>
    </div>
  );
}
