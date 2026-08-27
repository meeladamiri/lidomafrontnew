// Old backend: `/api/residence/get_allowed_values` returned per-step option
// catalogs (residence type, region, rent type) that were presumably
// admin-configurable in Odoo. The new backend has no such config surface, so
// these are just fixed lists — small enough to keep here instead of adding a
// backend endpoint for content that never actually changes.

const PLACEHOLDER_IMG = "/assets/res-placeholder.jpg";

const RES_TYPES = [
  { id: 1, name: "سوئیت", image_url: PLACEHOLDER_IMG },
  { id: 2, name: "اقامتگاه بوم‌گردی", image_url: PLACEHOLDER_IMG },
];

const RES_REGIONS = [
  { id: 1, name: "شمال", image_url: PLACEHOLDER_IMG },
  { id: 2, name: "تهران و اطراف", image_url: PLACEHOLDER_IMG },
  { id: 3, name: "جنوب", image_url: PLACEHOLDER_IMG },
  { id: 4, name: "سایر شهرها", image_url: PLACEHOLDER_IMG },
];

const RENT_TYPES = [
  { id: 1, name: "اجاره کل اقامتگاه", description: "کل اقامتگاه در اختیار یک مهمان قرار می‌گیرد", image_url: PLACEHOLDER_IMG },
  { id: 2, name: "اجاره اتاقی", description: "اتاق‌های اقامتگاه به‌صورت جداگانه رزرو می‌شوند", image_url: PLACEHOLDER_IMG },
];

/**
 * Synchronous, because there is nothing to wait for.
 *
 * These lists live in this file. Wrapping them in `useQuery` made three of
 * the wizard's first four screens render a full-page spinner for a tick, on
 * data that was already in the bundle — the wizard looked slowest exactly
 * where a host decides whether it is worth continuing.
 */
const allowedValuesFor = ({ step }: { step: number }): any => {
  switch (step) {
    case 1:
      return { status: "success", params: { values: RES_TYPES } };
    case 2:
      return { status: "success", params: { values: RES_REGIONS } };
    case 3:
      return { status: "success", params: { values: RENT_TYPES } };
    default:
      // step -1 (intro banner) and step 8 (map help text) just render nothing
      // when these keys are absent — both components already guard for that.
      return { status: "success", params: {} };
  }
};

/** Kept async for callers that still await it. */
const getAllowedValues = async ({ step }: { step: number }): Promise<any> =>
  allowedValuesFor({ step });

export { allowedValuesFor, getAllowedValues };
