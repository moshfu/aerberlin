export interface TicketTier {
  name: string;
  description?: string;
  price: number;
  currency: string;
  available: number | null;
  productId: number;
}

export interface TicketCatalog {
  eventSlug: string;
  pretixEventSlug: string;
  eventTitle: string;
  products: TicketTier[];
}
