import { getStateCorresponding } from "@/api/Reserves";
import { ReserveStates_enum } from "@/constants/enums/reserve_states";
import { useUserProfile } from "@/providers/Profile";

function ReserveFinalized({ residenceCity }: { residenceCity: string }) {
  const profileData = useUserProfile();

  return (
    <div className="py-20 px-16 rounded-6 border-1 border-dashed border-success">
      <p className="text-16 leading-32 text-success font-m mb-12 text-center">
        درخواست رزرو قطعی شد
      </p>
      <p className="text-12 leading-21 text-black text-justify">
        {!!profileData.is_host
          ? getStateCorresponding(ReserveStates_enum.DONE)?.stateDescription_ForHost
          : getStateCorresponding(ReserveStates_enum.DONE)?.stateDescription_ForGuest(
              residenceCity
            )}
      </p>
    </div>
  );
}

export default ReserveFinalized;
