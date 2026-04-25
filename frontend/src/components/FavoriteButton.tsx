import { useUser } from '../contexts/UserContext';
import { FavoriteItemType } from '../services/storage';

interface Props {
  itemId: string;
  itemType: FavoriteItemType;
  payload: {
    slug: string;
    title: string;
    image: string;
    location?: string;
    date?: string;
    route: string;
    organizer?: string;
  };
  className?: string;
}

export default function FavoriteButton({ itemId, itemType, payload, className = '' }: Props): JSX.Element {
  const { isFavorite, toggleFavorite } = useUser();
  const active = isFavorite(itemId, itemType);

  return (
    <button
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void toggleFavorite({ ...payload, itemId, itemType });
      }}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${active ? 'border-orange-300 bg-orange-500/20 text-orange-200' : 'border-white/20 bg-white/5 text-white hover:bg-white/10'} ${className}`}
    >
      {active ? '♥' : '♡'}
    </button>
  );
}
