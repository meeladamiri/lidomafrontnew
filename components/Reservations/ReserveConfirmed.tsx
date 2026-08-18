import { getStateCorresponding } from "@/api/Reserves";
import { ReserveStates_enum } from "@/constants/enums/reserve_states";
import { useUserProfile } from "@/providers/Profile";

function ReserveConfirmed({ residenceCity }: { residenceCity: string }) {
  const profileData = useUserProfile();

  return (
    <div className="py-20 px-16 rounded-6 border-1 border-dashed border-primary-main">
      <p className="text-16 leading-32 text-primary-main font-m mb-12 text-center">
        درخواست رزرو تأیید شد
      </p>
      <p className="text-12 leading-21 text-black text-justify">
        {!!profileData.is_host
          ? getStateCorresponding(ReserveStates_enum.SECOND_PAYMENT)?.stateDescription_ForHost
          : getStateCorresponding(ReserveStates_enum.SECOND_PAYMENT)?.stateDescription_ForGuest(
              residenceCity
            )}
      </p>
    </div>
  );
}

export default ReserveConfirmed;
