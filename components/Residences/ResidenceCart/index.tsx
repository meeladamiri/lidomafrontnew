import { useEffect, useRef, useState } from "react";
import ActiveResidenceActions from "components/Residences/ResidenceCart/Actions/ActiveResidence";
import InactiveResidenceActions from "components/Residences/ResidenceCart/Actions/InactiveResidence";
import IncompleteResidenceActions from "components/Residences/ResidenceCart/Actions/IncompleteResidence";
import PendingResidenceActions from "components/Residences/ResidenceCart/Actions/PendingResidence";
import Link from "next/link";
import { residenceStatesMap, ResidenceStates_enum } from "constants/enums/residence_states";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Image from "next/image";
import { getBlurHash } from "@/utilities/getBlurHash";
import ThreeDotsSelect from "components/General/core/ThreeDotsSelect";
import { useRouter } from "next/router";
import BottomSheet, { THandleSmoothClose } from "components/General/core/BottomSheet";
import DeleteResidenceBottomSheet from "../BottomSheets/DeleteResidenceBottomSheet";
import { ResidenceTypes_enum } from "constants/enums/residence_types";
import InactivateResidenceBottomSheet from "../BottomSheets/InactivateResidenceBottomSheet";
import {
  applySessionStorageValues_residences_list,
  ResidencesList_ClickedResidence_Id_KEYWORD,
  ResidencesList_ClickedResidence_Type_KEYWORD,
} from "@/constants/session_stores/residences_list";
import { I_Residence_display_type } from "@/interfaces/Residences";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";

interface IResidenceCart {
  residenceId: number;
  state: ResidenceStates_enum;
  step?: number;
  completionPercent?: number;
  resCode: string;
  /** کد اقامتگاه — what /rentals is addressed by. Not the same as residenceId. */
  publicId?: number;
  resName: string;
  lastUpdate: string;
  displayType: I_Residence_display_type;
  residenceType: ResidenceTypes_enum;
  imageUrl: string;
  /**
   * Overrides just the badge's text/color, for a status this card's base
   * four-value `state` can't express (معلق، در انتظار بررسی، دارای نقص) —
   * everything else (which action menu renders, the preview link) still
   * follows `state` untouched, since those listings are still concretely
   * either live or not underneath.
   */
  badgeOverride?: { text: string; bgColorClass: string };
}

export interface IDeleteResidenceBottomSheet {
  show: boolean;
  data: {
    residenceId: number;
    productType: ResidenceTypes_enum | null;
  };
}

interface I_InactivateResidenceBottomSheet {
  show: boolean;
  data: {
    residenceId: number;
    productType: null | ResidenceTypes_enum;
  };
}

const deleteResidenceBottomSheet_InitV = {
  show: false,
  data: {
    residenceId: 0,
    productType: null,
  },
};

const inactivateResidenceBottomSheet_InitV = {
  show: false,
  data: {
    residenceId: 0,
    productType: null,
  },
};

