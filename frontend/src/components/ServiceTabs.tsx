import { NavLink } from 'react-router-dom';
import { ServiceKey, servicePages } from '../services/platformData';

export default function ServiceTabs({ active }: { active: ServiceKey }): JSX.Element {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {servicePages.map((item) => (
        <NavLink
          key={item.key}
          to={item.route}
          className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all ${
            active === item.key
              ? 'border-transparent bg-white text-[#05112f]'
              : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
