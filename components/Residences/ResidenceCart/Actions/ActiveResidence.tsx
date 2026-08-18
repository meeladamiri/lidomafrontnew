import { I_Residence_display_type } from "@/interfaces/Residences";
import { applySessionStorageValues_residences_list } from "@/constants/session_stores/residences_list";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import { Button, LinkButton } from "components/General/core/Button";
import FastReservePreviewBottomSheet from "components/Residences/BottomSheets/FastReservePreviewBottomSheet";
import { ResidenceTypes_enum } from "constants/enums/residence_types";
import { useState } from "react";

function ActiveResidence({
  residenceId,
  residenceType,
  displayType,
}: {
  residenceId: number;
  residenceType: ResidenceTypes_enum;
  displayType: I_Residence_display_type;
}) {
  const [showFastReservePreviewBottomSheet, setShowFastReservePreviewBottomSheet] = useState(false);

  return (
    <>
      <div className="grid grid-cols-12 gap-12">
        {displayType === "suit" ? (
          <>
            <div className="col-span-6">
              <LinkButton
                href={`/residences/calendar/edit?residenceId=${residenceId}&residenceType=${residenceType}`}
                isFullWidth
                rightIcon={<i className="icon-Calendar text-22 text-white" />}
                className="!px-4"
                onClick={() => {
                  applySessionStorageValues_residences_list({ residenceId, residenceType });
                }}
              >
                ویرایش تقویم
              </LinkButton>
            </div>

            <div className="col-span-6">
              <Button
                isFullWidth
                rightIcon={<i className="icon-Flash text-22 text-white" />}
                onClick={() => setShowFastReservePreviewBottomSheet(true)}
                className="!px-4"
                color="secondary"
                rightIconWrapper="!ml-5"
              >
                تنظیم رزرو آنی
              </Button>
            </div>

            <div className="col-span-6">
              <LinkButton
                href={`/residences/${residenceId}/general-pricing/edit?residenceType=${residenceType}&fromCalendarPage=false`}
                isFullWidth
                rightIcon={<i className="icon-Pay text-22 text-black" />}
                className="!px-4"
                color="grey"
                onClick={() => {
                  applySessionStorageValues_residences_list({ residenceId, residenceType });
                }}
              >
                نرخ گذاری کلی
              </LinkButton>
            </div>

            <div className="col-span-6">
              <LinkButton
                href={`/residences/${residenceId}/edit?residenceType=${residenceType}`}
                isFullWidth
                rightIcon={<i className="icon-Edit text-22 text-black" />}
                className="!px-4"
                color="grey"
                onClick={() => {
                  applySessionStorageValues_residences_list({ residenceId, residenceType });
                }}
              >
                ویرایش اقامتگاه
                {/* {residenceType === ResidenceTypes_enum.PRODUCT ? "ویرایش اقامتگاه" : "ویرایش اتاق"} */}
              </LinkButton>
            </div>
          </>
        ) : displayType === "boomgardi" ? (
          residenceType === ResidenceTypes_enum.PRODUCT ? (
            <div className="col-span-full">
              <LinkButton
                href={`/residences/${residenceId}/edit?residenceType=${residenceType}`}
                isFullWidth
                rightIcon={<i className="icon-Edit text-22 text-black" />}
                className="!px-4"
                color="grey"
                onClick={() => {
                  applySessionStorageValues_residences_list({ residenceId, residenceType });
                }}
              >
                ویرایش اقامتگاه
              </LinkButton>
            </div>
          ) : null
        ) : residenceType === ResidenceTypes_enum.ROOM ? (
          <>
            <div className="col-span-6">
              <LinkButton
                href={`/residences/calendar/edit?residenceId=${residenceId}&residenceType=${residenceType}`}
                isFullWidth
                rightIcon={<i className="icon-Calendar text-22 text-white" />}
                className="!px-4"
                onClick={() => {
                  applySessionStorageValues_residences_list({ residenceId, residenceType });
                }}
              >
                ویرایش تقویم
              </LinkButton>
            </div>

            <div className="col-span-6">
              <Button
                isFullWidth
                rightIcon={<i className="icon-Flash text-22 text-white" />}
                onClick={() => setShowFastReservePreviewBottomSheet(true)}
                className="!px-4"
                color="secondary"
                rightIconWrapper="!ml-5"
              >
                تنظیم رزرو آنی
              </Button>
            </div>

            <div className="col-span-6">
              <LinkButton
                href={`/residences/${residenceId}/general-pricing/edit?residenceType=${residenceType}&fromCalendarPage=false`}
                isFullWidth
                rightIcon={<i className="icon-Pay text-22 text-black" />}
                className="!px-4"
                color="grey"
                onClick={() => {
                  applySessionStorageValues_residences_list({ residenceId, residenceType });
                }}
              >
                نرخ گذاری کلی
              </LinkButton>
            </div>

            <div className="col-span-6">
              <LinkButton
                href={`/b-room/${residenceId}/edit`}
                isFullWidth
                rightIcon={<i className="icon-Edit text-22 text-black" />}
                className="!px-4"
                color="grey"
                onClick={() => {
                  applySessionStorageValues_residences_list({ residenceId, residenceType });
                }}
              >
                ویرایش اتاق
              </LinkButton>
            </div>
          </>
        ) : null}
      </div>

      {!!showFastReservePreviewBottomSheet && (
        <BottomSheet
          open={showFastReservePreviewBottomSheet}
          handleClose={() => setShowFastReservePreviewBottomSheet(false)}
          headerTitle="رزرو آنی"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <FastReservePreviewBottomSheet
                handleSmoothClose={handleSmoothClose}
                residenceId={residenceId}
                residenceType={residenceType}
              />
            );
          }}
        />
      )}
    </>
  );
}

export default ActiveResidence;
