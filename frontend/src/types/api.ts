export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface City {
  id: number;
  name: string;
  slug: string;
}

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
  starts_at: string;
  starts_at_human: string;
  price_mad: number;
  is_free: boolean;
  is_sold_out: boolean;
  badge: string | null;
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
