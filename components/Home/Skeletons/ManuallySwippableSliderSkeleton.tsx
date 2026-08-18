import CircleSkeleton from "@/components/General/Skeletons/Circle";
import { PageTitleSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/PageTitleSkeleton";
import SquareSkeleton from "@/components/General/Skeletons/Square";

// Import Swiper React components
import { Swiper as SwiperWrapper, SwiperSlide } from "swiper/react";
import TypicalResidenceCartSkeletonForSwippableSlider from "./TypicalResidenceCartSkeletonForSwippableSlider";

function ManuallySwippableSliderSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between h-34 mb-16">
        <PageTitleSkeleton withoutIcon />

        <div className="flex items-center gap-x-12">
          <SquareSkeleton
            borderRadiusClass="rounded-full"
            heightClass="h-[34px]"
            widthClass="w-[111px]"
          />

          <div className="hidden md:flex items-center gap-x-8">
            <CircleSkeleton widthClass="w-32" heightClass="h-32" />
            <CircleSkeleton widthClass="w-32" heightClass="h-32" />
          </div>
        </div>
      </div>

      <div className="Make_swiper_slide_width_auto">
        <SwiperWrapper
          slidesPerView={"auto"}
          freeMode={true}
          slideToClickedSlide={false}
          spaceBetween={16}
          mousewheel={true}
          pagination={false}
          //   onInit={(ev) => {
          //     set_swiper_slide(ev);
          //   }}
        >
          {Array.from({ length: 4 }).map((_, index: number) => {
            return (
              <SwiperSlide key={index}>
                <div className="w-[310px] shrink-0">
                  <TypicalResidenceCartSkeletonForSwippableSlider />
                </div>
              </SwiperSlide>
            );
          })}
        </SwiperWrapper>
      </div>
    </div>
  );
}

export default ManuallySwippableSliderSkeleton;
