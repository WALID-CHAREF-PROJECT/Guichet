import { useEffect, useRef, useState } from 'react';

export default function SharePopover({ title }: { title: string }): JSX.Element {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent): void => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutside);
    return () => document.removeEventListener('mousedown', closeOnOutside);
  }, []);

  const pageUrl = window.location.href;

  return (
    <div className="relative" ref={wrapRef}>
      <button onClick={() => setOpen((prev) => !prev)} className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">Partager</button>
      {open ? (
        <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-white/10 bg-[#071d47] p-2 text-xs shadow-xl">
          <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank', 'noopener,noreferrer')} className="w-full rounded-lg px-3 py-2 text-left hover:bg-white/10">Facebook</button>
          <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`, '_blank', 'noopener,noreferrer')} className="mt-1 w-full rounded-lg px-3 py-2 text-left hover:bg-white/10">Twitter / X</button>
          <button onClick={async () => {
            await navigator.clipboard.writeText(pageUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }} className="mt-1 w-full rounded-lg px-3 py-2 text-left hover:bg-white/10">{copied ? 'Lien copié !' : 'Copier le lien'}</button>
        </div>
      ) : null}
    </div>
  );
}
