import { Button } from "@/components/General/core/Button";
import { Dispatch, SetStateAction } from "react";

function ChangeResidencesStatusGeneralPricingModalActions({
  changeResidencesStatusGeneralPricingFormik,
  setShowResidenceGeneralPricingModal,
}: {
  changeResidencesStatusGeneralPricingFormik: any;
  setShowResidenceGeneralPricingModal: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div
      className="fixed bottom-0 right-0 left-0 z-2 px-20 pb-16"
      style={{
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="flex items-center gap-x-8 justify-end">
        <Button
          onClick={() => setShowResidenceGeneralPricingModal(false)}
          className="px-50"
          variant="contained"
          color="grey"
          rounded
        >
          انصراف
        </Button>
        <Button
          onClick={() => {
            changeResidencesStatusGeneralPricingFormik?.handleSubmit();
            setShowResidenceGeneralPricingModal(false);
          }}
          className="px-50"
          variant="contained"
          color="dark-blue"
          rounded
        >
          ذخیره
        </Button>
      </div>
    </div>
  );
}

export default ChangeResidencesStatusGeneralPricingModalActions;
