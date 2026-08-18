export interface IGeneralFilter {
  start?: string; // ex: 1401/08/12
  end?: string; // ex: 1401/08/16
  // tonight?: boolean;
  nights?: number;
  rooms_count?: number;
  cat_name: string;
  beds_count?: number;
  min_price?: number;
  max_price?: number;
  guests_count?: number;
  // hotel_stars?: number;
  map_bounds?: {
    min_lat: number;
    max_lat: number;
    min_lng: number;
    max_lng: number;
  };
  // fast?: boolean;
  // rating?: string;
}
