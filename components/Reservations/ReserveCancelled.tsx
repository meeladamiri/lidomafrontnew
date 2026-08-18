import { ReservesCancel_enum } from "@/constants/enums/reserves_cancel";
import { ReserveStates_enum } from "@/constants/enums/reserve_states";
import { useUserProfile } from "@/providers/Profile";
import { cancelReasons, getStateCorresponding, rejectReasons } from "api/Reserves";
import { CancelReasons_enum } from "constants/enums/cancel_reasons";
import { RejectReasons_enum } from "constants/enums/reject_reasons";

function ReserveCancelled({
  rejectOrCancelReason,
}: {
  rejectOrCancelReason?:
    | RejectReasons_enum // if Typical options in reject bottom sheet was selected
    | CancelReasons_enum // if Typical options in cancel bottom sheet was selected
    | string; // for 'other' reasons
}) {
  const profileData = useUserProfile();

  const reasonFound =
    rejectReasons.find((el) => el.key === rejectOrCancelReason) ||
    cancelReasons.find((el) => el.key === rejectOrCancelReason);

  return (
    <div className="p-16 rounded-6 border-1 border-dashed border-error-light">
      <p className="text-16 leading-32 text-error-light font-m mb-12 text-center">
        درخواست رزرو لغو شد
      </p>
      <div className="text-12 leading-21 font-m text-black text-justify">
        <p className="text-error-light text-right">
          علت لغو : {!!reasonFound ? reasonFound.text : rejectOrCancelReason}
        </p>
        {!!profileData.is_host
          ? getStateCorresponding(ReserveStates_enum.CANCEL, ReservesCancel_enum.HOST_CANCELLED)
              ?.stateDescription_ForHost
          : getStateCorresponding(
              ReserveStates_enum.CANCEL,
              ReservesCancel_enum.HOST_CANCELLED
            )?.stateDescription_ForGuest("اصفهان")}
      </div>
    </div>
  );
}

export default ReserveCancelled;
