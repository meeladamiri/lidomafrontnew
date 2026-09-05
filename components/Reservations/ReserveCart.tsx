import { Button, LinkButton } from "components/General/core/Button";
import { invalidateReservationViews } from "@/utilities/reservationCache";

import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import Income_Date_Guests from "./Income_Date_Guests";
import {
  getStateCorresponding,
  IAlterResidences,
  rejectReasons,
  reserve_cancel_values,
  TReserveStates,
} from "api/Reserves";
import Link from "next/link";
import { getTimeDiff } from "utilities/Time";
import BottomSheet from "components/General/core/BottomSheet";
import ConfirmReserveBottomSheet from "./ConfirmReserveBottomSheet";
import ReserveConfirmed from "./ReserveConfirmed";
import ReserveFinalized from "./ReserveFinalized";
import DownloadFactor from "./DownloadFactor";
import RejectReserveWithReasonBottomSheet from "./RejectReserveWithReasonBottomSheet";
import { ReserveStates_enum } from "constants/enums/reserve_states";
import {
  LIDOMA_CANCELLED_IN_COORDINATION_WITH,
  ReservesCancel_enum,
} from "constants/enums/reserves_cancel";
import ReserveCancelled from "./ReserveCancelled";
import { RejectReasons_enum } from "constants/enums/reject_reasons";
import { CancelReasons_enum } from "constants/enums/cancel_reasons";
import { LidomaCancelledWithHostCoordination } from "./LidomaCancelledWithHostCoordination";
import { LidomaCancelledWithGuestCoordination } from "./LidomaCancelledWithGuestCoordination";
import Image from "next/image";
import { getBlurHash } from "@/utilities/getBlurHash";
import {
  applySessionStorageValues_reserves_list,
  ReservesList_ClickedReserve_Id_KEYWORD,
} from "@/constants/session_stores/reserves_list";
import { useQueryClient } from "@tanstack/react-query";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import { I_Residence_display_type } from "@/interfaces/Residences";

export type TReserveStatus =
  | "در انتظار پاسخ"
  | "رزرو موفق"
  | "لغو شده توسط میزبان"
  | "در انتظار پرداخت"
  | "منقضی شده";

interface IReserveCart {
  isFromDetailsPage?: boolean;
  state?: TReserveStates;
  displayType: I_Residence_display_type;
  reserveId: number;
  residenceName: string;
  reserveCode?: string;
  hostIncome?: number;
  startDate?: string;
  endDate?: string;
  mainGuestsN?: number;
  extraGuestsN?: number;
  residenceId?: number;
  residenceImage: string;
  expiryDate?: string;
  voucherUrl?: string; // will be passed when state == "done"
  cancelledBy?: // will be passed only in failed reserves
  reserve_cancel_values;
  cancelDesc?:
    | RejectReasons_enum // if Typical options in reject bottom sheet was selected;
    | string; // for 'other' reasons
  cancelReason?:
    | CancelReasons_enum // if Typical options in cancel bottom sheet was selected
    | string; // for 'other' reasons
  suggestedResidencesList?: IAlterResidences[];
  coordinatedWith?: LIDOMA_CANCELLED_IN_COORDINATION_WITH;
  setShowSendAltersList?: Dispatch<SetStateAction<boolean>>;
  residenceCity: string;
  // residenceType: ResidenceTypes_enum;
}

