// Old backend: `/api/users/panel/residences_list` (JSON-RPC, Odoo). New
// backend: `GET /api/host/residences` — reshaped here into the old
// IServerResidence[] shape Step_0 (wizard resume list) and several other
// host dashboard pages already read.

import { ResidenceStates_enum } from "@/constants/enums/residence_states";
import { I_Residence_display_type } from "@/interfaces/Residences";
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
  res_type: I_Residence_display_type;
  sales_count: number;
  state: ResidenceStates_enum;
  completion_percent?: number;
  step?: number;
}

const WIZARD_STEP_COUNT = 14;

function mapDisplayType(type: string | undefined): I_Residence_display_type {
  return type === "BOOMGARDI" ? ("boomgardi" as I_Residence_display_type) : ("suit" as I_Residence_display_type);
}

function mapState(state: string): ResidenceStates_enum {
  switch (state) {
    case "DRAFT":
    case "PENDING":
      return ResidenceStates_enum.COMPLETING;
    case "PUBLISHED":
      return ResidenceStates_enum.ACTIVE;
    case "DEACTIVATED":
      return ResidenceStates_enum.SUSPENDED;
    default:
      return ResidenceStates_enum.DISABLED;
  }
}

function mapResidence(r: any): IServerResidence {
  return {
    id: r.id,
    image_url: r.images?.[0]?.url || "",
    is_complete: r.state !== "DRAFT",
    is_fast_enabled: !!r.isFast,
    last_update_time: r.updatedAt,
    name: r.name,
    published: !!r.published,
    reference: r.reference,
    res_type: mapDisplayType(r.type),
    sales_count: r.salesCount ?? 0,
    state: mapState(r.state),
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
