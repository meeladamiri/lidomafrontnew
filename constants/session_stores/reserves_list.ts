export const ReservesList_ActiveTab_KEYWORD = "ReservesList_ActiveTab";
export const ReservesList_PageN_KEYWORD = "ReservesList_PageN";

export const ReservesList_ClickedReserve_Id_KEYWORD = "ReservesList_ClickedReserve_Id";

export function applySessionStorageValues_reserves_list({ reserveId }: { reserveId: number }) {
  sessionStorage.setItem(ReservesList_ClickedReserve_Id_KEYWORD, reserveId.toString());
}
