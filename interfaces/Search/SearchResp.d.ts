import { IPrices } from "@/components/Search/SearchResidenceCard";
import { IGeneralFilter } from ".";
import { I_Residence_display_type } from "../Residences";

// SEARCH APIs RESPONSES INTERFACES
// export interface ITag_SearchResidences {
//   id: number;
//   name: string;
//   title: string;
// }
export interface IFAQ_SearchResidences {
  answer: string;
  id: number;
  question: string;
}

export interface IPrices {
  discounted_days: {
    date: string;
    amount: number; // in percentage
  }[];
  extra_guests_price: number;
  monthly_discount: number;
  peak_price: number;
  special_dates: [
    string, // date
    number // price
  ][];
  week_price: number;
  weekend_price: number;
  weekly_discount: number;
}

export interface IProduct_SearchResidences {
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
  nowruz_price?: number;
  name: string;
  neighborhood?: string;
  province: string;
  province_id: number;
  reference: number;
  reviews_count: number;
  rooms_count: number;
  name2: string;
  prices: IPrices;
  capacity: number;
}

export interface ISearchResidences_ServerResp {
  // canonical_url: string; // ex: "/search/"
  // content_title?: string;
  count: number;
  // description: string; // stringified html
  // meta_description?: string;
  // meta_keywords?: string;
  // meta_title?: string; // ex: "سایت لیدوما تریپ | سامانه یکپارچه رزرو انواع اقامتگاه | در سراسر کشور"; OR "اجاره سوئیت در تهران | اجاره روزانه خانه و آپارتمان مبله | لیدوماتریپ"
  // page_title?: string;
  // tags: ITag_SearchResidences[];
  peak_dates: [
    string, // start of range --> ex:
    string // end of range
  ][];
  // faqs: IFAQ_SearchResidences[];
  products: IProduct_SearchResidences[];
}

export interface ISearchPageData_ServerResp {
  // canonical_url: string; // ex: "/search/"
  // meta_description?: string;
  // meta_keywords?: string;
  // meta_title?: string; // ex: "سایت لیدوما تریپ | سامانه یکپارچه رزرو انواع اقامتگاه | در سراسر کشور"; OR "اجاره سوئیت در تهران | اجاره روزانه خانه و آپارتمان مبله | لیدوماتریپ"
  // page_title?: string;
  // related_tags: ITag_SearchResidences[];
}

export interface I_SearchResidenceApi_params {
  page: number;
  page_size: number;
  order: string | undefined;
  filters: IGeneralFilter | undefined;
  features: string[];
  replace_lead: string | undefined; // TODO: is it string?
  lead_id: string | undefined; // TODO: is it string?
  alt_order: string | undefined; // TODO: is it string?
  page_type: "lead_id" | "replace_lead" | "alt_order" | "search";
}

export interface I_GetCityReviewsApi_params {
  res_type: string | undefined;
  cat_id: string;
}