function ResidenceCart({
  residenceId,
  state,
  step,
  completionPercent,
  resCode,
  publicId,
  resName,
  lastUpdate,
  displayType,
  residenceType,
  imageUrl,
  badgeOverride,
}: IResidenceCart) {
  const router = useRouter();

  const cartRef = useRef<any>();

  const [deleteResidenceBottomSheet, setDeleteResidenceBottomSheet] =
    useState<IDeleteResidenceBottomSheet>(deleteResidenceBottomSheet_InitV);

  const [inactivateResidenceBottomSheet, setInactivateResidenceBottomSheet] =
    useState<I_InactivateResidenceBottomSheet>(inactivateResidenceBottomSheet_InitV);

  const ACTIVE_ThreeDotsSelect_DATA = [
    {
      icon: (
        <Image
          src="/assets/non-icomoon-icons/amar.svg"
          height={24}
          width={24}
          alt=""
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      ),
      text: "مشاهده آمار",
      onclick: () => {
        applySessionStorageValues_residences_list({ residenceId, residenceType });
        router.push(`/statistics/residences?residenceId=${residenceId}`);
      },
    },
    {
      icon: (
        <Image
          width={24}
          height={24}
          src={"/assets/non-icomoon-icons/comment2.svg"}
          alt=""
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      ),
      text: "مشاهده نظرات",
      onclick: () => {
        applySessionStorageValues_residences_list({ residenceId, residenceType });
        // TODO
      },
    },
    {
      icon: <i className="icon-Power text-22 text-error-light" />,
      text: <span className="text-error-light">غیرفعال سازی</span>,
      onclick: () => {
        setInactivateResidenceBottomSheet({
          show: true,
          data: {
            residenceId,
            productType: residenceType,
          },
        });
      },
    },
    {
      icon: <i className="icon-Delete text-22 text-black" />,
      text: "حذف اقامتگاه",
      onclick: () => {
        setDeleteResidenceBottomSheet({
          show: true,
          data: {
            residenceId,
            productType: residenceType,
          },
        });
      },
    },
  ];

  const DISABLED_ThreeDotsSelect_DATA = [
    {
      icon: (
        <Image
          src="/assets/non-icomoon-icons/amar.svg"
          height={24}
          width={24}
          alt=""
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      ),
      text: "مشاهده آمار",
      onclick: () => {
        applySessionStorageValues_residences_list({ residenceId, residenceType });
        router.push(`/statistics/residences?residenceId=${residenceId}`);
      },
    },
    {
      icon: (
        <Image
          width={24}
          height={24}
          src={"/assets/non-icomoon-icons/comment2.svg"}
          alt=""
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      ),
      text: "مشاهده نظرات",
      onclick: () => {
        applySessionStorageValues_residences_list({ residenceId, residenceType });
        // TODO
      },
    },
    {
      icon: <i className="icon-Delete text-22 text-black" />,
      text: "حذف اقامتگاه",
      onclick: () => {
        setDeleteResidenceBottomSheet({
          show: true,
          data: {
            residenceId,
            productType: residenceType,
          },
        });
      },
    },
  ];

  useEffect(() => {
    const persistedId = sessionStorage.getItem(ResidencesList_ClickedResidence_Id_KEYWORD);
    const persistedType = sessionStorage.getItem(ResidencesList_ClickedResidence_Type_KEYWORD);

    if (!!persistedId && !!persistedType) {
      if (Number(persistedId) === residenceId && persistedType === residenceType) {
        cartRef.current.scrollIntoView({ behavior: "smooth", block: "center" });

        sessionStorage.removeItem(ResidencesList_ClickedResidence_Id_KEYWORD);
        sessionStorage.removeItem(ResidencesList_ClickedResidence_Type_KEYWORD);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-16 h-full flex flex-col" ref={cartRef}>
      <div className="w-full h-[214px] p-12 relative rounded-tr-16 rounded-tl-16 shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            fill
            style={{
              objectFit: "cover",
            }}
            alt={resName || ""}
            className="rounded-tr-16 rounded-tl-16"
            placeholder="blur"
            blurDataURL={getBlurHash(imageUrl)}
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-tr-16 rounded-tl-16 bg-gray-F3F5F7 grid place-items-center"
          >
            <i className="icon-Photo text-40 text-gray-A9B1BC" />
          </div>
        )}

        <div className="flex flex-col justify-between h-full">
          <div className="z-3">
            <div
              className={`
                flex 
                ${state === ResidenceStates_enum.COMPLETING ? "items-start" : "items-center"}
                justify-between
            `}
            >
              <div className="flex items-center gap-x-4">
                {state === ResidenceStates_enum.ACTIVE ? (
                  <ThreeDotsSelect data={ACTIVE_ThreeDotsSelect_DATA} />
                ) : state === ResidenceStates_enum.SUSPENDED ? null : state ===
                  ResidenceStates_enum.DISABLED ? (
                  <ThreeDotsSelect data={DISABLED_ThreeDotsSelect_DATA} />
                ) : // state === ResidenceStates_enum.COMPLETING
                null}

                <div
                  className={`
                    text-12 leading-21 text-white font-r px-10 py-2
                    ${badgeOverride?.bgColorClass ?? residenceStatesMap[state]?.bgColor}
                    rounded-50
                  `}
                >
                  {badgeOverride?.text ?? residenceStatesMap[state]?.text}
                </div>
              </div>

              {state !== ResidenceStates_enum.COMPLETING ? (
                <Link
                  passHref
                  prefetch={false}
                  href={getPropertyPageUrl({ residenceId: publicId ?? residenceId })}
                  className="p-5 pl-12 text-white flex items-center gap-x-5 bg-black rounded-50 bg-opacity-80 cursor-pointer"
                  onClick={() => {
                    applySessionStorageValues_residences_list({ residenceId, residenceType });
                  }}
                >
                  <i className="icon-See text-18" />
                  <span className="text-12 leading-21">مشاهده</span>
                </Link>
              ) : (
                <div className="relative w-48 h-48">
                  <CircularProgressbar
                    value={completionPercent as number}
                    strokeWidth={50}
                    styles={buildStyles({
                      strokeLinecap: "butt",
                      backgroundColor: "#fff",
                      pathColor: "#FFC120",
                      trailColor: "#1C2E4599",
                    })}
                  />
                  <div className="w-32 h-32 bg-white text-10 flex items-center justify-center font-m text-black rounded-full absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2">
                    {completionPercent as number}%
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="z-2">
            <div className="flex grow items-end justify-between gap-x-8">
              <div className="text-14 leading-24 text-white OnlyOneLineAndEndWithElipsis">
                <p className="OnlyOneLineAndEndWithElipsis">{resName}</p>
                <p className="text-12 leading-21 font-l text-[rgba(255,255,255,0.65)] OnlyOneLineAndEndWithElipsis">
                  آخرین بروزرسانی : {lastUpdate}
                </p>
              </div>

              {!!resCode && (
                <div className="shrink-0 flex justify-end">
                  <p className="rounded-50 bg-white text-12 leading-21 text-black whitespace-nowrap px-12 py-2 flex items-center justify-center w-fit-content">
                    کد اقامتگاه : {resCode}
                  </p>
                </div>
              )}
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

      <div className="p-12 border-1 border-solid border-[#1C345442] border-t-none rounded-br-12 rounded-bl-12 grow">
        {state === ResidenceStates_enum.ACTIVE ? (
          <ActiveResidenceActions
            residenceId={residenceId}
            residenceType={residenceType}
            displayType={displayType}
          />
        ) : state === ResidenceStates_enum.SUSPENDED ? (
          <PendingResidenceActions />
        ) : state === ResidenceStates_enum.DISABLED ? (
          <InactiveResidenceActions
            residenceId={residenceId}
            residenceType={residenceType}
            displayType={displayType}
          />
        ) : (
          // state === ResidenceStates_enum.COMPLETING
          <IncompleteResidenceActions
            residenceId={residenceId}
            untilWhichStepUserHasCompleted={step as number}
            setDeleteResidenceBottomSheet={setDeleteResidenceBottomSheet}
            residenceType={residenceType}
          />
        )}
      </div>

      <BottomSheet
        open={!!deleteResidenceBottomSheet.show}
        handleClose={() => setDeleteResidenceBottomSheet(deleteResidenceBottomSheet_InitV)}
        headerTitle="حذف اقامتگاه"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <DeleteResidenceBottomSheet
              handleSmoothClose={handleSmoothClose}
              residenceId={deleteResidenceBottomSheet.data.residenceId}
              productType={deleteResidenceBottomSheet.data.productType as ResidenceTypes_enum}
            />
          );
        }}
      />

      <BottomSheet
        open={!!inactivateResidenceBottomSheet.show}
        handleClose={() => setInactivateResidenceBottomSheet(inactivateResidenceBottomSheet_InitV)}
        headerTitle="غیرفعال سازی اقامتگاه"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <InactivateResidenceBottomSheet
              handleSmoothClose={handleSmoothClose}
              residenceId={inactivateResidenceBottomSheet.data.residenceId}
              productType={inactivateResidenceBottomSheet.data.productType as ResidenceTypes_enum}
            />
          );
        }}
      />
    </div>
  );
}

export default ResidenceCart;
