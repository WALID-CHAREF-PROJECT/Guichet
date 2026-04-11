import { Category, City } from '../types/api';

interface Props {
  search: string;
  category: string;
  city: string;
  quickDate: string;
  sort: string;
  categories: Category[];
  cities: City[];
  onChange: (key: string, value: string) => void;
}

export default function FiltersBar(props: Props): JSX.Element {
  return (
    <section className="grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-5">
      <input value={props.search} onChange={(e) => props.onChange('search', e.target.value)} placeholder="Rechercher un événement" className="rounded border px-3 py-2" />
      <select value={props.category} onChange={(e) => props.onChange('category', e.target.value)} className="rounded border px-3 py-2">
        <option value="">Toutes catégories</option>
        {props.categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
      </select>
      <select value={props.city} onChange={(e) => props.onChange('city', e.target.value)} className="rounded border px-3 py-2">
        <option value="">Toutes villes</option>
        {props.cities.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}
      </select>
      <select value={props.quickDate} onChange={(e) => props.onChange('quickDate', e.target.value)} className="rounded border px-3 py-2">
        <option value="">Date rapide</option><option value="today">Aujourd'hui</option><option value="weekend">Ce week-end</option><option value="7d">7 prochains jours</option><option value="30d">30 prochains jours</option>
      </select>
      <select value={props.sort} onChange={(e) => props.onChange('sort', e.target.value)} className="rounded border px-3 py-2">
        <option value="date_asc">Date croissante</option><option value="date_desc">Date décroissante</option><option value="price_asc">Prix croissant</option><option value="price_desc">Prix décroissant</option>
      </select>
    </section>
  );
}
