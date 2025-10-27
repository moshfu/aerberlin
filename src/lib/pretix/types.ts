export interface PretixEvent {
  slug: string;
  name: Record<string, string>;
  date_from: string;
  date_to?: string;
  location?: string;
  is_public: boolean;
  plugins?: string[];
}

export interface PretixProduct {
  id: number;
  name: Record<string, string>;
  description: Record<string, string>;
  default_price: string;
  category?: number | null;
  min_per_order?: number;
  max_per_order?: number;
  active: boolean;
  sales_channels?: string[];
}

export interface PretixQuotaAvailability {
  item: number;
  total_capacity?: number | null;
  available: number | null;
  blocked: number;
  waiting_list?: number;
}

export interface PretixOrderPosition {
  id: number;
  item: number;
  variation?: number | null;
  attendee_name?: string;
  secret: string;
  redeemed: boolean;
}

export interface PretixOrder {
  code: string;
  status: string;
  email: string;
  total: string;
  locale: string;
  positions: PretixOrderPosition[];
}

export interface PretixListResponse<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}
