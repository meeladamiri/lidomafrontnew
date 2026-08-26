// import PageTitle from "components/General/PageTitle";
import Link from "next/link";
import { useState } from "react";

// Import Swiper React components
import Swiper, { FreeMode } from "swiper";
import { Swiper as SwiperWrapper, SwiperSlide } from "swiper/react";

import SwiperCore, { Navigation } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// install Swiper modules
SwiperCore.use([Navigation]);

function ManuallySwippableSlider({
  title,
  seeAllItemsLink,
  data,
  titleAsH1,
  headingLevel,
  showArrowsForNextAndPrevSlide = true,
}: {
  title?: string;
  titleAsH1?: boolean;
  /** 2–4. Set per slider in the admin panel; ignored when titleAsH1 is set. */
  headingLevel?: number;
  seeAllItemsLink?: string;
  data: JSX.Element[];
  showArrowsForNextAndPrevSlide?: boolean;
}) {
  const [swiper_slide, set_swiper_slide] = useState<Swiper>();

  // The page's single H1 lives in the hero, so a slider heading is H2 by
  // default and can be pushed deeper when the section is a subsection.
  const Heading = `h${Math.min(Math.max(headingLevel ?? 2, 2), 4)}` as unknown as "h2";

  return (
    <div>
      <div className="flex items-center justify-between mb-16">
        {!!title && (
          <header>
            {!!titleAsH1 ? (
              <h1 className="text-[#000000] text-16 leading-28 font-m">{title}</h1>
            ) : (
              <Heading className="text-[#000000] text-16 leading-28 font-m">{title}</Heading>
            )}
          </header>
        )}

        <div className="flex items-center gap-x-12">
          {!!seeAllItemsLink && (
            <Link
              passHref
              prefetch={false}
              href={seeAllItemsLink}
              className="px-16 py-6 ml-16 border-1 border-solid border-gray-CACFD3 rounded-full text-14 leading-20 font-m text-black hover:border-primary-main"
            >
              مشاهده همه
            </Link>
          )}

          {!!showArrowsForNextAndPrevSlide && (
            <div className="hidden md:flex items-center gap-x-8">
              <div
                onClick={() => swiper_slide?.slidePrev()}
                className="w-32 h-32 cursor-pointer text-black hover:text-primary-main hover:border-primary-main rounded-full flex items-center justify-center border-1 border-solid border-gray-CACFD3"
              >
                <i className="icon-FlashRight text-24" />
              </div>

              <div
                onClick={() => swiper_slide?.slideNext()}
                className="w-32 h-32 cursor-pointer text-black hover:text-primary-main hover:border-primary-main rounded-full flex items-center justify-center border-1 border-solid border-gray-CACFD3"
              >
                <i className="icon-FlashLeft text-24" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="Make_swiper_slide_width_auto">
        <SwiperWrapper
          wrapperTag="ul"
          slidesPerView={"auto"}
          slideToClickedSlide={false}
          spaceBetween={16}
          mousewheel={true}
          pagination={false}
          freeMode={true}
          modules={[FreeMode]}
          onInit={(ev) => {
            set_swiper_slide(ev);
          }}
          speed={100}
        >
          {data?.map((item: JSX.Element, index: number) => {
            return (
              <SwiperSlide tag="li" key={index}>
                {item}
              </SwiperSlide>
            );
          })}
        </SwiperWrapper>
      </div>
    </div>
  );
}

export default ManuallySwippableSlider;
