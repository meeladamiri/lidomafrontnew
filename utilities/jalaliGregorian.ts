import moment from "moment-jalaali";

/** "1401/11/19" (Jalali) → "2023-02-08" (ISO, what the new backend expects). */
export function jalaliToIso(jalaliDate: string): string {
  return moment(jalaliDate, "jYYYY/jMM/jDD").format("YYYY-MM-DD");
}

/** "2023-02-08" (ISO) → "1401/11/19" (Jalali). */
export function isoToJalali(isoDate: string): string {
  return moment(isoDate, "YYYY-MM-DD").format("jYYYY/jMM/jDD");
}
