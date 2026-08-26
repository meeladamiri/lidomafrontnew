import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination, Virtual } from "swiper";
import classes from "styles/Air-bnb-like-slider.module.css";
import ResBlurImage from "./ResBlurImage";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

SwiperCore.use([Navigation, Pagination]);

/**
 * The card's photo slider, mounted on the client only.
 *
 * It sits on top of the server-rendered first photo and covers it. Slide zero
 * points at the same optimised URL, so taking over costs a cache hit rather
 * than another download.
 */
function SearchCardSwiper({
  images,
  name,
  isOffscreen,
}: {
  images: string[];
  name: string;
  isOffscreen: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 ${classes["Air-bnb-like-slider"]} Make_swiper_slide_width_full`}
    >
      <Swiper
        slidesPerView={1}
        pagination={{
          dynamicBullets: true,
          el: ".swiper-pagination",
          clickable: true,
          dynamicMainBullets: 1,
        }}
        modules={[Virtual]}
        virtual
        className="h-full rounded-12"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i} virtualIndex={i} className="relative w-full !h-full">
            <ResBlurImage img={img} name={name} isOffscreen={isOffscreen} i={i} />
          </SwiperSlide>
        ))}
        <div className="swiper-pagination"></div>
      </Swiper>
    </div>
  );
}

export default SearchCardSwiper;
