interface LoadingSkeletonProps {
  label?: string;
  cards?: number;
}

export default function LoadingSkeleton({ label = 'Chargement...', cards = 4 }: LoadingSkeletonProps): JSX.Element {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[#041743] p-5">
      <p className="text-sm text-slate-300">{label}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="aspect-video animate-pulse bg-white/10" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
