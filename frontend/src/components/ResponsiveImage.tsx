import { useMemo, useState } from 'react';

interface ResponsiveImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
  aspect?: 'video' | 'poster' | 'square' | 'wide' | 'auto';
  fit?: 'cover' | 'contain';
  loading?: 'lazy' | 'eager';
  maxHeightClassName?: string;
}

const placeholderGradient = 'bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.24),transparent_32%),linear-gradient(135deg,#10244f,#041743_52%,#020b22)]';

const aspectClasses: Record<NonNullable<ResponsiveImageProps['aspect']>, string> = {
  video: 'aspect-video',
  poster: 'aspect-[3/4]',
  square: 'aspect-square',
  wide: 'aspect-[21/9]',
  auto: ''
};

function normalizeSource(src?: string | null): string {
  if (!src) return '';
  const trimmed = src.trim();
  if (!trimmed) return '';
  return trimmed;
}

export default function ResponsiveImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  aspect = 'video',
  fit = 'cover',
  loading = 'lazy',
  maxHeightClassName = ''
}: ResponsiveImageProps): JSX.Element {
  const normalizedSrc = useMemo(() => normalizeSource(src), [src]);
  const [failed, setFailed] = useState(false);
  const showImage = normalizedSrc.length > 0 && !failed;

  return (
    <div className={`relative overflow-hidden ${aspectClasses[aspect]} ${maxHeightClassName} ${placeholderGradient} ${className}`}>
      {showImage ? (
        <img
          src={normalizedSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          onError={() => setFailed(true)}
          className={`h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${imgClassName}`}
        />
      ) : (
        <div className="flex h-full min-h-[120px] w-full items-center justify-center p-6 text-center text-sm font-semibold text-white/75">
          <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur">Image indisponible</span>
        </div>
      )}
    </div>
  );
}
