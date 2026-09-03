import { LinkButton } from "components/General/core/Button";

import { useEffect, useMemo, useRef, useState } from "react";
import { IAlterResidences, reserve_cancel_values } from "api/Reserves";
import Link from "next/link";
import { getTimeDiff } from "utilities/Time";
import { LIDOMA_CANCELLED_IN_COORDINATION_WITH } from "constants/enums/reserves_cancel";
import { RejectReasons_enum } from "constants/enums/reject_reasons";
import { CancelReasons_enum } from "constants/enums/cancel_reasons";
import Image from "next/image";
import { getBlurHash } from "@/utilities/getBlurHash";

import { useQueryClient } from "@tanstack/react-query";
import { MyTripStates_enum } from "@/constants/enums/mytrip_states";
import { getStateCorrespondingInMytrips } from "@/api/MyTrips";
import {
  applySessionStorageValues_mytrips_list,
  MyTripsList_ClickedMyTrip_Id_KEYWORD,
} from "@/constants/session_stores/mytrips_list";
import Price_Date_Guests from "./Price_Date_Guests";
import { I_Residence_display_type } from "@/interfaces/Residences";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";

export type TReserveStatus =
  | "در انتظار پاسخ"
  | "رزرو موفق"
  | "لغو شده توسط میزبان"
  | "در انتظار پرداخت"
  | "منقضی شده";

export type TMyTripStates =
  | (MyTripStates_enum.CANCEL | MyTripStates_enum.EXPIRED) // for falied reserves
  | MyTripStates_enum.HOST_APPROVAL
  | MyTripStates_enum.SECOND_PAYMENT
  | MyTripStates_enum.DONE;

interface IReserveCart {
  state?: TMyTripStates;
  mytripId: number;
  residenceName: string;
  reserveCode?: string;
  reservePrice?: number;
  startDate?: string;
  endDate?: string;
  mainGuestsN?: number;
  extraGuestsN?: number;
  residenceId: number;
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
  residenceCity: string;
  displayType: I_Residence_display_type;
}

function MyTripCart({
  state,
  mytripId,
  residenceName,
  reserveCode,
  reservePrice,
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
  residenceCity,
  displayType,
}: IReserveCart) {
  const statusInfo = useMemo(() => {
    return getStateCorrespondingInMytrips(state, cancelledBy);
  }, [state, cancelledBy]);

  const cartRef = useRef<any>();

  const timerRef = useRef<any>(null);
  const [remainingTime, setRemainingTime] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // It is from the list page though
    const persistedId = sessionStorage.getItem(MyTripsList_ClickedMyTrip_Id_KEYWORD);

    if (!!persistedId) {
      if (Number(persistedId) === mytripId) {
        cartRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

        sessionStorage.removeItem(MyTripsList_ClickedMyTrip_Id_KEYWORD);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!!expiryDate) {
      timerRef.current = setInterval(() => {
        const diff = getTimeDiff(Date.now(), new Date(`${expiryDate}Z`).getTime());

        if (diff === 0) {
          // So this reserve's expiryDate has been reached, so let's refetch the reserves list.
          queryClient.invalidateQueries([
            "getReserves",
            "getDashboardData", // bcz we have pending requests in dashboard page.
          ]);

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
                href={getPropertyPageUrl({ residenceId })}
                className="p-5 pl-12 text-white flex items-center gap-x-5 bg-black rounded-50 bg-opacity-80 cursor-pointer"
                onClick={() => {
                  applySessionStorageValues_mytrips_list({ mytripId });
                }}
              >
                <i className="icon-See text-18" />
                <span className="text-12 leading-21">مشاهده</span>
              </Link>
            </div>

            {(state === MyTripStates_enum.HOST_APPROVAL ||
              state === MyTripStates_enum.SECOND_PAYMENT) &&
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
        <>
          <Price_Date_Guests
            price={reservePrice}
            startDate={startDate}
            endDate={endDate}
            mainGuestsN={mainGuestsN}
            extraGuestsN={extraGuestsN}
          />
          <LinkButton
            href={`/my-trips/${mytripId}`}
            isFullWidth
            variant={
              state === MyTripStates_enum.CANCEL || state === MyTripStates_enum.EXPIRED
                ? "outlined"
                : "contained"
            }
            color={
              state === MyTripStates_enum.CANCEL || state === MyTripStates_enum.EXPIRED
                ? "black"
                : "primary"
            }
            onClick={() => {
              applySessionStorageValues_mytrips_list({ mytripId });
            }}
          >
            مشاهده جزئیات رزرو
          </LinkButton>
        </>
      </div>
    </div>
  );
}

export default MyTripCart;
