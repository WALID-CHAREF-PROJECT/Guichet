export type DateFilterValue = '' | 'today' | 'tomorrow' | 'week' | 'weekend' | 'month';

export const dateFilterTabs: Array<{ key: DateFilterValue; label: string }> = [
  { key: '', label: 'Tous' },
  { key: 'today', label: 'Aujourd’hui' },
  { key: 'tomorrow', label: 'Demain' },
  { key: 'week', label: 'Cette semaine' },
  { key: 'weekend', label: 'Ce weekend' },
  { key: 'month', label: 'Ce mois-ci' },
];

interface DateFilterTabsProps {
  active: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  className?: string;
}

export default function DateFilterTabs({ active, onChange, className = '' }: DateFilterTabsProps): JSX.Element {
  return (
    <div className={`flex w-full gap-2 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1 text-sm ${className}`} role="tablist" aria-label="Filtrer par date">
      {dateFilterTabs.map((tab) => (
        <button
          key={tab.key || 'all'}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`whitespace-nowrap rounded-full px-4 py-2 font-semibold transition ${active === tab.key ? 'bg-white text-[#041743] shadow-lg shadow-black/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
