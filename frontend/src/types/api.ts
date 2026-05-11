export interface Category {
  id: number;
  name: string;
  slug: string;
  type?: string;
  icon?: string;
  image?: string;
  is_active?: boolean;
  display_order?: number;
}

export interface City {
  id: number;
  name: string;
  slug: string;
}

export type BuyingMode = 'ticket' | 'plan' | 'reservation';
export type PlanType = 'theatre' | 'stadium' | 'generic';

export interface EventItem {
  id: number;
  slug: string;
  organizer: string;
  title: string;
  venue: string;
  city: City;
  category: Category;
  description: string;
  image_url: string;
  event_date?: string;
  starts_at: string;
  starts_at_human: string;
  date?: string;
  time?: string;
  type?: string;
  location?: string;
  image?: string;
  featured?: boolean;
  price_mad: number;
  is_free: boolean;
  is_sold_out: boolean;
  badge: string | null;
  buyingMode?: BuyingMode;
  buying_mode?: BuyingMode;
  hasPlan?: boolean;
  has_plan?: boolean;
  planType?: PlanType | null;
  plan_type?: PlanType | null;
  seatingEnabled?: boolean;
  seating_enabled?: boolean;
}


export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
