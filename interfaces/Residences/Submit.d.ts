export interface ResType {
  id: number;
  image_url: string;
  name: string;
}

export interface ResRegion {
  id: number;
  image_url: string;
  name: string;
}

export interface RentType {
  description?: string;
  id: number;
  image_url: string;
  name: string;
}

export interface ResidenceSpecs {
  description?: string;
  floor?: string;
  foundation_area: number; // age be api megdari dade nashode bashe, 0 bar migardune. na null.
  id: number;
  name: string;
  total_area: number; // age be api megdari dade nashode bashe, 0 bar migardune. na null.
}

export interface ResidenceCapacity_IRoom_For_Submit {
  double_bed: number;
  extras: string;
  name: string;
  // id?: number; // Rooms which were retrieved from api defenitely had id. Newly created rooms in the app do NOT have id.
  single_bed: number;
  traditional_bed: number;
}

export interface IRoomData_Server {
  double_bed: number;
  extras: string;
  // id: number;
  name: string;
  single_bed: number;
  traditional_bed: number;
}

export interface IResidenceCapacities_Server {
  capacity: number;
  max_capacity: number;
  rooms: IRoomData_Server[];
}

export interface IAmenity_ExtraFeature {
  field_type: "text" | "dropdown" | "switch" | "checkbox";
  in_filter?: boolean; // not sure if this is boolean
  name: string | "توضیحات";
  placeholder?: string; // will exist when 'field_type' is ("text" or "dropdown" or )
  values?: string;
}

// NOTES ABOUT IAmenity_ExtraFeature
// field_type == "switch" ==> values == "دارد, ندارد" || values == "بله, خیر" || values == "فعال, غیرفعال"
export type TSwitchValues = "دارد, ندارد" | "بله, خیر" | "فعال, غیرفعال";

export interface ResidenceAmenity {
  category: string;
  extra_features?: IAmenity_ExtraFeature[];
  icon_url: string;
  id: number;
  name: string;
  values: string; // not important for us in the front-end. we have checkboxes, no matter what values come from api.
}

export interface IResidenceExactAdress {
  latitude?: string; // stringified number
  longitude?: string; // stringified number
}

export interface IDocs {
  document?: string;
  host_national_card?: string;
  owner_national_card?: string;
}

export interface IGeneralPricing {
  extra_price: number;
  monthly_discount: number;
  peak_price: number;
  week_price: number;
  weekend_price: number;
  weekly_discount: number;
}
