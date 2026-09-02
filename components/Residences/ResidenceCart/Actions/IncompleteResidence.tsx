import { ResidenceTypes_enum } from "@/constants/enums/residence_types";
import { applySessionStorageValues_residences_list } from "@/constants/session_stores/residences_list";
import { Button, LinkButton } from "components/General/core/Button";
import { Dispatch, SetStateAction } from "react";
import { IDeleteResidenceBottomSheet } from "..";

function IncompleteResidence({
  untilWhichStepUserHasCompleted,
  residenceId,
  setDeleteResidenceBottomSheet,
  residenceType,
}: {
  untilWhichStepUserHasCompleted: number;
  residenceId: number;
  residenceType: ResidenceTypes_enum;
  // setDeleteResidenceBottomSheet:‌;
  setDeleteResidenceBottomSheet: Dispatch<SetStateAction<IDeleteResidenceBottomSheet>>;
}) {
  return (
    <div className="grid grid-cols-5 gap-x-12">
      <div className="col-span-2">
        <Button
          isFullWidth
          variant="outlined"
          color="error"
          onClick={() =>
            setDeleteResidenceBottomSheet({
              show: true,
              data: {
                residenceId,
                productType: residenceType,
              },
            })
          }
        >
          حذف
        </Button>
      </div>
      <div className="col-span-3">
        <LinkButton
          href={`/residences/submit?productId=${residenceId}`}
          isFullWidth
          className="!pr-12 !pl-8"
          onClick={() => {
            applySessionStorageValues_residences_list({ residenceId, residenceType });
          }}
        >
          <div className="flex items-center justify-between w-full">
            <p>ادامه روند ثبت</p>
            <i className="icon-FlashLeft text-24" />
          </div>
        </LinkButton>
      </div>
    </div>
  );
}
export default IncompleteResidence;
