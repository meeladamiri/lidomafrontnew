import { I_Residence_display_type } from "@/interfaces/Residences";

export function getTargetPathname(residenceType: I_Residence_display_type) {
  const targetPathname =
    residenceType === "suit"
      ? "/search/city/[id]"
      : residenceType === "boomgardi"
      ? "/boomgardi/[id]"
      : // tmpResidenceType === "hotel"
        "/hotel/[id]";

  return targetPathname;
}
