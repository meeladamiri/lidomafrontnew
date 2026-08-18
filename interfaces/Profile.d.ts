export interface Iprofile_data {
  address: string;
  avatar_url?: string;
  birth_day: number;
  birth_month: number;
  birth_year: number;
  city: string;
  description: string;
  education: string;
  email: string;
  emergency_phone: string;
  fax: string;
  id: number;
  job: string;
  name: string;
  national_card_url: string;
  national_code: string;
  phone: string;
  province: string;
  status: "confirmed" | "not_confirmed" | "checking" | "";
  zip: string;
  contact_phone?: string; // This is support phone.
  has_avatar: boolean;
  is_host: boolean;
  current_trip?: {
    expiry_date: string; // ex: "2023-03-10 14:44:09";
    id: number;
    product_name: string;
  };
}
