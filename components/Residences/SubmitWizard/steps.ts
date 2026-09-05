import type { Draft } from "@/api/Residences/hostWizard";

/**
 * The wizard, described once.
 *
 * Order, titles, icons and "is this step done" all live here, so a step cannot
 * be registered in the router and forgotten in the progress rail — which is
 * exactly what the previous fifteen-step version did in three separate places.
 *
 * `isComplete` is the interesting one. It is asked three questions by three
 * different parts of the UI:
 *
 *   - the rail, to tick a step off;
 *   - the resume logic, to decide where a returning host lands;
 *   - the review screen, to list what is still missing before submission.
 *
 * All three want the same answer, so it is defined in one place and read from
 * the draft — never from local component state, which does not survive a
 * reload and therefore cannot be trusted to say what is saved.
 */

export interface WizardStepDef {
  key: string;
  /** Heading on the step itself. */
  title: string;
  /** Short label for the progress rail, where there is no room for a sentence. */
  short: string;
  icon: string;
  /** One line under the heading. Skipped when the step speaks for itself. */
  hint?: string;
  /**
   * Whether the listing can be submitted for review without this step.
   * Optional steps still show in the rail; they are just not blockers.
   */
  optional?: boolean;
  isComplete: (d: Draft) => boolean;
}

const has = (v: unknown) => v !== null && v !== undefined && String(v).trim() !== "";
const positive = (v: number | null | undefined) => typeof v === "number" && v > 0;

/**
 * Whether the listing carries the «منطقه» answer.
 *
 * Not `residence.region`. That column is a dead end — the panel used to write
 * free text into it and nothing ever read it back; the real answer lives as an
 * amenity keyed `area`, which is what the SEO tag pages match on. The wizard
 * writes both (see the Details step), but the 9,570 listings migrated from
 * Odoo only ever got the amenity — so asking `region` alone told every single
 * one of them, live and selling, that their details were incomplete.
 */
const hasArea = (d: Draft) =>
  has(d.region) || (d.amenities ?? []).some((a) => a.amenity?.key === "area");

/** What `createResidence` writes before the host has named anything. */
export const DEFAULT_NAME = "اقامتگاه بدون نام";

/** Below this the listing looks abandoned in search results. */
export const MIN_IMAGES = 3;

export const STEPS: WizardStepDef[] = [
  {
    key: "details",
    title: "اقامتگاه شما چه نوعی است؟",
    short: "جزئیات",
    icon: "icon-Home",
    hint: "نوع و منطقه، دو چیزی که مهمان اول از همه بر اساسشان جست‌وجو می‌کند.",
    isComplete: (d) => !!d.type && hasArea(d),
  },
  {
    key: "specs",
    title: "مشخصات اقامتگاه",
    short: "مشخصات",
    icon: "icon-Details",
    hint: "نام و توضیحی که مهمان در صفحه‌ی اقامتگاه می‌بیند.",
    isComplete: (d) => has(d.name) && d.name !== DEFAULT_NAME,
  },
  {
    key: "address",
    title: "آدرس و محل دقیق",
    short: "آدرس",
    icon: "icon-Location",
    hint: "نشانی کامل فقط بعد از قطعی‌شدن رزرو به مهمان نشان داده می‌شود.",
    isComplete: (d) => !!d.locationId && has(d.address),
  },
  {
    key: "capacity",
    title: "ظرفیت و اتاق‌ها",
    short: "ظرفیت",
    icon: "icon-Rooms",
    isComplete: (d) => positive(d.capacity),
  },
  {
    key: "amenities",
    title: "امکانات اقامتگاه",
    short: "امکانات",
    icon: "icon-Possibilities",
    hint: "هرچه دقیق‌تر، اقامتگاه شما در فیلترهای بیشتری دیده می‌شود.",
    optional: true,
    isComplete: (d) => (d.amenities?.length ?? 0) > 0,
  },
  {
    key: "pricing",
    title: "نرخ اقامتگاه",
    short: "نرخ",
    icon: "icon-Pay",
    hint: "همه‌ی مبالغ به تومان است و بعداً از تقویم قابل تغییر است.",
    isComplete: (d) => positive(d.weekPrice),
  },
  {
    key: "images",
    title: "تصاویر اقامتگاه",
    short: "تصاویر",
    icon: "icon-Photo",
    hint: "اولین تصویر، کاور اقامتگاه شماست.",
    isComplete: (d) => (d.images?.length ?? 0) >= MIN_IMAGES,
  },
  {
    key: "documents",
    title: "مدارک",
    short: "مدارک",
    icon: "icon-Attach",
    hint: "برای احراز مالکیت. فقط کارشناسان لیدوما این مدارک را می‌بینند.",
    isComplete: (d) => has(d.hostNationalCardUrl) && has(d.documentUrl),
  },
  {
    key: "rules",
    title: "قوانین و شرایط",
    short: "قوانین",
    icon: "icon-CancellationRules",
    // Deliberately not `cancellationPolicy`: it was never migrated, so 9,569
    // of 9,570 live listings have none and run on the platform default. The
    // Rules step still requires a host to choose one before saving, which is
    // the gate that actually matters; asking for it here only mislabelled
    // every old listing. Check-in and check-out are different — a guest is
    // genuinely shown nothing when they are missing.
    isComplete: (d) => has(d.checkinFrom) && has(d.checkout),
  },
  {
    key: "review",
    title: "پیش‌نمایش و ثبت نهایی",
    short: "پیش‌نمایش",
    icon: "icon-See",
    isComplete: () => false, // reached, never "done" — submitting leaves the wizard
  },
];

export const TOTAL_STEPS = STEPS.length;

/** Steps that must be complete before the listing can be sent for review. */
export const requiredSteps = () => STEPS.filter((s) => !s.optional && s.key !== "review");

/**
 * The furthest step worth landing on.
 *
 * A returning host should not be dropped at step one to click through work
 * they already did, nor thrown to the end past something they never filled in.
 * The first gap is the honest answer to "where was I".
 */
export function resumeIndex(draft: Draft | undefined): number {
  if (!draft) return 0;
  const firstGap = STEPS.findIndex((s) => !s.optional && !s.isComplete(draft));
  return firstGap === -1 ? TOTAL_STEPS - 1 : firstGap;
}

/**
 * Progress for the server's `step` column.
 *
 * That column is a 0–14 marker from the previous wizard and it feeds
 * `completionPercent`, which the admin panel and the host's own listing cards
 * display. This wizard has ten steps, so the two scales are mapped rather than
 * pretending to be the same thing — and the mapping is monotonic, because the
 * backend only ever moves the marker forward.
 */
const LEGACY_SCALE = 14;
export function legacyStep(index: number): number {
  return Math.round(((index + 1) / TOTAL_STEPS) * LEGACY_SCALE);
}
