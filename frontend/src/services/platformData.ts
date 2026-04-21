export type ServiceKey = 'billeterie' | 'store' | 'voyage' | 'cinema' | 'sport';

export interface ServicePage {
  key: ServiceKey;
  label: string;
  icon: string;
  route: string;
}

export interface EventTag {
  id: string;
  label: string;
  icon: string;
}

export interface PlatformEvent {
  id: number;
  slug: string;
  title: string;
  organizer: string;
  organizerLogo: string;
  image: string;
  tags: string[];
  location: string;
  date: string;
  time: string;
  price: string;
  description: string;
}

export interface MovieItem {
  id: number;
  slug: string;
  title: string;
  duration: string;
  genre: string;
  image: string;
}

export interface VoyageItem {
  id: number;
  slug: string;
  title: string;
  location: string;
  departureDate: string;
  price: string;
  oldPrice?: string;
  image: string;
  collection: string;
}

export interface SportItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  date: string;
  location: string;
  image: string;
}

export const servicePages: ServicePage[] = [
  { key: 'billeterie', label: 'Billeterie', icon: '🎫', route: '/ma-fr/billeterie' },
  { key: 'store', label: 'Store', icon: '🛍️', route: '/ma-fr/store' },
  { key: 'voyage', label: 'Voyage', icon: '✈️', route: '/ma-fr/voyage' },
  { key: 'cinema', label: 'Cinéma', icon: '🎬', route: '/ma-fr/cinema' },
  { key: 'sport', label: 'Sport', icon: '🏀', route: '/ma-fr/sport' }
];

export const eventTags: EventTag[] = [
  { id: 'COMEDIABLANCA26', label: 'COMEDIABLANCA', icon: '🎭' },
  { id: 'BAL', label: 'La Basketball Africa League (BAL)', icon: '🏀' },
  { id: 'NOSTALGIA-LOVERS-FESTIVAL', label: 'NOSTALGIA LOVERS FESTIVAL', icon: '🎶' },
  { id: 'concerts', label: 'Concerts', icon: '🎤' },
  { id: 'festivals', label: 'Festivals', icon: '🎉' },
  { id: 'theatre-humour', label: 'Théâtre & Humour', icon: '😂' },
  { id: 'divertissement', label: 'Divertissement', icon: '✨' },
  { id: 'jeune-public', label: 'Jeune Public', icon: '🧒' },
  { id: 'salon-formation', label: 'Salon & formation', icon: '🎓' },
  { id: 'sport', label: 'Sport', icon: '🏆' }
];

