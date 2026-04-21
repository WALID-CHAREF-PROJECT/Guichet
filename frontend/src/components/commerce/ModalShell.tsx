import { ReactNode } from 'react';

export default function ModalShell({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }): JSX.Element | null {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#020b22]/85 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-3xl border border-white/10 bg-[#071a43]" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
