import { ResidenceTypes_enum } from "../enums/residence_types";

export const ResidencesList_ActiveTab_KEYWORD = "ResidencesList_ActiveTab";
export const ResidencesList_PageN_KEYWORD = "ResidencesList_PageN";

export const ResidencesList_ClickedResidence_Id_KEYWORD = "ResidencesList_ClickedResidence_Id";
export const ResidencesList_ClickedResidence_Type_KEYWORD = "ResidencesList_ClickedResidence_Type";

export function applySessionStorageValues_residences_list({
  residenceId,
  residenceType,
}: {
  residenceId: number;
  residenceType: ResidenceTypes_enum;
}) {
  sessionStorage.setItem(ResidencesList_ClickedResidence_Id_KEYWORD, residenceId.toString());
  sessionStorage.setItem(ResidencesList_ClickedResidence_Type_KEYWORD, residenceType);
}