export const featuredPosters = [
  { image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80', eventSlug: 'niro-concert-casablanca' },
  { image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80', eventSlug: 'piaf-invites-heritiers' },
  { image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80', eventSlug: 'nostalgia-lovers-festival' },
  { image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80', eventSlug: 'bryan-adams-bare-bones' }
];

export const platformEvents: PlatformEvent[] = [
  { id: 1, slug: 'piaf-invites-heritiers', organizer: 'Association EDOM', organizerLogo: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=80&q=80', title: 'PIAF : Invités & Héritiers – La Comédie Musicale', location: 'Mégarama Casablanca', date: '21 Avril 2026', time: '20:30', price: '250,00 MAD', tags: ['COMEDIABLANCA26', 'theatre-humour'], image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=900&q=80', description: 'Une soirée immersive inspirée des grandes comédies musicales, portée par des performances live et une mise en scène premium.' },
  { id: 2, slug: 'magic-garden-light-festival', organizer: 'Magic Garden', organizerLogo: 'https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=80&q=80', title: 'Magic Garden Light Festival', location: 'Parc du Vélodrome - Casablanca', date: '22 Avril 2026', time: '19:00', price: '100,00 MAD', tags: ['festivals', 'NOSTALGIA-LOVERS-FESTIVAL'], image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=80', description: 'Un festival nocturne visuel avec installations lumineuses, musique et expériences interactives pour tous les publics.' },
  { id: 3, slug: 'tim-impulsion', organizer: 'TIM Maroc', organizerLogo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=80&q=80', title: 'La TIM présente « IMPULSION »', location: 'Théâtre Mohammed Zefzaf', date: '23 Avril 2026', time: '21:00', price: '80,00 MAD', tags: ['divertissement'], image: 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=900&q=80', description: 'Un spectacle d’improvisation rythmé et participatif qui place le public au cœur du show.' },
  { id: 4, slug: 'conference-fabrice-midal', organizer: '10Mentions', organizerLogo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80', title: 'Conférence : Fabrice Midal', location: 'Villa des Arts', date: '24 Avril 2026', time: '18:30', price: '200,00 MAD', tags: ['salon-formation'], image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=900&q=80', description: 'Une conférence inspirante autour du bien-être et de la performance personnelle dans un format exclusif.' },
  { id: 5, slug: 'niro-concert-casablanca', organizer: 'AURAEVENT X PLUG', organizerLogo: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=80&q=80', title: 'NIRO en Concert à Casablanca', location: 'Complexe Mohammed V', date: '15 Mai 2026', time: '22:00', price: '400,00 MAD', tags: ['concerts'], image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80', description: 'Concert live exceptionnel avec scénographie immersive et ambiance grand format.' },
  { id: 6, slug: 'mode-avionde-rachid-rafik', organizer: 'B.LINE', organizerLogo: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=80&q=80', title: 'Mode Avionde – Rachid Rafik', location: 'Studio des Arts Vivants', date: '22 Avril 2026', time: '20:00', price: '150,00 MAD', tags: ['theatre-humour', 'COMEDIABLANCA26'], image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80', description: 'Humour incisif et storytelling du quotidien dans un format one-man-show moderne.' },
  { id: 7, slug: 'bryan-adams-bare-bones', organizer: 'Association EDOM', organizerLogo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=80&q=80', title: 'Bryan Adams Bare Bones', location: 'Salle couverte', date: '04 Juin 2026', time: '21:30', price: '300,00 MAD', tags: ['concerts'], image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80', description: 'Une expérience acoustique premium au plus proche de l’artiste.' },
  { id: 8, slug: 'halim-hologram-experience', organizer: 'BAL Experience', organizerLogo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=80&q=80', title: 'Halim – The Interactive Hologram Experience', location: 'Complexe sportif Prince Moulay', date: '24 Avril 2026', time: '19:30', price: '50,00 MAD', tags: ['jeune-public', 'BAL'], image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80', description: 'Show interactif innovant mêlant hologrammes, musique et technologie.' },
  { id: 9, slug: 'bal-casablanca-finals', organizer: 'Basketball Africa League', organizerLogo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=80&q=80', title: 'BAL Casablanca Finals Night', location: 'Complexe Mohammed V', date: '23 Avril 2026', time: '20:45', price: '120,00 MAD', tags: ['sport', 'BAL'], image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80', description: 'Finales BAL avec animations live, show pre-game et ambiance aréna.' },
  { id: 10, slug: 'nostalgia-lovers-festival', organizer: 'Nostalgia Lovers', organizerLogo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80', title: 'Nostalgia Lovers Festival', location: 'Parc du Vélodrome - Casablanca', date: '24 Avril 2026', time: '17:00', price: '200,00 MAD', tags: ['festivals', 'NOSTALGIA-LOVERS-FESTIVAL'], image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80', description: 'Festival rétro premium avec artistes cultes, food corners et performances live.' }
];

export const voyageCategories = ['Voyage organisé', 'Voyage thématique', 'Hôtels', 'Voyage & Événement', 'Last Minute', 'Early Booking'];

export const voyages: VoyageItem[] = [
  { id: 1, slug: 'splendeurs-france-suisse-italie', title: 'Splendeurs de la France, de la Suisse et de l’Italie', location: 'Paris', departureDate: 'Départ le 15 mars 2026', price: '13 900 MAD', oldPrice: '15 400 MAD', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80', collection: 'Voyage organisé' },
  { id: 2, slug: 'istanbul-sharm', title: 'ISTANBUL & SHARM EL SHEIKH 11 jours', location: 'Istanbul', departureDate: 'Départ le 04 avr. 2026', price: '7 900 MAD', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=80', collection: 'Last Minute' },
  { id: 3, slug: 'jordanie', title: 'Jordanie, terre de contrastes et de merveilles', location: 'Amman', departureDate: 'Départ le 04 avr. 2026', price: '17 500 MAD', oldPrice: '19 000 MAD', image: 'https://images.unsplash.com/photo-1579606032821-4e6161c81bd3?auto=format&fit=crop&w=900&q=80', collection: 'Voyage thématique' }
];

export const movies: MovieItem[] = [
  { id: 1, slug: 'the-drama', title: 'The Drama', duration: '1h45', genre: 'Comédie', image: 'https://images.unsplash.com/photo-1649786137948-8f75c6f7f4c9?auto=format&fit=crop&w=800&q=80' },
  { id: 2, slug: 'super-mario-galaxy', title: 'Super Mario Galaxy Le Film', duration: '1h40', genre: 'Action', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80' },
  { id: 3, slug: 'hotel-de-la-paix', title: 'Hôtel de la Paix', duration: '1h28', genre: 'Horreur', image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80' },
  { id: 4, slug: 'they-will-kill-you', title: 'They Will Kill You', duration: '1h34', genre: 'Action', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80' }
];

export const sports: SportItem[] = [
  { id: 1, slug: 'bal-casablanca-finals', title: 'BAL Casablanca Finals Night', category: 'Basketball', date: '23 Avril 2026', location: 'Casablanca', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80' },
  { id: 2, slug: 'run-casablanca-10k', title: 'Casablanca 10K Night Run', category: 'Running', date: '11 Mai 2026', location: 'Corniche', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80' }
];

export function getEventsByTag(tag: string): PlatformEvent[] {
  return platformEvents.filter((item) => item.tags.includes(tag));
}

export function getEventBySlug(slug: string): PlatformEvent | undefined {
  return platformEvents.find((item) => item.slug === slug);
}
