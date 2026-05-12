import { ReactNode } from 'react';
import ModalShell from '../commerce/ModalShell';

export default function PlanModal({ open, onClose, eyebrow, title, helper, children }: { open: boolean; onClose: () => void; eyebrow?: string; title: string; helper?: string; children: ReactNode }): JSX.Element {
  return (
    <ModalShell open={open} onClose={onClose}>
      <div className="max-h-[92vh] overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {eyebrow && <p className="text-sm text-orange-200">{eyebrow}</p>}
            <h3 className="text-2xl font-bold">{title}</h3>
            {helper && <p className="text-sm text-slate-300">{helper}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/20 p-2">✕</button>
        </div>
        {children}
      </div>
    </ModalShell>
  );
}
