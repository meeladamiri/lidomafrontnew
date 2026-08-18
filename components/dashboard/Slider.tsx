import Image from "next/image";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { IDashboardSlider } from "api/Dashboard";
import Link from "next/link";
import classes from "styles/Dashboard-page-slider.module.css";

// install Swiper modules
SwiperCore.use([Navigation, Pagination]);

function DashboardPageSlider({ slides }: { slides: IDashboardSlider[] }) {
  return (
    <div className={`${classes["Dashboard-page-slider"]} relative`}>
      <Swiper
        // spaceBetween={50}
        // modules={[Pagination]}
        pagination={{ clickable: true }}
        // spaceBetween={16}
        // centeredSlides={true}
        slidesPerView={1}
        onSwiper={(swiper) => {
          // setSwiper(swiper);
        }}
        onActiveIndexChange={(swiper) => {
          // console.log("active index is", swiper.activeIndex);
        }}
        className="rounded-12"
      >
        {slides.map((slide, i) => {
          return (
            <SwiperSlide key={i}>
              <div className="relative w-full h-[214px] rounded-12 overflow-hidden">
                <Link passHref href={slide.link || "#"} prefetch={false}>
                  <Image
                    src={`${slide.image_url}`}
                    alt=""
                    fill
                    sizes="100vw"
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </Link>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      {/* <div className="swiper-pagination mt-16"></div> */}
    </div>
  );
}

export default DashboardPageSlider;
