export type I_Change_Residence_Status_display_type_payload = "boomgardi" | "suit" | "all";
export type I_Change_Residence_Status_display_type = "boomgardi" | "suit";
export type I_Change_Residence_Search_type = "res_code" | "res_name" | "host_name" | "host_phone" | "city_name"
export interface IChangeResidenceStatusGeneralPricingInitV {
    basePrice: number | null;
    weekEndPrice: number | null;
    peakDaysPrice: number | null;
    extraGuestPrice: number | null;
    weeklyReserveDiscount: number | null;
    monthlyReserveDiscount: number | null;
  }

// res_code: "کد اقامتگاه",
// res_name: "نام اقامتگاه",
// host_name: "نام میزبان",
// host_phone: "شماره میزبان",
// city_name: "نام شهر",