import Image from "next/image";
import Link from "next/link";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { PageTitleSkeleton } from "@/components/General/Skeletons/FrequentlyUsed/PageTitleSkeleton";
import SquareSkeleton from "@/components/General/Skeletons/Square";

function SeasonalRecommendation({
  average,
  id,
  image,
  name,
}: {
  average: number;
  id: number;
  image: string;
  name: string;
}) {
  return (
    <Link
      prefetch={false}
      passHref
      href={"#"}
      className="flex items-center gap-x-12 w-full text-black"
    >
      <div className="w-56 h-56 relative shrink-0">
        <Image src={image} fill style={{ objectFit: "cover" }} alt="" className="rounded-8" />
      </div>
      <div className="grow">
        <p className="text-16 leading-24 font-r mb-12">{name}</p>
        <p className="flex items-center gap-x-4">
          <span className="text-12 leading-16 text-black font-l">میانگین هر شب :</span>
          <span className="text-12 leading-20 text-black font-r">
            {average?.toLocaleString("en-US")} تومان
          </span>
        </p>
      </div>
    </Link>
  );
}

function SeasonalRecommendationSkeleton() {
  return (
    <div className="flex items-center gap-x-12 w-full">
      <div className="w-56 h-56 relative shrink-0">
        <SquareSkeleton widthClass="w-full" heightClass="h-full" borderRadiusClass="rounded-8" />
      </div>

      <div className="grow">
        <SquareSkeleton
          widthClass="w-[70%]"
          heightClass="h-24"
          borderRadiusClass="rounded-2"
          marginsClassnames="mb-12"
        />

        <SquareSkeleton widthClass="w-[90%]" heightClass="h-20" borderRadiusClass="rounded-2" />
      </div>
    </div>
  );
}

function SeasonalRecommendationsSkeleton({ data }: { data: any[] }) {
  return (
    <>
      <PageTitleSkeleton marginClassname="mb-16" />

      <div className="hidden md:grid grid-cols-4 gap-x-24 gap-y-24">
        {data.map((sr, i: number) => {
          return (
            <div className="col-span-1" key={i}>
              <SeasonalRecommendationSkeleton />
            </div>
          );
        })}
      </div>

      <div className="md:hidden Make_swiper_slide_width_auto">
        <Swiper
          slidesPerView={"auto"}
          freeMode={true}
          slideToClickedSlide={false}
          spaceBetween={24}
          mousewheel={true}
          pagination={false}
        >
          <SwiperSlide>
            {data.slice(0, 4).map((sr, index: number) => {
              return (
                <div className="w-[254px] mb-16 last:mb-0 shrink-0" key={index}>
                  <SeasonalRecommendationSkeleton />
                </div>
              );
            })}
          </SwiperSlide>

          <SwiperSlide>
            {data.slice(4, 8).map((sr, index: number) => {
              return (
                <div className="w-[254px] mb-16 last:mb-0 shrink-0" key={index}>
                  <SeasonalRecommendationSkeleton />
                </div>
              );
            })}
          </SwiperSlide>
        </Swiper>
      </div>
    </>
  );
}
export default SeasonalRecommendationsSkeleton;
