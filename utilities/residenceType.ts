// "نوع ملک" — the residence's own category (independent of the city
// taxonomy). Mirrors the backend's lib/residenceType.ts so slugs and Persian
// labels stay in one place on each side.
export type ResidenceTypeEnum = "SUIT" | "BOOMGARDI" | "HOTEL";

const SLUG: Record<ResidenceTypeEnum, "suit" | "boomgardi" | "hotel"> = {
  SUIT: "suit",
  BOOMGARDI: "boomgardi",
  HOTEL: "hotel",
};

const LABEL: Record<ResidenceTypeEnum, string> = {
  SUIT: "سوئیت",
  BOOMGARDI: "بوم‌گردی",
  HOTEL: "هتل",
};

/** Legacy `display_type` slug the old UI components branch on. */
export function residenceTypeSlug(type: string | undefined | null) {
  return SLUG[(type ?? "SUIT") as ResidenceTypeEnum] ?? "suit";
}

/** Persian label interpolated into UI copy ("امکانات __", "__ به میزبانی: "). */
export function residenceTypeLabel(type: string | undefined | null) {
  return LABEL[(type ?? "SUIT") as ResidenceTypeEnum] ?? "سوئیت";
}
