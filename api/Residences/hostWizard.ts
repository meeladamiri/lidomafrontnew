/**
 * The submission wizard's data layer.
 *
 * One typed function per thing the wizard can save, each mapping to the REST
 * endpoint that already exists. The endpoints and their field names are not
 * ours to rename — the admin panel reads the same columns — so this file is a
 * thin, honest translation and nothing more.
 *
 * Two things it does that the old dispatcher did not:
 *
 *  - it returns a discriminated result instead of a {status, err_msg}
 *    envelope, so a caller cannot forget to check;
 *  - it carries the server's per-field validation errors through. The backend
 *    now says *which* field it rejected; throwing that away at the boundary is
 *    how «ورودی نامعتبر است» stayed a mystery for a whole release.
 */

import client from "../index";

// -------------------------------------------------------------- results ---

export interface Ok<T> {
  ok: true;
  data: T;
}

export interface Err {
  ok: false;
  /** Shown to the host. Always in Persian, always safe to render. */
  message: string;
  /** Field name to messages, when the server rejected specific inputs. */
  fieldErrors?: Record<string, string[]>;
  /** True when the request never reached the server (offline, timeout). */
  offline?: boolean;
}

export type Result<T> = Ok<T> | Err;

const GENERIC = "خطایی رخ داد. دوباره تلاش کنید.";

function toError(err: any): Err {
  // No response at all: the request did not reach the server. Worth saying so,
  // because "check your connection" is actionable and «خطایی رخ داد» is not.
  if (!err?.response) {
    return {
      ok: false,
      message: "ارتباط با سرور برقرار نشد. اتصال خود را بررسی کنید.",
      offline: true,
    };
  }
  const body = err.response.data;
  return {
    ok: false,
    message: body?.message || GENERIC,
    fieldErrors: body?.details?.fieldErrors,
  };
}

async function request<T>(fn: () => Promise<any>): Promise<Result<T>> {
  try {
    const res = await fn();
    return { ok: true, data: res?.data?.data as T };
  } catch (err) {
    return toError(err);
  }
}

// ---------------------------------------------------------------- types ---

export type ResidenceTypeCode = "SUIT" | "BOOMGARDI" | "HOTEL";

export interface DraftImage {
  id: number;
  url: string;
  title: string | null;
  isMain: boolean;
  sortOrder: number;
}

export interface DraftRoom {
  id?: number;
  name: string;
  description?: string | null;
  singleBed?: number | null;
  doubleBed?: number | null;
  traditionalBed?: number | null;
  extraBeds?: number | null;
}

/**
 * The residence as the host wizard sees it.
 *
 * Straight from GET /api/host/residences/:id — same names as the database and
 * the admin panel, deliberately. A second vocabulary for the same columns is a
 * translation table someone has to keep correct forever.
 */
export interface Draft {
  id: number;
  reference: string | null;
  state: string;
  step: number | null;
  type: ResidenceTypeCode;

  name: string | null;
  hostSuggestedName: string | null;
  description: string | null;
  region: string | null;
  floor: string | null;
  totalArea: number | null;
  foundationArea: number | null;

  locationId: number | null;
  location: { id: number; name: string; parent?: { id: number; name: string } | null } | null;
  neighborhood: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;

  capacity: number | null;
  maxCapacity: number | null;
  rooms: DraftRoom[];

  amenities: {
    amenityId: number;
    extraFeatures?: any;
    amenity?: { id: number; name: string };
  }[];
  otherAmenities: string | null;

  weekPrice: number | null;
  weekendPrice: number | null;
  peakPrice: number | null;
  extraPrice: number | null;
  extraGuestsPrice: number | null;
  extraGuestsPeakPrice: number | null;
  weeklyDiscount: number | null;
  monthlyDiscount: number | null;

  images: DraftImage[];

  documentUrl: string | null;
  hostNationalCardUrl: string | null;
  ownerNationalCardUrl: string | null;

  rules: { ruleId: number; value?: any; rule?: { id: number; name: string } }[];
  rulesDesc: string | null;
  checkinFrom: string | null;
  checkinTo: string | null;
  checkout: string | null;
  minReservableDays: number | null;
  cancellationPolicy: string | null;
  fullReturnTime: number | null;
  beforeStartTime: number | null;
  hostShareTotalAmount: number | null;
  hostSharePastNights: number | null;
  hostShareFutureNights: number | null;

  published: boolean;
  suspendedAt: string | null;
  suspensionReason: string | null;
  pendingChangesSubmittedAt: string | null;
  /** What the host changed on a live listing that an admin has not ruled on
   * yet — one key per wizard step, plus `gallery`/`documents`. The live row
   * above still holds the approved values, which is what guests see. */
  pendingChanges: PendingChanges | null;
  defects: DraftDefect[];
}

export interface PendingGallery {
  /** Uploaded but not yet a real image row — addressed by negative id. */
  add: { url: string; title?: string | null }[];
  removeIds: number[];
  order?: number[];
  main?: number | string | null;
}

