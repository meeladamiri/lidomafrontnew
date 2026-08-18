// import { IObserveResidenceData } from "@/interfaces/observe_residence";
// import GoToFlash from "../../../General/GoToFlash";
// import { useState } from "react";
// import dynamic from "next/dynamic";
import PolicyItem from "@/components/ReserveCancellationPolicy/PolicyItem";
// import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
// const ResidenceCancelReserveRulesModal = dynamic(
//   () => import("./ResidenceCancelReserveRulesModal"),
//   {
//     ssr: true,
//   }
// );

function ResCancelRules() {
  // const { data } = useGetObserveResidence();
  // const [showResidenceCancelReserveRulesModal, setShowResidenceCancelReserveRulesModal] =
  //   useState<boolean>(false);

  // const resp: IObserveResidenceData = data?.params;
  // const rules = resp?.rules;
  // const full_return_time = resp?.residence_info.full_return_time;
  // const before_start_time = resp?.residence_info.before_start_time;
  // const host_share_total_amount = resp?.residence_info.host_share_total_amount;
  // const host_share_past_nights = resp?.residence_info.host_share_past_nights;
  // const host_share_future_nights = resp?.residence_info.host_share_future_nights;

  return (
    <div className="pb-24 md:col-span-6 col-span-full">
      <h3 className="mb-20 md:pt-0 md:border-none">
        قوانین لغو رزرو
      </h3>
      <PolicyItem
        befor24="کسر مبلغ شب اول رزرو + 20% مابقی شب ها"
        befor72="کسر 20% از مبلغ کل رزرو"
        entry="کسر مبلغ دو شب اول رزرو (علاوه بر شب های سپری شده) و 20% از مابقی شب ها"
        longtermReserve="تنها با توافق میزبان و کسر حداقل ۲۰٪ کل مبلغ رزرو"
        peakDays="تنها با توافق میزبان و کسر حداقل ۲۰٪ کل مبلغ رزرو"
      />

      {/* {!!showResidenceCancelReserveRulesModal && (
        <ResidenceCancelReserveRulesModal
          isModalOpen={showResidenceCancelReserveRulesModal}
          handleClose={() => setShowResidenceCancelReserveRulesModal(false)}
          // data={{
          //   title: "مقررات لغو رزرو اقامتگاه ها",
          // rules.find((el) => el.category === "مقررات لغو رزرو" && el.name === "مقررات لغو رزرو")
          //   ?.value || "",
          // TODO: fill these below values with api values. ehsan hanuz ezafe nakarde
          // fullReturnTime: full_return_time || 0,
          // fullReturnTime: 72,
          // beforeStartTime: before_start_time || 0,
          // beforeStartTime: 24,
          // hostShareTotalAmount: host_share_total_amount || 0,
          // hostSharePastNights: host_share_past_nights || 0,
          // hostShareFutureNights: host_share_future_nights || 0,
          // }}
        />
      )} */}
    </div>
  );
}
export default ResCancelRules;
