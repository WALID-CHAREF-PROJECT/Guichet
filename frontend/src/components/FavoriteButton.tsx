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
  const { user, isFavorite, toggleFavorite } = useUser();
  const active = user ? isFavorite(itemId, itemType) : false;

  return (
    <button
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      title={user ? (active ? 'Retirer des favoris' : 'Ajouter aux favoris') : 'Connectez-vous pour enregistrer vos favoris'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
          window.alert('Connectez-vous pour gérer vos favoris.');
          return;
        }
        toggleFavorite({ ...payload, itemId, itemType });
      }}
      className={`rounded-full border px-3 py-1.5 text-xs transition ${active ? 'border-orange-300 bg-orange-500/20 text-orange-200' : 'border-white/20 bg-white/5 text-white hover:bg-white/10'} ${className}`}
    >
      {active ? '♥' : '♡'}
    </button>
  );
}
