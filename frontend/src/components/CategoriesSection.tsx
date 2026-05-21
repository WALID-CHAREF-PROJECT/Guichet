import { Link } from 'react-router-dom';
import { Category } from '../types/api';
import ResponsiveImage from './ResponsiveImage';

interface Props {
  categories: Category[];
}

const categoryImages: Record<string, string> = {
  concert: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  humour: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?auto=format&fit=crop&w=1200&q=80',
  festival: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1200&q=80',
  gala: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  sport: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  expo: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  'meetup-createurs': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
  'tribute-show': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
  voyages: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=1200&q=80',
  cinema: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
};
const fallbackCategoryImage = 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80';

export default function CategoriesSection({ categories }: Props): JSX.Element {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Catégories</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/ma-fr/billeterie?category=${category.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-sky-100/15 bg-[#041743] shadow-glass transition hover:-translate-y-1 hover:border-sky-200/35"
          >
            <ResponsiveImage
              src={category.image || categoryImages[category.slug] || fallbackCategoryImage}
              alt={category.name}
              aspect="video"
              loading="lazy"
              imgClassName="transition duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#031227]/90 via-[#08224f]/40 to-transparent" />
            <div className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-amber-400/95 px-3 py-1 text-sm font-semibold text-[#281700] shadow-md shadow-amber-500/30">
              {category.name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