function ReserveCart({
  isFromDetailsPage = true,
  state,
  displayType,
  reserveId,
  residenceName,
  reserveCode,
  hostIncome,
  startDate,
  endDate,
  mainGuestsN,
  extraGuestsN,
  residenceId,
  residenceImage,
  expiryDate,
  cancelledBy,
  voucherUrl,
  cancelDesc,
  cancelReason,
  suggestedResidencesList,
  coordinatedWith,
  setShowSendAltersList,
  residenceCity,
}: // residenceType,
IReserveCart) {
  const statusInfo = useMemo(() => {
    return getStateCorresponding(state, cancelledBy);
  }, [state, cancelledBy]);

  const [showConfirmReserveBottomSheet, setShowConfirmReserveBottomSheet] =
    useState<boolean>(false);

  const cartRef = useRef<any>();

  const [showRejectReserveBottomSheet, setShowRejectReserveBottomSheet] = useState<boolean>(false);

  const timerRef = useRef<any>(null);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isFromDetailsPage) {
      // It is from the list page though
      const persistedId = sessionStorage.getItem(ReservesList_ClickedReserve_Id_KEYWORD);

      if (!!persistedId) {
        if (Number(persistedId) === reserveId) {
          cartRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

          sessionStorage.removeItem(ReservesList_ClickedReserve_Id_KEYWORD);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      !!expiryDate &&
      (state === ReserveStates_enum.HOST_APPROVAL || state === ReserveStates_enum.SECOND_PAYMENT)
    ) {
      timerRef.current = setInterval(() => {
        // Already a "...Z"-terminated ISO string — see MyTripDetails/index.tsx
        // for why appending a second one breaks the parse.
        const diff = getTimeDiff(Date.now(), new Date(expiryDate || "").getTime());

        if (diff === 0) {
          // This reserve's expiryDate has been reached, so everything showing
          // it is now wrong. This used to pass both names inside one array,
          // which react-query reads as the single key ["getReserves",
          // "getDashboardData"] — a key nothing is stored under, so the timer
          // ran out and nothing refreshed.
          invalidateReservationViews(queryClient);

          // And also clear this reserve's interval
          if (!!timerRef.current) {
            clearInterval(timerRef.current);
          }
        } else {
          setRemainingTime(diff);
        }
      }, 1000);
    }

    return () => {
      if (!!timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-16 flex flex-col md:h-full" ref={cartRef}>
      <div className="w-full h-[214px] p-12 relative rounded-tr-16 rounded-tl-16">
        <Image
          src={residenceImage}
          fill
          style={{
            objectFit: "cover",
          }}
          alt="" // TODO
          className="rounded-tr-16 rounded-tl-16"
          placeholder="blur"
          blurDataURL={getBlurHash(residenceImage)}
        />

        <div className="flex flex-col justify-between h-full">
          <div className="z-1">
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center p-5 pl-12 rounded-50 gap-x-5 text-white ${statusInfo?.bgColor}`}
              >
                <i className={`${statusInfo?.icon} text-18`} />
                <p className="text-12 leading-21">{statusInfo?.name}</p>
              </div>

              <Link
                passHref
                prefetch={false}
                href={getPropertyPageUrl({
                  residenceId: residenceId as number,
                })}
                className="p-5 pl-12 text-white flex items-center gap-x-5 bg-black rounded-50 bg-opacity-80 cursor-pointer"
                onClick={() => {
                  applySessionStorageValues_reserves_list({ reserveId });
                }}
              >
                <i className="icon-See text-18" />
                <span className="text-12 leading-21">مشاهده</span>
              </Link>
            </div>

            {(state === ReserveStates_enum.HOST_APPROVAL ||
              state === ReserveStates_enum.SECOND_PAYMENT) &&
              !!expiryDate && (
                <div className="mt-8 w-fit-content px-12 py-2 rounded-50 bg-white">
                  زمان باقی مانده : {remainingTime}
                </div>
              )}
          </div>

          <div className="z-2">
            <div className="flex items-center justify-between gap-x-8">
              <div className="text-14 leading-24 text-white OnlyOneLineAndEndWithElipsis">
                {residenceName}
              </div>
              <div className="shrink-0 flex justify-end">
                <p className="rounded-50 bg-white text-12 leading-21 text-black whitespace-nowrap px-12 py-2 flex items-center justify-center w-fit-content">
                  کد رزرو : {reserveCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* that faded black layer on image  */}
        <div
          className="h-[107px] absolute w-full bottom-0 right-0"
          style={{
            background:
              "linear-gradient(0deg, #000000 7%, rgba(0, 0, 0, 0.52) 49.82%, rgba(0, 0, 0, 0.0001) 80.84%)",
          }}
        />
      </div>

      <div className="grow flex flex-col justify-between p-12 border-1 border-solid border-[#1C345442] border-t-none rounded-br-12 rounded-bl-12">
        {isFromDetailsPage ? (
          state === ReserveStates_enum.HOST_APPROVAL ? (
            <>
              <Income_Date_Guests
                hostIncome={hostIncome}
                startDate={startDate}
                endDate={endDate}
                mainGuestsN={mainGuestsN}
                extraGuestsN={extraGuestsN}
              />
              <div className="grid grid-cols-2 gap-x-12 mt-16">
                <Button
                  isFullWidth
                  className="!px-8"
                  variant="outlined"
                  color="error"
                  onClick={() => setShowRejectReserveBottomSheet(true)}
                >
                  رد درخواست
                </Button>
                <Button
                  isFullWidth
                  className="!px-8"
                  onClick={() => setShowConfirmReserveBottomSheet(true)}
                >
                  تأیید درخواست
                </Button>
              </div>
            </>
          ) : state === ReserveStates_enum.SECOND_PAYMENT ? (
            <ReserveConfirmed residenceCity={residenceCity} />
          ) : state === ReserveStates_enum.DONE ? (
            <>
              <ReserveFinalized residenceCity={residenceCity} />
              {!!voucherUrl && (
                <div className="mt-10">
                  <DownloadFactor reserveId={reserveId} />
                </div>
              )}
            </>
          ) : state === ReserveStates_enum.CANCEL ? (
            cancelledBy === ReservesCancel_enum.HOST_CANCELLED ? (
              <>
                <div className="mb-12">
                  <ReserveCancelled rejectOrCancelReason={cancelReason || cancelDesc} />
                </div>
                {/* NOTE: We "only" have 'پیشنهاد اقامتگاه جایگزین' when the "host" has cancelled the reserve */}
                <Button
                  isFullWidth
                  // href={`/residences/suggest/${reserveId}`}
                  onClick={() => {
                    if (!!setShowSendAltersList) {
                      setShowSendAltersList(true);
                    }
                  }}
                  disabled={!!suggestedResidencesList && !!suggestedResidencesList.length}
                >
                  {!!suggestedResidencesList && !!suggestedResidencesList.length
                    ? `${suggestedResidencesList.length} پیشنهاد جایگزین ارسال شد`
                    : "پیشنهاد اقامتگاه جایگزین"}
                </Button>
              </>
            ) : cancelledBy === ReservesCancel_enum.LIDOMA_CANCELLED ? (
              coordinatedWith === LIDOMA_CANCELLED_IN_COORDINATION_WITH.HOST ? (
                <LidomaCancelledWithHostCoordination />
              ) : coordinatedWith === LIDOMA_CANCELLED_IN_COORDINATION_WITH.GUEST ? (
                <LidomaCancelledWithGuestCoordination />
              ) : // Actually it is never gonna reach here. if it reaches, the 'coordinatedWith' is not set properly in api response.
              null
            ) : cancelledBy === ReservesCancel_enum.GUEST_CANCELLED ? (
              statusInfo?.stateDescription_ForGuest("اصفهان")
            ) : (
              "null"
            )
          ) : null
        ) : (
          <>
            <Income_Date_Guests
              hostIncome={hostIncome}
              startDate={startDate}
              endDate={endDate}
              mainGuestsN={mainGuestsN}
              extraGuestsN={extraGuestsN}
            />
            <LinkButton
              href={`/reservations/${reserveId}`}
              isFullWidth
              color={state === ReserveStates_enum.HOST_APPROVAL ? "primary" : "secondary"}
              onClick={() => {
                applySessionStorageValues_reserves_list({ reserveId });
              }}
            >
              {state === ReserveStates_enum.HOST_APPROVAL
                ? "پاسخ به درخواست"
                : "مشاهده جزئیات رزرو"}
            </LinkButton>
          </>
        )}
      </div>

      <BottomSheet
        open={showConfirmReserveBottomSheet}
        handleClose={() => setShowConfirmReserveBottomSheet(false)}
        headerTitle="تأیید درخواست"
        body={({ handleSmoothClose }) => {
          return (
            <ConfirmReserveBottomSheet
              handleSmoothClose={handleSmoothClose}
              reserveId={reserveId as number}
            />
          );
        }}
      />

      <BottomSheet
        open={showRejectReserveBottomSheet}
        handleClose={() => setShowRejectReserveBottomSheet(false)}
        headerTitle="علت رد درخواست"
        body={({ handleSmoothClose }) => {
          return (
            <RejectReserveWithReasonBottomSheet
              handleSmoothClose={handleSmoothClose}
              reasonsList={rejectReasons}
              reserveId={reserveId as number}
            />
          );
        }}
      />
    </div>
  );
}

export default ReserveCart;
