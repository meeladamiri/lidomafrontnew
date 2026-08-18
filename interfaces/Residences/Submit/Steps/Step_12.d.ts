export interface IExtraRule {
  [key: string | number | "desc"]:
    | string
    | {
        desc?: string;
      };
}

export interface ISpecifiedRulesOfResComingFromApi {
  checkin_from: string; // ex: "05:00"
  checkin_to: string; // ex: "15:00"
  checkout: string; // ex: "23:00"
  id: number;
  min_reservable_days: number;
  extra_rules?: string; // A JSON object. needs to be parsed.
  rules: {
    category: "مقررات اقامتگاه";
    id: number;
    name: string;
    value: "بله";
  }[];
}

export interface IStaticRule {
  id: number;
  name: string;
  icon_url?: string;
  category: string; // definitely "مقررات اقامتگاه"
}

export interface ISelectedRulesData {
  id: number;
  name: string;
  category: "مقررات اقامتگاه";
  iconUrl?: string;
  userDesc: string;
  checked: boolean;
}

export interface IRule_ForSubmitApi {
  id: number;
  extra_rules:
    | ""
    | {
        desc: string;
      };
}
