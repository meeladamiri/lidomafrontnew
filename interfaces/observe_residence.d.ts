import {
  I_Residence_display_type,
  // I_Residence_display_type_without_hotel,
} from "@/interfaces/Residences";

export interface IResidenceForReviews {
  id: number;
  name: string;
  min_price: number;
  main_image: string;
  display_type: I_Residence_display_type;
}

export interface IFeature {
  category: string;
  icon_url: string; // ex: "https://test.lidomatrip.com/web/image/product.attribute/2/x_icon"
  id: number;
  name: string;
  value: string;
}

export type T_image = {
  id: number;
  name?: string;
  url: string; // "https://cdn.lidomatrip.com/web/image/product.image/151395/image/منزل-لوکس-در-کیش.jpg"
};

interface IReview {
  average_rating: number;
  comment: string;
  customer: string;
  id: number; // TODO
  reserve_date: string | null; // ex: "2022-03-19";
  residence_code?: string; // ex: "111-21034"
  residence?: IResidenceForReviews;
}

interface IRoom {
  double_bed: number;
  extras: string;
  id: number;
  name: string;
  single_bed: number;
  traditional_bed: number;
}

export interface IRule {
  category: string;
  id: number;
  name: string;
  value: string;
}
interface ISimilarRes {
  average_rating: number;
  city: string;
  city_id: number;
  discount: number;
  display_type: I_Residence_display_type;
  id: number;
  images: string[]; // ex: "https://cdn.lidomatrip.com/web/image/product.image/182258/image/خانه-ویلایی-در-کیش.jpg"
  is_fast: boolean;
  is_full: boolean;
  is_offer: boolean;
  latitude: string; // ex: "26.5482896985"
  longitude: string; // ex: "53.9782572928";
  main_image: string; // ex: "https://cdn.lidomatrip.com/web/image/product.template/22680/image/خانه-ویلایی-در-کیش.jpg";
  max_capacity: number;
  min_price?: number;
  name: string;
  neighborhood?: string;
  province: string;
  province_id: number;
  reference: number;
  reviews_count: number;
  rooms_count: number;
  name2: string;
  capacity: number;
}

interface ITag {
  cat_name: string;
  cat_title: string;
  tag: string;
  title: string;
}

interface IResidenceInfo {
  average_rating: number;
  cancel_commission: number;
  capacity: number;
  checkin_from: [null | string];
  checkin_to: [null | string];
  checkout: [null | string];
  city_id: number;
  city: string;
  city_title: string;
  cleaning_rate?: number;
  delivery_rate?: number;
  description: string;
  display_type: I_Residence_display_type;
  extra_features?: {
    [key: string | "others"]:
      | ""
      | false
      | {
          [key: string | "توضیحات"]: any; // value will most probably be a string
        };
  };
  extra_rules?: string; // ex: "{\"248\": \"\", \"desc\": \"TEST DESCRIPTION\", \"245\": \"\", \"247\": {\"desc\": \"test\"}}"
  foundation_area: number;
  host_share_future_nights: number;
  before_start_time: number;
  host_share_past_nights: number;
  host_share_total_amount: number;
  full_return_time: number;
  greeting_rate?: number;
  host: {
    answer_time: number; // ex: 1422.57746478872  -- in minute
    description: string;
    image_url: string; // ex: "https://test.lidomatrip.com/web/image/res.partner/92809/image_small";
    joined_date: string; //ex: "2021-08-09 05:32:38.822131";
    last_update: string; //ex: "2023-03-17 12:10:59";
    name: string;
    reference: string;
  };
  id: number;
  integrity_rate?: number;
  is_fast: boolean;
  is_full: boolean;
  is_offer: boolean;
  latitude?: string; // ex: "37.5721338488";
  longitude?: string; // ex: "45.0679813297";
  location_rate?: number;
  main_image: string[]; // ex: "https://cdn.lidomatrip.com/web/image/product.template/22743/image/اقامتگاه-بومگردی-آبشار.jpg"
  max_capacity: number;
  min_reservable_days?: number;
  name: string;
  name2: string;
  province_id: number;
  province: string;
  province_title: string;
  quality_rate?: number;
  reference: string;
  reserve_commission: number;
  reviews_count: number;
  residence_type: string;
  total_area: number;
  video_url?: string; // ex: "https://www.aparat.com/video/video/embed/videohash/mqZhB/vt/frame"
  price_details: {
    discount: number;
    discounted_price: number;
    extra_price: number;
    original_price: number;
  };
}

export interface I_FAQ {
  answer: string;
  id: number;
  question: string;
}

export interface IDistanceItem {
  distance: string; // ex: "9.4 کیلومتر";
  name: string; // ex : "فرودگاه بین المللی شهید دستغیب شیراز";
  time: string; // ex: "17 دقیقه";
}

export interface IObserveResidenceData {
  distances: IDistanceItem[];
  faqs: I_FAQ[];
  features: IFeature[];
  images: T_image[];
  residence_info: IResidenceInfo;
  reviews: IReview[];
  rooms: IRoom[];
  rules: IRule[];
  similar_res: ISimilarRes[];
  tags: ITag[];
}
