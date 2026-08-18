import { BedSetItem } from "./BedSetItem";
import { IObserveResidenceData } from "interfaces/observe_residence";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// install Swiper modules
SwiperCore.use([Navigation]);

function BedsSlider({ rooms }: { rooms: IObserveResidenceData["rooms"] }) {
  return (
    <Swiper
      slidesPerView={"auto"}
      freeMode={true}
      slideToClickedSlide={false}
      spaceBetween={12}
      mousewheel={true}
      pagination={false}
    >
      {rooms?.map((room, i) => {
        const singleBedDesc = !!room?.single_bed ? `${room?.single_bed} تخت یک نفره` : "";
        const doubleBedDesc = !!room?.double_bed ? `${room?.double_bed} تخت دونفره` : "";
        const traditionalBedDesc = !!room?.traditional_bed
          ? `${room?.traditional_bed} رخت خواب سنتی`
          : "";

        const bedsDesc = [singleBedDesc, doubleBedDesc, traditionalBedDesc]
          .filter((desc) => !!desc)
          .join(" + ");

        return (
          <SwiperSlide key={i}>
            <BedSetItem
              name={room.name}
              icon="icon-Rooms"
              // desc={`${singleBedDesc} ${doubleBedDesc} ${traditionalBedDesc}`}
              desc={bedsDesc}
            />
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
export default BedsSlider;
