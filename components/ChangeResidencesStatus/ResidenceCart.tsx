import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";
import classes from "@/styles/line-clamps.module.css";
import { Checkbox } from "../General/core/Checkbox";
// import exception from "@/utilities/exception";
import { copyToClipboard } from "@/utilities/copyToClipboard";
// import { EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { changeResidencesStatusGetObserveResidence } from "@/api/ChangeResidencesStatus/changeResidencesStatusGetObserveResidence";
import { appendQueryParameters } from "@/utilities/URL/appendQueryParameters";
import { removeQueryParameters } from "@/utilities/URL/removeQueryParameters";
import { isResOrRoomChecked } from "./isResOrRoomChecked";
import Tooltip from "../General/Tooltip";
import { momentToJalaliWithTime3 } from "@/utilities/dateTools";
import moment from "moment-jalaali";
// import { CallCenterNames } from "@/constants/CallCenterNames";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import Link from "next/link";

const CustomLightbox = dynamic(() => import("@/components/General/CustomLightbox/CustomLightbox"), {
  ssr: true,
});

// const Tooltip = dynamic(() => import("@/components/General/Tooltip"), {
//   ssr: true,
// });

interface I_ResidenceCart {
  setCheckedAllResidences: Dispatch<SetStateAction<boolean>>;
  display_type: "suit" | "boomgardi" | "all";
  image_url: string;
  resId: number;
  resName: string;
  hostName: string;
  hostPhone: string;
  resAddress: string;
  rooms: {
    name: string;
    id: number;
  }[];
  lastUpdateBy: string;
  lastUpdateAt: string;
}

