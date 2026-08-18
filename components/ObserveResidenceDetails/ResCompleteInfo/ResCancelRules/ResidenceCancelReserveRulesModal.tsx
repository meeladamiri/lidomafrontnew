// import ReadonlyCancelRuleItem from "components/Residences/CancelRule/ReadonlyCancelRuleItem";
import ModalWrapper from "components/General/core/ModalWrapper";
import PolicyItem from "@/components/ReserveCancellationPolicy/PolicyItem";

function ResidenceCancelReserveRulesModal({
  isModalOpen,
  handleClose,
}: // data,
{
  isModalOpen: boolean;
  handleClose: () => void;
  // data: {
  //   title: string;
  //   fullReturnTime: number;
  //   beforeStartTime: number;
  //   hostShareTotalAmount: number;
  //   hostSharePastNights: number;
  //   hostShareFutureNights: number;
  // };
}) {
  return (
    <ModalWrapper
      headerTitle="قوانین لغو رزرو"
      onClose={() => {
        handleClose();
      }}
      open={isModalOpen}
      modalClassname="md:!w-[368px]"
    >
      <PolicyItem
        befor24="کسر مبلغ شب اول رزرو + 20% مابقی شب ها"
        befor72="کسر 20% از مبلغ کل رزرو"
        entry="کسر مبلغ دو شب اول رزرو (علاوه بر شب های سپری شده) و 20% از مابقی شب ها"
        longtermReserve="تنها با توافق میزبان و کسر حداقل ۲۰٪ کل مبلغ رزرو"
        peakDays="تنها با توافق میزبان و کسر حداقل ۲۰٪ کل مبلغ رزرو"
      />
      {/* <ReadonlyCancelRuleItem
        // mainTitle={`${data?.title}`}
        mainTitle="سیاست متعادل"
        //
        // fullReturnTime={data.fullReturnTime}
        fullReturnTime={72}
        beforeStartTime={data.beforeStartTime}
        hostShareTotalAmount={data.hostShareTotalAmount}
        hostSharePastNights={data.hostSharePastNights}
        hostShareFutureNights={data.hostShareFutureNights}
        //
        //   reserveCommission={10}
        //   cancelCommission={20}
      /> */}
    </ModalWrapper>
  );
}

export default ResidenceCancelReserveRulesModal;
