import { Link } from 'react-router-dom';
import ResponsiveImage from './ResponsiveImage';

interface MediaCardProps {
  to: string;
  title: string;
  image?: string | null;
  eyebrow?: string;
  meta?: string;
  price?: string;
  actionLabel?: string;
  badge?: string;
  favorite?: JSX.Element;
  aspect?: 'video' | 'poster' | 'square';
  compact?: boolean;
  className?: string;
}

export default function MediaCard({
  to,
  title,
  image,
  eyebrow,
  meta,
  price,
  actionLabel = 'Voir',
  badge,
  favorite,
  aspect = 'video',
  compact = false,
  className = ''
}: MediaCardProps): JSX.Element {
  return (
    <Link
      to={to}
      aria-label={title}
      className={`group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#041743] shadow-sm shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-xl hover:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-orange-400 ${compact ? 'w-[230px] shrink-0' : ''} ${className}`}
    >
      {favorite && <div className="absolute right-3 top-3 z-20" onClick={(event) => event.preventDefault()}>{favorite}</div>}
      <ResponsiveImage
        src={image}
        alt={title}
        aspect={aspect}
        loading="lazy"
        className="rounded-b-none"
        imgClassName="transition duration-500 group-hover:scale-105"
      />
      {badge && <span className="absolute left-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{badge}</span>}
      <div className="space-y-2 p-4">
        {eyebrow && <p className="line-clamp-1 text-xs font-medium uppercase tracking-wide text-orange-300">{eyebrow}</p>}
        <h3 className="line-clamp-2 font-semibold leading-snug text-white">{title}</h3>
        {meta && <p className="line-clamp-2 text-sm text-slate-300">{meta}</p>}
        <div className="flex items-center justify-between gap-3 pt-1">
          {price && <span className="font-semibold text-orange-300">{price}</span>}
          <span className="ml-auto rounded-full border border-white/35 px-3 py-1 text-xs font-semibold text-white transition group-hover:bg-white group-hover:text-[#041743]">{actionLabel}</span>
        </div>
      </div>
    </Link>
  );
}
