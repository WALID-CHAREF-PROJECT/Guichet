import { NavLink } from 'react-router-dom';
import { ServiceKey, servicePages } from '../services/platformData';

export default function ServiceTabs({ active }: { active: ServiceKey }): JSX.Element {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {servicePages.map((item) => (
        <NavLink
          key={item.key}
          to={item.route}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-300 ${
            active === item.key
              ? 'border-sky-200/70 bg-gradient-to-r from-sky-200 to-cyan-100 text-[#04112d] shadow-[0_0_0_1px_rgba(125,211,252,0.45),0_12px_30px_rgba(56,189,248,0.3)]'
              : 'border-white/20 bg-white/[0.04] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:border-sky-300/40 hover:bg-white/[0.10]'
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
