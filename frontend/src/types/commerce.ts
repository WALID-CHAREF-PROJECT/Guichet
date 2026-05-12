export type ProductType = 'event_ticket' | 'travel_booking' | 'movie_ticket' | 'sport_ticket';

export interface TicketType {
  id: string;
  name: string;
  price: number;
  category: string;
  available: number;
  requiresSeatSelection: boolean;
}

export type SeatStatus = 'available' | 'unavailable' | 'selected';
export type SeatZone = 'carre_or' | 'orchestre' | 'balcon';

export interface Seat {
  id: string;
  row: string;
  number: number;
  zone: SeatZone;
  price: number;
  status: SeatStatus;
}

export interface CartItem {
  id: string;
  productType: ProductType;
  slug: string;
  productId?: string;
  title: string;
  image: string;
  date: string;
  location: string;
  ticketType?: string;
  selectedSeats?: string[];
  selectedZone?: string;
  planType?: 'theatre' | 'stadium' | 'generic' | 'cinema';
  movieId?: string;
  movieTitle?: string;
  sessionId?: string;
  sessionDateTime?: string;
  hallName?: string;
  selectedDate?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  advanceAmount?: number;
  remainingAmount?: number;
}

export interface CartTotals {
  itemsCount: number;
  totalQuantity: number;
  subtotal: number;
  totalNow: number;
  remainingLater: number;
}

export interface CustomerInfo {
  email: string;
  mobile: string;
  countryCode: string;
}

export interface Order {
  id: string;
  reference: string;
  items: CartItem[];
  customer: CustomerInfo;
  paymentMethod: 'card';
  totalNow: number;
  remainingLater: number;
  status: 'confirmed' | 'failed';
  createdAt: string;
}