export interface PendingChanges {
  specs?: Record<string, unknown>;
  amenities?: Record<string, unknown>;
  rules?: Record<string, unknown>;
  pricing?: Record<string, unknown>;
  capacity?: Record<string, unknown>;
  gallery?: PendingGallery;
  documents?: Record<string, unknown>;
}

/** Which wizard step each pending key belongs to, so «در انتظار بررسی» shows
 * on the screen the host edited. Mirrors the backend's own step keys. */
export const PENDING_STEP_INDEX: Record<string, number> = {
  specs: 1,
  capacity: 3,
  amenities: 4,
  pricing: 5,
  gallery: 6,
  documents: 7,
  rules: 8,
};

export const PENDING_STEP_LABEL: Record<string, string> = {
  specs: "نام و مشخصات",
  capacity: "ظرفیت",
  amenities: "امکانات",
  pricing: "نرخ‌گذاری",
  gallery: "تصاویر",
  documents: "مدارک",
  rules: "قوانین و شرایط",
};

export type DefectSection =
  | "DETAILS"
  | "SPECS"
  | "LOCATION"
  | "CAPACITY"
  | "AMENITIES"
  | "PRICING"
  | "GALLERY"
  | "DOCUMENTS"
  | "RULES"
  | "OTHER";

export interface DraftDefect {
  id: number;
  section: DefectSection;
  severity: "MANDATORY" | "SUGGESTED";
  description: string;
  createdAt: string;
  reviewRequestedAt: string | null;
  resolvedAt: string | null;
}

export const SECTION_LABEL: Record<DefectSection, string> = {
  DETAILS: "نوع و منطقه اقامتگاه",
  SPECS: "نام و توضیحات",
  LOCATION: "آدرس و محل دقیق",
  CAPACITY: "ظرفیت و اتاق‌ها",
  AMENITIES: "امکانات",
  PRICING: "نرخ‌گذاری",
  GALLERY: "گالری تصاویر",
  DOCUMENTS: "مدارک",
  RULES: "قوانین و شرایط",
  OTHER: "سایر",
};

/** A defect's section, as the step index it maps to in the wizard's `STEPS`
 * — one-to-one except OTHER, which names nothing specific to jump to. Used
 * inside the wizard, where positions are what `goTo` speaks. */
export const SECTION_STEP_INDEX: Partial<Record<DefectSection, number>> = {
  DETAILS: 0,
  SPECS: 1,
  LOCATION: 2,
  CAPACITY: 3,
  AMENITIES: 4,
  PRICING: 5,
  GALLERY: 6,
  DOCUMENTS: 7,
  RULES: 8,
};

/** The same map for links from outside the wizard: the edit page addresses
 * sections by name (`?section=rules`), which survives the steps being
 * reordered in a way a position does not. */
export const SECTION_STEP_KEY: Partial<Record<DefectSection, string>> = {
  DETAILS: "details",
  SPECS: "specs",
  LOCATION: "address",
  CAPACITY: "capacity",
  AMENITIES: "amenities",
  PRICING: "pricing",
  GALLERY: "images",
  DOCUMENTS: "documents",
  RULES: "rules",
};

const base = "/api/host/residences";

// ------------------------------------------------------------ the calls ---

export const listDrafts = () => request<Draft[]>(() => client.get(base));

export const getDraft = (id: number) => request<Draft>(() => client.get(`${base}/${id}`));

/** «درخواست بررسی مجدد» — bulk-marks every open defect ready for another look. */
export const requestDefectReview = (id: number) =>
  request<{ requested: number }>(() => client.post(`${base}/${id}/defects/request-review`));

export const createDraft = (body: { type: ResidenceTypeCode; cityName?: string }) =>
  request<Draft>(() => client.post(base, body));

/**
 * The residence row itself: name, description, area, region, address, map pin.
 *
 * Four of the wizard's steps write here. They are separate screens for the
 * host and one endpoint for the server, which is the right way round — the
 * grouping is a matter of attention span, not of storage.
 */
export const saveSpecs = (id: number, patch: Record<string, unknown>) =>
  request<Draft>(() => client.patch(`${base}/${id}`, patch));

export const saveCapacity = (
  id: number,
  patch: { capacity?: number; maxCapacity?: number; step?: number }
) => request<Draft>(() => client.patch(`${base}/${id}/capacity`, patch));

/** Replace-all: the step submits the whole room list, so diffing buys nothing. */
export const saveRooms = (
  id: number,
  patch: { capacity?: number; maxCapacity?: number; rooms: DraftRoom[] }
) => request<Draft>(() => client.put(`${base}/${id}/rooms`, patch));

export const saveAmenities = (
  id: number,
  patch: {
    amenities: { amenityId: number; extraFeatures?: any }[];
    other?: string;
    step?: number;
    /**
     * The amenity ids this caller owns. Without it the endpoint deletes every
     * amenity on the listing and recreates only what it was given — which
     * would take «نوع اقامتگاه» and «منطقه اقامتگاه» with it.
     */
    scopeIds?: number[];
  }
) => request<Draft>(() => client.patch(`${base}/${id}/amenities`, patch));

export const savePricing = (id: number, patch: Record<string, unknown>) =>
  request<Draft>(() => client.patch(`${base}/${id}/pricing`, patch));

