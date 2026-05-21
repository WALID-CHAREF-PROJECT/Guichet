import { Link } from 'react-router-dom';
import ResponsiveImage from './ResponsiveImage';

export interface FeaturedCarouselItem {
  id: string | number;
  title: string;
  image?: string | null;
  to: string;
  subtitle?: string | null;
  meta?: string | null;
  ctaLabel?: string | null;
}

interface FeaturedCarouselProps {
  items: FeaturedCarouselItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  label: string;
  maxHeightClassName?: string;
}

export default function FeaturedCarousel({ items, activeIndex, onSelect, label, maxHeightClassName = 'max-h-[460px] md:max-h-[460px]' }: FeaturedCarouselProps): JSX.Element | null {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3" aria-label={label}>
      <div className="overflow-hidden rounded-3xl border border-sky-100/20 bg-[#041743] shadow-[0_24px_55px_rgba(2,8,32,0.62)]">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {items.map((item, index) => (
            <Link key={item.id} to={item.to} className="group relative min-w-full focus:outline-none focus:ring-2 focus:ring-sky-300" aria-label={item.title}>
              <ResponsiveImage
                src={item.image}
                alt={item.title}
                aspect="wide"
                loading={index === 0 ? 'eager' : 'lazy'}
                className={`min-h-[240px] md:min-h-[360px] ${maxHeightClassName}`}
                imgClassName="transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020b22]/95 via-[#041739]/55 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
                {item.meta && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">{item.meta}</p>}
                <h2 className="max-w-3xl text-2xl font-bold text-white md:text-4xl">{item.title}</h2>
                {item.subtitle && <p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">{item.subtitle}</p>}
                {item.ctaLabel && <span className="mt-4 inline-flex rounded-full border border-sky-100/40 bg-white/95 px-4 py-2 text-sm font-semibold text-[#041743] shadow-md">{item.ctaLabel}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Afficher ${item.title}`}
              className={`h-2.5 rounded-full transition ${index === activeIndex ? 'w-9 bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.7)]' : 'w-2.5 bg-white/35 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
