interface EmptyStateProps {
  title: string;
  description?: string;
  action?: JSX.Element;
  className?: string;
}

export default function EmptyState({ title, description, action, className = '' }: EmptyStateProps): JSX.Element {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#041743] p-8 text-center shadow-sm shadow-black/20 ${className}`}>
      <p className="text-lg font-semibold text-white">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-300">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
