import { residenceTypeSlug } from "@/utilities/residenceType";
// Old backend: `/api/users/panel/residences_list` (JSON-RPC, Odoo). New
// backend: `GET /api/host/residences` — reshaped here into the old
// IServerResidence[] shape Step_0 (wizard resume list) and several other
// host dashboard pages already read.

import { ResidenceStates_enum } from "@/constants/enums/residence_states";
import { I_Residence_display_type } from "@/interfaces/Residences";
import type { DefectSection } from "./hostWizard";
import apiBuilder from "../apiBuilder";

// Kept for other consumers' import compatibility (GeneralPricingAll,
// NowruzPricingAll, Residences/Edit/Calendar, Residences/Edit/FastReserve) —
// not populated by this file, since the new backend has no separate
// per-room "IServerRoom" listing endpoint outside of a residence's own
// `rooms` array.
export interface IServerRoom {
  id: number;
  is_fast: boolean;
  image_url: string;
  name: string;
  parent_id: number;
  state?: ResidenceStates_enum;
  is_complete: boolean;
  last_update_time: string;
  reference: string;
  /** کد اقامتگاه — the Odoo id for migrated listings. Not the primary key. */
  public_id: number;
  res_type: I_Residence_display_type;
  sales_count: number;
  completion_percent?: number;
  step?: number;
}

export interface IServerResidence {
  id: number;
  image_url: string;
  is_complete: boolean;
  is_fast_enabled: boolean;
  last_update_time: string;
  name: string;
  published: boolean;
  reference: string;
  /** کد اقامتگاه — the Odoo id for migrated listings. Not the primary key. */
  public_id: number;
  res_type: I_Residence_display_type;
  sales_count: number;
  /** Coarse four-value state, kept for ResidenceCart's existing action-menu logic. */
  state: ResidenceStates_enum;
  /** The backend's actual state — what the six host-panel tabs filter by. */
  raw_state: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "DEACTIVATED" | "DELETED";
  suspended: boolean;
  suspension_reason: string | null;
  has_pending_changes: boolean;
  /** An open defect the host has not yet asked to be re-checked. */
  has_open_defect: boolean;
  /** An open defect the host has already asked to be re-checked. */
  defect_review_requested: boolean;
  /** The specialist's own notes, for `has_open_defect` residences — shown
   * directly on the list card with a jump-to-step button. */
  open_defects: { section: DefectSection; severity: "MANDATORY" | "SUGGESTED"; description: string }[];
  completion_percent?: number;
  step?: number;
}

const WIZARD_STEP_COUNT = 14;

function mapDisplayType(type: string | undefined): I_Residence_display_type {
  return residenceTypeSlug(type) as I_Residence_display_type;
}

function mapState(state: string): ResidenceStates_enum {
  switch (state) {
    case "DRAFT":
    case "PENDING":
      return ResidenceStates_enum.COMPLETING;
    case "PUBLISHED":
      return ResidenceStates_enum.ACTIVE;
    case "DEACTIVATED":
      return ResidenceStates_enum.DISABLED;
    default:
      return ResidenceStates_enum.DISABLED;
  }
}

function mapResidence(r: any): IServerResidence {
  const openDefects: {
    section: DefectSection;
    severity: "MANDATORY" | "SUGGESTED";
    description: string;
    reviewRequestedAt: string | null;
  }[] = r.defects || [];
  const defectReviewRequested = openDefects.some((d) => !!d.reviewRequestedAt);
  const hasOpenDefect = openDefects.length > 0 && !defectReviewRequested;

  return {
    id: r.id,
    image_url: r.images?.[0]?.url || "",
    is_complete: r.state !== "DRAFT",
    is_fast_enabled: !!r.isFast,
    last_update_time: r.updatedAt,
    name: r.name,
    published: !!r.published,
    reference: r.reference,
    // The کد اقامتگاه a person reads and types is the Odoo id, not the raw
    // reference and not the primary key. "ODOO-45285" was printed on the card
    // verbatim, and the public-page link was built from `id`, which is a
    // different listing on every migrated one.
    public_id: r.reference?.startsWith("ODOO-") ? Number(r.reference.slice(5)) || r.id : r.id,
    res_type: mapDisplayType(r.type),
    sales_count: r.salesCount ?? 0,
    state: mapState(r.state),
    raw_state: r.state,
    suspended: !!r.suspendedAt,
    suspension_reason: r.suspensionReason ?? null,
    has_pending_changes: !!r.pendingChangesSubmittedAt,
    has_open_defect: hasOpenDefect,
    defect_review_requested: defectReviewRequested,
    open_defects: hasOpenDefect
      ? openDefects.map((d) => ({ section: d.section, severity: d.severity, description: d.description }))
      : [],
    completion_percent:
      r.state === "DRAFT" ? Math.round(((r.step || 0) / WIZARD_STEP_COUNT) * 100) : 100,
    step: r.step || 0,
  };
}

const getResidencesList = async (): Promise<any> => {
  const resp = await apiBuilder.setUrl(`/api/host/residences`).setCallMethod("GET").call();
  if (resp?.status !== "success") return { status: "error", err_msg: resp?.message };
  return {
    status: "success",
    // `rooms` was the old backend's Boomgardi per-room listing (room-level
    // booking has no equivalent yet — see api/Reserves.ts submitNewReserve).
    // Always an array (never undefined) since several consumers call
    // `.filter()`/`.map()` on it unconditionally.
    params: { residences: (resp.data || []).map(mapResidence), rooms: [] },
  };
};

// Was a BASE_URL absolute-URL variant in the old code; no reason for that to
// differ from the relative one now that everything goes through the rewrite.
const getResidencesList2 = getResidencesList;

export { getResidencesList, getResidencesList2 };
