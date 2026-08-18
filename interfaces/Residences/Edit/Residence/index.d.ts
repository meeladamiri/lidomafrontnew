export interface IEditResidence_Amenity {
  category: string;
  id: number;
  name: string;
  value: string;
}

export interface IEditResidence_Image {
  id: number;
  name: string;
  url: string;
}

export interface IEditResidence_Room {
  double_bed: number;
  extras: string;
  // id: number;
  name: string;
  single_bed: number;
  traditional_bed: number;
}

export interface IEditResidence_Rule {
  category: string;
  id: number;
  name: string;
  value: string;
}

export interface IEditResidence_Fulldata {
  address?: string;
  amenities: IEditResidence_Amenity[];
  before_start_time: false;
  cancel_commission: number;
  capacity: number;
  checkin_from?: string;
  checkin_to?: string;
  checkout?: string;
  city?: string;
  description?: string;
  extra_features: "{}";
  floor?: string;
  foundation_area?: number;
  full_return_time?: number;
  host_share_future_nights?: number;
  host_share_past_nights?: number;
  host_share_total_amount?: number;
  id: number;
  images: IEditResidence_Image[];
  latitude?: string;
  longitude?: string;
  main_image?: string;
  max_capacity: number;
  min_reservable_days?: number;
  name: string;
  neigborhood?: string;
  parent_city?: { id: number; name: string };
  reserve_commission?: number;
  rooms: IEditResidence_Room[];
  rules: IEditResidence_Rule[];
  rules_desc?: string; // stringified JSON
  total_area?: number;
}
