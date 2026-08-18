import { Lidoma_Features } from "@/constants/Lidoma_Features";
import { Swiper, SwiperSlide } from "swiper/react";
import LidomaFeatureItem from "./LidomaFeatureItem";

function LidomaFeaturesMobile() {
  return (
    <div className="Make_swiper_slide_width_auto md:hidden">
      <Swiper
        slidesPerView={"auto"}
        freeMode={true}
        slideToClickedSlide={false}
        spaceBetween={12}
        mousewheel={true}
        pagination={false}
      >
        {Lidoma_Features.map((lidomaFeature, index: number) => {
          return (
            <SwiperSlide key={index}>
              <div className="w-[310px] shrink-0">
                <LidomaFeatureItem
                  icon={lidomaFeature.icon}
                  title={lidomaFeature.title}
                  description={lidomaFeature.description}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

export default LidomaFeaturesMobile;