export const saveRules = (id: number, patch: Record<string, unknown>) =>
  request<Draft>(() => client.patch(`${base}/${id}/rules`, patch));

/**
 * Sends the listing for review.
 *
 * Safe to call twice. It sets a state rather than appending anything, so a
 * double tap or a retry after a timeout lands on the same row in the same
 * state — which is what makes the submit button safe to press again when the
 * host is not sure the first press registered.
 */
export const submitForReview = (id: number, step: number) =>
  request<Draft>(() => client.patch(`${base}/${id}/state`, { action: "submit", step }));

// ----------------------------------------------------------------- files ---

export const uploadImage = (
  id: number,
  file: File,
  opts: { isMain?: boolean; title?: string; onProgress?: (percent: number) => void } = {}
) => {
  const form = new FormData();
  form.append("image", file);
  if (opts.isMain !== undefined) form.append("isMain", String(opts.isMain));
  if (opts.title) form.append("title", opts.title);

  return request<DraftImage>(() =>
    client.post(`${base}/${id}/images`, form, {
      onUploadProgress: (e: any) => {
        if (!opts.onProgress || !e.total) return;
        opts.onProgress(Math.round((e.loaded / e.total) * 100));
      },
    })
  );
};

export const deleteImage = (id: number, imageId: number) =>
  request<{ success: boolean }>(() => client.delete(`${base}/${id}/images/${imageId}`));

/** Picking the cover photo. */
export const setMainImage = (id: number, imageId: number) =>
  request<DraftImage>(() => client.patch(`${base}/${id}/images/${imageId}`, { isMain: true }));

/**
 * Commits gallery order.
 *
 * WARNING: this endpoint also DELETES any non-main image missing from the
 * list — it is "here is the final gallery", not "here is a new order". Always
 * send every image the host still wants to keep.
 */
export const reorderImages = (id: number, imageIds: number[], step?: number) =>
  request<{ success: boolean }>(() =>
    client.post(`${base}/${id}/images/order`, { imageIds, step })
  );

export const uploadDocuments = (
  id: number,
  files: { hostNationalCard?: File; document?: File; ownerNationalCard?: File },
  onProgress?: (percent: number) => void
) => {
  const form = new FormData();
  if (files.hostNationalCard) form.append("hostNationalCard", files.hostNationalCard);
  if (files.document) form.append("document", files.document);
  if (files.ownerNationalCard) form.append("ownerNationalCard", files.ownerNationalCard);

  return request<Draft>(() =>
    client.post(`${base}/${id}/documents`, form, {
      onUploadProgress: (e: any) => {
        if (!onProgress || !e.total) return;
        onProgress(Math.round((e.loaded / e.total) * 100));
      },
    })
  );
};

// ------------------------------------------------------- classification ---

export interface ClassificationField {
  key: "type" | "area";
  name: string;
  options: string[];
  /** Absent on the options-only call, which runs before a residence exists. */
  selected?: string[];
}

/**
 * «نوع اقامتگاه» و «منطقه اقامتگاه».
 *
 * Not the residence row's `type` enum and not its `region` column — these are
 * the amenity-backed taxonomies the SEO tag engine matches on, and the same
 * ones the admin panel edits. A listing that answers neither appears on no tag
 * page, which is what happened to every listing the old wizard created.
 */
export const getClassificationOptions = () =>
  request<{ fields: ClassificationField[] }>(() => client.get(`${base}/classification-options`));

export const getClassification = (id: number) =>
  request<{ fields: Required<ClassificationField>[] }>(() =>
    client.get(`${base}/${id}/classification`)
  );

export const saveClassification = (id: number, key: "type" | "area", values: string[]) =>
  request<{ key: string; values: string[] }>(() =>
    client.patch(`${base}/${id}/classification`, { key, values })
  );

// -------------------------------------------------------------- catalogs ---

export interface AmenityFeature {
  id: number;
  name: string;
  fieldType: string;
  placeholder?: string | null;
  values?: string | null;
}

export interface CatalogAmenity {
  id: number;
  /**
   * `type` and `area` are the SEO taxonomies, asked on step one and written
   * through the classification endpoint. They must never appear in the
   * amenities grid — and, more importantly, they must be inside `scopeIds`
   * only if this step means to own them, which it does not.
   */
  key: string | null;
  name: string;
  category: string | null;
  iconUrl: string | null;
  features: AmenityFeature[];
}

export interface CatalogRule {
  id: number;
  name: string;
  category: string | null;
  iconUrl: string | null;
}

export const getAmenityCatalog = () =>
  request<CatalogAmenity[]>(() => client.get("/api/residences/amenities"));

export const getRuleCatalog = () =>
  request<CatalogRule[]>(() => client.get("/api/residences/rules"));

/**
 * Renaming a photo.
 *
 * The caption is what a guest reads under the image in the gallery, so it is
 * worth being able to fix without deleting and re-uploading.
 */
export const updateImageTitle = (id: number, imageId: number, title: string) =>
  request<DraftImage>(() => client.patch(`${base}/${id}/images/${imageId}`, { title }));
