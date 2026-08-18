export const MyTripsList_ActiveTab_KEYWORD = "MyTripsList_ActiveTab";
export const MyTripsList_PageN_KEYWORD = "MyTripsList_PageN";

export const MyTripsList_ClickedMyTrip_Id_KEYWORD = "MyTripsList_ClickedMyTrip_Id";

export function applySessionStorageValues_mytrips_list({ mytripId }: { mytripId: number }) {
  sessionStorage.setItem(MyTripsList_ClickedMyTrip_Id_KEYWORD, mytripId.toString());
}
