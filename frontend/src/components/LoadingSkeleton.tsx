interface LoadingSkeletonProps {
  label?: string;
  cards?: number;
}

export default function LoadingSkeleton({ label = 'Chargement...', cards = 4 }: LoadingSkeletonProps): JSX.Element {
  return (
    <section className="premium-surface rounded-2xl p-5">
      <p className="text-sm text-slate-300">{label}</p>
      <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
            <div className="shimmer aspect-video" />
            <div className="space-y-2 p-4">
              <div className="shimmer h-3 w-2/3 rounded" />
              <div className="shimmer h-4 w-full rounded" />
              <div className="shimmer h-3 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