function ResidenceCart({
  setCheckedAllResidences,
  display_type,
  image_url,
  resId,
  resName,
  hostName,
  hostPhone,
  resAddress,
  rooms,
  lastUpdateBy,
  lastUpdateAt,
}: I_ResidenceCart) {
  const [showBoomgardiResidenceRooms, setShowBoomgardiResidenceRooms] = useState<boolean>(false);
  const [observeResidenceId, setObserveResidenceId] = useState<number>();
  const router = useRouter();
  const [showLightbox, setShowLightbox] = useState<boolean>();
  const [copiedTooltipPosition, setCopiedTooltipPosition] = useState({ x: 0, y: 0 });

  const handleDisplayCopiedTooltip = (event: React.MouseEvent) => {
    setCopiedTooltipPosition({ x: event.clientX, y: event.clientY });
  };

  const {
    data: observeResidenceData,
    // isSuccess: observeResidenceIsSuccess,
    isLoading: observeResidenceIsLoading,
  } = useQuery(
    ["changeResidencesStatusGetObserveResidence", observeResidenceId],
    () => {
      return changeResidencesStatusGetObserveResidence({
        product_id: observeResidenceId as number,
      });
    },
    {
      enabled: !!observeResidenceId,
      onSuccess: () => {},
    }
  );

  const res_property_page_link = getPropertyPageUrl({
    residenceId: resId,
  });

  return (
    <div
      className={`cursor-pointer border border-gray-E8E8E8 rounded-12 p-12 flex flex-col justify-center gap-12 mb-4 ${
        showBoomgardiResidenceRooms ? "bg-gray-F3F8FE" : ""
      }`}
    >
      <div
        className={`flex items-center gap-x-8 justify-between
        }`}
      >
        <Checkbox
          checked={
            display_type === "boomgardi"
              ? // ? (rooms?.length === 1 && router?.query?.roomId === rooms[0]?.id.toString()) ||
                //   (rooms?.length > 1 &&
                //     rooms.every((room) => router?.query?.roomId?.includes(room.id.toString())))
                (Array.isArray(router?.query?.roomId) &&
                  rooms.every((room) => router?.query?.roomId?.includes(room.id.toString()))) ||
                (typeof router?.query?.roomId === "string" &&
                  rooms.length === 1 &&
                  router?.query?.roomId === rooms[0]?.id.toString())
              : isResOrRoomChecked({ resOrRoomId: resId, parameterKey: "residenceId", router })
          }
          onChange={() => {
            setCheckedAllResidences(false);
            if (display_type === "boomgardi") {
              const isResSelected =
                // (rooms?.length === 1 && router?.query?.roomId === rooms[0]?.id.toString()) ||
                // (rooms?.length > 1 &&
                //   rooms.every((room) => router?.query?.roomId?.includes(room.id.toString())));
                (Array.isArray(router?.query?.roomId) &&
                  rooms.every((room) => router?.query?.roomId?.includes(room.id.toString()))) ||
                (typeof router?.query?.roomId === "string" &&
                  rooms.length === 1 &&
                  router?.query?.roomId === rooms[0]?.id.toString());

              if (!isResSelected) {
                // add resId to URL and also add all its possible rooms to the URL.
                appendQueryParameters(router, [
                  // ["residenceId", resId],
                  ...(rooms as any)
                    .filter((room: any) => {
                      return !isResOrRoomChecked({
                        parameterKey: "roomId",
                        resOrRoomId: room.id,
                        router: router,
                      });
                    })
                    .map((room: any) => {
                      return ["roomId", room.id];
                    }),
                ]);
              } else {
                // Remove both the resId and ALL its rooms ids from URL.
                removeQueryParameters(router, [
                  // { paramKey: "residenceId", paramValue: resId.toString() },
                  ...rooms.map((room) => {
                    return {
                      paramKey: "roomId",
                      paramValue: room.id.toString(),
                    };
                  }),
                ]);
              }
            } else {
              const isResSelected = isResOrRoomChecked({
                resOrRoomId: resId,
                parameterKey: "residenceId",
                router,
              });
              if (!isResSelected) {
                // add resId to URL and also add all its possible rooms to the URL.
                appendQueryParameters(router, [["residenceId", resId]]);
              } else {
                // Remove both the resId and ALL its rooms ids from URL.
                removeQueryParameters(router, [
                  { paramKey: "residenceId", paramValue: resId.toString() },
                ]);
              }
            }
          }}
          inputClassnames="checked:after:!bg-blue-dark"
        />
        {image_url && (
          <div
            onClick={() => {
              setObserveResidenceId(resId);
              setShowLightbox(true);
            }}
            className="bg-gray-F5F9FF w-44 h-44 flex shrink-0 items-center justify-center relative rounded-[50%] cursor-pointer"
          >
            <Image
              src={image_url}
              alt={resName}
              className="rounded-[50%]"
              fill
              sizes="100vw"
              style={{
                objectFit: "cover",
              }}
            />
          </div>
        )}
        <div className="flex justify-center flex-col gap-4">
          <p
            title={resName}
            className={`text-16 leading-24 text-gray-263341 font-r ${classes["line-clamp-1"]}`}
          >
            {resName}
          </p>
          <p
            title={resAddress}
            className={`text-14 leading-20 text-gray-616E7C font-r ${classes["line-clamp-1"]}`}
          >
            {resAddress}
          </p>
        </div>
        {display_type === "boomgardi" && (
          <div
            onClick={() => setShowBoomgardiResidenceRooms(!showBoomgardiResidenceRooms)}
            className="bg-gray-F4F5F6 rounded-10 flex items-center justify-center p-8 mr-52"
          >
            {showBoomgardiResidenceRooms ? (
              <i className="icon-FlashUp text-24 text-black" />
            ) : (
              <i className="icon-FlashDown text-24 text-black" />
            )}
          </div>
        )}
        {display_type === "suit" && !!rooms.length && (
          <span className="bg-gray-F4F5F6 py-3 px-4 rounded-4 flex items-center gap-x-4 mb-20">
            {rooms.length}
            <i className="icon-Rooms"></i>
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href={res_property_page_link}
            prefetch={false}
            passHref
            className="border-l border-gray-E8E8E8 pl-8 ml-8"
          >
            <span className="text-14 leading-20 text-blue-main font-r">{resId}</span>
          </Link>
          <span className="text-14 leading-20 text-gray-616E7C font-r">{hostName}</span>
        </div>
        <div className="flex items-center text-14 leading-20 text-gray-263341 font-r gap-x-4">
          <span>{hostPhone}</span>
          {hostPhone && (
            <Image
              onClick={(e) => {
                copyToClipboard(hostPhone);
                handleDisplayCopiedTooltip(e);
              }}
              src="/assets/non-icomoon-icons/copy2.svg"
              width={24}
              height={24}
              alt="copy"
            />
            // <span
            //   onClick={(e) => {
            //     copyToClipboard(hostPhone);
            //     // exception.message([
            //     //   {
            //     //     type: EXCEPTIONTYPES.SUCCESS,
            //     //     title: "شماره تلفن میزبان با موفقیت کپی شد.",
            //     //   },
            //     // ]);
            //     handleDisplayCopiedTooltip(e);
            //   }}
            //   className="d-flex justify-center items-center p-10 hover:bg-slate-200 rounded-[50%]"
            // >
            //   <i className="icon-Hide text-black text-24"></i>
            // </span>
          )}
        </div>
      </div>
      {lastUpdateAt && lastUpdateBy && (
        <div className="flex items-center pt-8 border-t border-gray-C4CAD3">
          <div className="text-gray-616E7C text-11 leading-14 font-r pl-12 border-l border-gray-CACFD3 flex items-center gap-8">
            <span>آخرین بروزرسانی:</span>
            <span>{momentToJalaliWithTime3(moment(lastUpdateAt))}</span>
          </div>
          <span className="text-gray-616E7C text-11 leading-14 font-r pr-12">
            {/* توسط : {CallCenterNames.includes(lastUpdateBy) ? lastUpdateBy : "میزبان"} */}
            {lastUpdateBy}
          </span>
        </div>
      )}

      {display_type === "boomgardi" && showBoomgardiResidenceRooms && (
        <div className="flex flex-col gap-y-8">
          {rooms?.map((room, idx) => (
            <div
              key={idx}
              className="border border-blue-main rounded-8 p-12 flex items-center gap-x-8 bg-gray-F4F5F6"
            >
              <Checkbox
                checked={
                  // isResOrRoomChecked(resId, "residenceId", router) ||
                  isResOrRoomChecked({ resOrRoomId: room.id, parameterKey: "roomId", router })
                }
                onChange={() => {
                  setCheckedAllResidences(false);
                  const isParentSelected =
                    // (rooms?.length === 1 && router?.query?.roomId === rooms[0]?.id.toString()) ||
                    // (rooms?.length > 1 &&
                    //   rooms.every((room) => router?.query?.roomId?.includes(room.id.toString())));
                    (Array.isArray(router?.query?.roomId) &&
                      rooms.every((room) => router?.query?.roomId?.includes(room.id.toString()))) ||
                    (typeof router?.query?.roomId === "string" &&
                      rooms.length === 1 &&
                      router?.query?.roomId === rooms[0]?.id.toString());
                  const isRoomSelected = isResOrRoomChecked({
                    resOrRoomId: room.id,
                    parameterKey: "roomId",
                    router,
                  });

                  if (!!isParentSelected && !!isRoomSelected) {
                    removeQueryParameters(router, [
                      // Remove the parent
                      // { paramKey: "residenceId", paramValue: resId.toString() },
                      // And also the room
                      { paramKey: "roomId", paramValue: room.id.toString() },
                    ]);
                  } else if (!isParentSelected && !!isRoomSelected) {
                    removeQueryParameters(router, [
                      { paramKey: "roomId", paramValue: room.id.toString() },
                    ]);
                  } else {
                    // so (!isParentSelected && !isRoomSelected)
                    const selectedRoomsOfThisRes = rooms?.filter(
                      (room) =>
                        !!isResOrRoomChecked({
                          parameterKey: "roomId",
                          resOrRoomId: room.id,
                          router,
                        })
                    );

                    if (selectedRoomsOfThisRes.length === rooms.length - 1) {
                      // Only this room is not yet selected. and user has clicked on it to be selected. so all of the rooms are selected. so lets add parentId to url.
                      appendQueryParameters(router, [
                        ["roomId", room.id],
                        // ["residenceId", resId],
                      ]);
                    } else {
                      appendQueryParameters(router, [["roomId", room.id]]);
                    }
                  }
                }}
                inputClassnames="checked:after:!bg-blue-dark"
              />
              <div className="bg-white p-6 rounded-[50%] w-36 h-36 flex items-center justify-center">
                {/* self-closing tag */}
                <i className="icon-Rooms text-24" />
              </div>
              <span className="text-14 text-black leading-20 font-r">{room.name}</span>
            </div>
          ))}
        </div>
      )}

      {!!showLightbox && (
        <CustomLightbox
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
          images={observeResidenceData?.params?.images?.map((image: string) => ({
            url: image,
            name,
          }))}
        />
      )}
      {copiedTooltipPosition.x !== 0 && copiedTooltipPosition.y !== 0 && (
        <Tooltip
          icon="icon-Success"
          text="کپی شد"
          x={copiedTooltipPosition.x - 16}
          y={copiedTooltipPosition.y - 60}
        />
      )}
    </div>
  );
}

export default ResidenceCart;
