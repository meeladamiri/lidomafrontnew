import Image from "next/image";
import { Button, ICustomButton } from "../General/core/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { useState } from "react";
import { IAvailableRoom } from "@/api/Boomgardi";

// Import Swiper styles
import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";

import dynamic from "next/dynamic";
import { useBoomgardiPropertyPageData } from "@/providers/BoomgardiPropertyPage";
const FastReserveBox = dynamic(() => import("../General/FastReserveBox"), {
  ssr: true,
});
const PriceDetailsBottomSheet = dynamic(
  () => import("../General/PriceDetails/PriceDetailsBottomSheets/StaticPriceDetailsBottomSheet"),
  {
    ssr: true,
  }
);
const BottomSheet = dynamic(() => import("../General/core/BottomSheet"), {
  ssr: true,
});

interface IBoomgardiRoomCart {
  roomInfoObj: IAvailableRoom;
  selectRoomBtnColor?: ICustomButton["color"];
  onRoomSelect: () => void;
}
const sharedOrDedicatedMap = {
  shared: "اشتراکی",
  dedicated: "اختصاصی",
};

function BoomgardiRoomCart({ roomInfoObj, selectRoomBtnColor, onRoomSelect }: IBoomgardiRoomCart) {
  const { selectedRanges, selectedRoomByUser, setSelectedRoomByUser, setShowDoubleCalendar } =
    useBoomgardiPropertyPageData();
  const [showPriceDetailsBottomSheet, setShowPriceDetailsBottomSheet] = useState(false);

  const { prices, capacity, name, is_fast, max_capacity, id, description, amenities, image } =
    roomInfoObj;

  return (
    <>
      <div
        className={`
          md:p-16 md:border-1 md:border-solid md:border-gray-CACFD3 md:rounded-16
          ${
            !!selectedRoomByUser && selectedRoomByUser.id !== roomInfoObj.id
              ? "opacity-50 pointer-events-none"
              : ""
          }
        `}
      >
        <div className="grid grid-cols-12 md:gap-x-16 md:pb-16 md:border-b-1 md:border-dashed md:border-b-gray-CACFD3 ">
          <div className="flex items-start gap-x-12 col-span-full md:col-span-5">
            <div className="w-[97px] h-[97px] relative">
              <Image
                src={image}
                fill
                style={{ objectFit: "cover" }}
                alt={roomInfoObj.name}
                className="rounded-12"
              />
            </div>

            <div className="grow">
              <div className="flex items-center justify-between mb-16">
                <p className="text-14 leading-24 text-black font-m">{name}</p>

                {!!is_fast && <FastReserveBox smallText />}
              </div>

              <div className="flex items-center gap-x-4 mb-10">
                <i className="icon-Profile text-24 text-black" />

                <p className="text-12 leading-21 text-black font-r">{capacity} نفر</p>

                {!!(max_capacity - capacity) && (
                  <p className="text-12 leading-21 text-black font-l">
                    + {max_capacity - capacity} نفر اضافه
                  </p>
                )}
              </div>

              <div className="flex items-center gap-x-4">
                <Image src="/assets/non-icomoon-icons/cup.svg" width={24} height={24} alt="" />

                <p
                  className={`
                    text-12 leading-21 text-black font-l
                    ${amenities.free_breakfast ? "" : "line-through"}
                  `}
                >
                  صبحانه رایگان
                </p>
              </div>
            </div>
          </div>

          <div className="hidden px-16 border-r-1 border-r-gray-CACFD3 border-dashed border-l-1 border-l-gray-CACFD3 md:flex items-center justify-between md:col-span-4">
            <div className="flex items-center gap-x-4">
              <p className="text-12 leading-21 text-black font-r">هر شب از :</p>
              <p className="text-14 leading-24 text-black font-m">
                {prices?.min_price?.toLocaleString("en-US")} تومان
              </p>
            </div>

            <i
              className="icon-Warning text-blue-main text-24 rotate-180 cursor-pointer"
              onClick={() => {
                setShowPriceDetailsBottomSheet(true);
              }}
            />
          </div>

          <div className="hidden md:flex md:items-center md:justify-center md:flex-col md:gap-y-12 md:col-span-3">
            {!!selectedRoomByUser && selectedRoomByUser?.id === id && (
              <div className="bg-green-light w-full py-8 px-4 flex items-center justify-center rounded-8 text-green-main">
                انتخاب شده
              </div>
            )}

            {selectedRanges?.length === 0 ||
            (selectedRanges?.length === 1 && !selectedRanges?.[0]?.[1]) ? (
              <Button
                color="tertiary"
                isFullWidth
                onClick={() => {
                  // open up calendar modal
                  // if (!!setShowDoubleCalendar) {
                  setShowDoubleCalendar(true);
                  // }
                }}
              >
                انتخاب تاریخ
              </Button>
            ) : // both ends of date  is selected
            !!selectedRoomByUser && selectedRoomByUser?.id === id ? (
              <Button
                variant="outlined"
                color="grey"
                isFullWidth
                className="text-error-light"
                onClick={() => {
                  //  set selecetd room by user to undefined
                  if (!!setSelectedRoomByUser) {
                    setSelectedRoomByUser(undefined);
                  }
                }}
              >
                لغو انتخاب
              </Button>
            ) : (
              <Button
                color="warning"
                variant="contained"
                onClick={() => {
                  //  set selecetd room by user to this room
                  if (!!setSelectedRoomByUser) {
                    setSelectedRoomByUser(roomInfoObj);
                  }
                }}
                isFullWidth
              >
                انتخاب اتاق
              </Button>
            )}
          </div>
        </div>

        <p className="mt-16 text-12 leading-21 text-black font-l mb-16">{description}</p>

        <div className="Make_swiper_slide_width_auto py-16 border-y-1 border-dashed border-y-gray-CACFD3 flex items-center gap-x-16 md:pb-0 md:border-b-none">
          <Swiper
            slidesPerView={"auto"}
            freeMode={true}
            slideToClickedSlide={false}
            spaceBetween={12}
            mousewheel={true}
            pagination={false}
          >
            <SwiperSlide>
              <div className="w-auto shrink-0">
                <div className="flex items-center gap-x-4 shrink-0">
                  <Image
                    src="/assets/non-icomoon-icons/climate_mini_split.svg"
                    width={20}
                    height={20}
                    alt=""
                  />
                  <p className="text-12 leading-21 text-black font-l">
                    سیستم سرمایشی {amenities?.cooling_system || "ندارد"}
                  </p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-auto shrink-0">
                <div className="flex items-center gap-x-4 shrink-0">
                  <Image src="/assets/non-icomoon-icons/heater.svg" width={20} height={20} alt="" />
                  <p className="text-12 leading-21 text-black font-l">
                    سیستم گرمایشی {amenities?.heating_system || "ندارد"}
                  </p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-auto shrink-0">
                <div className="flex items-center gap-x-4 shrink-0">
                  <Image
                    src="/assets/non-icomoon-icons/kitchen.svg"
                    width={11}
                    height={15}
                    alt=""
                  />
                  <p className="text-12 leading-21 text-black font-l">
                    یخچال{" "}
                    {!amenities?.refrigerator || amenities?.refrigerator === "none"
                      ? "ندارد"
                      : sharedOrDedicatedMap[amenities?.refrigerator]}
                  </p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-auto shrink-0">
                <div className="flex items-center gap-x-4 shrink-0">
                  <Image src="/assets/non-icomoon-icons/shower.png" width={20} height={20} alt="" />
                  <p className="text-12 leading-21 text-black font-l">
                    حمام مجزا {!!amenities.separate_bathroom ? "دارد" : "ندارد"}
                  </p>
                </div>
              </div>
            </SwiperSlide>

            <SwiperSlide>
              <div className="w-auto shrink-0">
                <div className="flex items-center gap-x-4 shrink-0">
                  <Image src="/assets/non-icomoon-icons/wc.svg" width={20} height={20} alt="" />
                  <p className="text-12 leading-21 text-black font-l">
                    سرویس بهداشتی{" "}
                    {!amenities?.wc || amenities?.wc === "none"
                      ? "ندارد"
                      : sharedOrDedicatedMap[amenities?.wc]}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>

        <div className="md:hidden py-16 border-b-1 border-dashed border-b-gray-CACFD3 flex items-center justify-between mb-16">
          <div className="flex items-center gap-x-4">
            <p className="text-12 leading-21 text-black font-r">هر شب از :</p>
            <p className="text-14 leading-24 text-black font-m">
              {prices?.min_price?.toLocaleString("en-US")} تومان
            </p>
          </div>

          <i
            className="icon-Warning text-blue-main text-24 rotate-180 cursor-pointer"
            onClick={() => {
              setShowPriceDetailsBottomSheet(true);
            }}
          />
        </div>

        <Button
          className="md:hidden"
          isFullWidth
          variant="contained"
          color={selectRoomBtnColor || "tertiary"}
          onClick={() => {
            onRoomSelect();
          }}
        >
          {selectedRanges?.length === 0 ||
          (selectedRanges?.length === 1 && !selectedRanges?.[0]?.[1])
            ? "انتخاب تاریخ"
            : "انتخاب اتاق"}
        </Button>
      </div>

      {!!showPriceDetailsBottomSheet && (
        <BottomSheet
          open={showPriceDetailsBottomSheet}
          handleClose={() => setShowPriceDetailsBottomSheet(false)}
          headerTitle="جزئیات قیمت"
          body={({ handleSmoothClose }) => {
            return (
              <PriceDetailsBottomSheet handleSmoothClose={handleSmoothClose} prices={prices} />
            );
          }}
        />
      )}
    </>
  );
}

export default BoomgardiRoomCart;
