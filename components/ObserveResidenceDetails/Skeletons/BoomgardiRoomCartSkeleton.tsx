import { Button } from "@/components/General/core/Button";
import SquareSkeleton from "@/components/General/Skeletons/Square";
import { Swiper, SwiperSlide } from "swiper/react";

function BoomgardiRoomCartSkeleton() {
  const roomInfoObj = {
    prices: {
      discount: 10000,
      extra_price: 10000,
      min_price: 10000,
      peak_price: 10000,
      week_price: 10000,
      weekend_price: 10000,
    },
    capacity: 5,
    name: " ss",
    is_fast: true,
    max_capacity: 8,
    id: 1,
    description: "aaaaaaaaaaaaaa",
    amenities: {
      cooling_system: "string",
      free_breakfast: true,
      heating_system: "string",
      refrigerator: "shared",
      separate_bathroom: true,
      wc: "dedicated",
    },
    image: "/assets/tmp/res-0.webp",
  };

  const { prices, capacity, name, is_fast, max_capacity, id, description, amenities, image } =
    roomInfoObj;

  return (
    <>
      <div className="md:p-16 md:border-1 md:border-solid md:border-gray-CACFD3 md:rounded-16">
        <div className="grid grid-cols-12 md:gap-x-16 md:pb-16 md:border-b-1 md:border-dashed md:border-b-gray-CACFD3 ">
          <div className="flex items-start gap-x-12 col-span-full md:col-span-5">
            <div className="w-[97px] h-[97px] relative">
              <SquareSkeleton
                heightClass="h-full"
                widthClass="w-full"
                borderRadiusClass="rounded-12"
              />
            </div>

            <div className="grow">
              <div className="flex items-center justify-between mb-16">
                <div className="h-24">
                  <SquareSkeleton
                    heightClass="h-full"
                    widthClass="w-[90px]"
                    borderRadiusClass="rounded-2"
                  />
                </div>

                <SquareSkeleton
                  heightClass="h-[26px]"
                  widthClass="w-[54px]"
                  borderRadiusClass="rounded-full"
                />
              </div>

              <div className=" mb-10">
                <SquareSkeleton
                  heightClass="h-24"
                  widthClass="w-[80%]"
                  borderRadiusClass="rounded-2"
                />
              </div>

              <div className="flex items-center gap-x-4">
                <SquareSkeleton
                  heightClass="h-[25px]"
                  widthClass="w-[90%]"
                  borderRadiusClass="rounded-2"
                />
              </div>
            </div>
          </div>

          <div className="hidden px-16 border-r-1 border-r-gray-CACFD3 border-dashed border-l-1 border-l-gray-CACFD3 md:flex items-center justify-between md:col-span-4">
            <div className="flex items-center gap-x-4">
              <SquareSkeleton
                heightClass="h-[24px]"
                widthClass="w-[120px]"
                borderRadiusClass="rounded-2"
              />
            </div>

            <SquareSkeleton
              heightClass="h-[24px]"
              widthClass="w-[24px]"
              borderRadiusClass="rounded-full"
            />
          </div>

          <div className="hidden md:flex md:items-center md:justify-center md:flex-col md:gap-y-12 md:col-span-3">
            <SquareSkeleton
              heightClass="h-[40px]"
              widthClass="w-full"
              borderRadiusClass="rounded-6"
            />
          </div>
        </div>

        <div className="mt-16 mb-16">
          <SquareSkeleton heightClass="h-21" widthClass="w-[60%]" borderRadiusClass="rounded-6" />
        </div>

        <div className="Make_swiper_slide_width_auto py-16 border-y-1 border-dashed border-y-gray-CACFD3 flex items-center gap-x-16 md:pb-0 md:border-b-none">
          <Swiper
            slidesPerView={"auto"}
            freeMode={true}
            slideToClickedSlide={false}
            spaceBetween={12}
            mousewheel={true}
            pagination={false}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SwiperSlide key={i}>
                <SquareSkeleton
                  heightClass="h-[25px]"
                  widthClass="w-[110px]"
                  borderRadiusClass="rounded-2"
                />
              </SwiperSlide>
            ))}
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
              //   setShowPriceDetailsBottomSheet(true);
            }}
          />
        </div>

        <Button
          className="md:hidden"
          isFullWidth
          variant="contained"
          //   color={selectRoomBtnColor || "tertiary"}
          //   onClick={() => {
          //     onRoomSelect();
          //   }}
        >
          انتخاب تاریخ
        </Button>
      </div>
    </>
  );
}
export default BoomgardiRoomCartSkeleton;
