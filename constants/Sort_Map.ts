export type TSort_Map =
  // | "highest_view"
  | "lidoma_suggestion"
  // | "highest_reserve"
  | "highest_rate"
  | "highest_price"
  | "lowest_price"
  // | "newest"
  | "highest_discount";

export const Sort_Map: {
  [key in TSort_Map]: string;
} = {
  // highest_view: "پربازدید ترین", // NOTE: 'highest_view' is not supported by backend. in case this sort is selected, send undefined;
  lidoma_suggestion: "پیشنهاد لیدوما", // NOTE: 'highest_view' is not supported by backend. in case this sort is selected, send undefined;
  lowest_price: "کمترین قیمت",
  highest_price: "بیشترین قیمت",
  highest_rate: "بیشترین امتیاز",
  highest_discount: "بیشترین تخفیف",
  // highest_reserve: "بیشترین رزرو",
  // newest: "جدید ترین",
};
