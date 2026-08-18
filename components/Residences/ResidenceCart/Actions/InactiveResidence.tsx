import { I_Residence_display_type } from "@/interfaces/Residences";
import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { applySessionStorageValues_residences_list } from "@/constants/session_stores/residences_list";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button, LinkButton } from "components/General/core/Button";
import ActivateResidenceBottomSheet from "components/Residences/BottomSheets/ActivateResidenceBottomSheet";
import { useState } from "react";

function InactiveResidence({
  residenceId,
  residenceType,
  displayType,
}: {
  residenceId: number;
  residenceType: ResidenceTypes_enum;
  displayType: I_Residence_display_type;
}) {
  const [showActivateResidenceBottomSheet, setShowActivateResidenceBottomSheet] =
    useState<boolean>(false);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-8">
        <div className="col-span-1">
          <Button
            color="secondary"
            isFullWidth
            rightIcon={<i className="icon-Power text-white text-24" />}
            onClick={() => setShowActivateResidenceBottomSheet(true)}
          >
            فعالسازی
          </Button>
        </div>
        <div className="col-span-1">
          <LinkButton
            href={
              residenceType === ResidenceTypes_enum.PRODUCT
                ? `/residences/${residenceId}/edit?residenceType=${residenceType}`
                : `/b-room/${residenceId}/edit`
            }
            isFullWidth
            rightIcon={<i className="icon-Edit text-22 text-black" />}
            className="!px-4"
            color="grey"
            onClick={() => {
              applySessionStorageValues_residences_list({ residenceId, residenceType });
            }}
          >
            {residenceType === ResidenceTypes_enum.PRODUCT ? "ویرایش اقامتگاه" : "ویرایش اتاق"}
          </LinkButton>
        </div>
      </div>

      <BottomSheet
        open={showActivateResidenceBottomSheet}
        handleClose={() => setShowActivateResidenceBottomSheet(false)}
        headerTitle="فعالسازی اقامتگاه"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <ActivateResidenceBottomSheet
              handleSmoothClose={handleSmoothClose}
              residenceId={residenceId}
              productType={residenceType}
            />
          );
        }}
      />
    </>
  );
}
export default InactiveResidence;
