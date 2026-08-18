import PageTitle from "@/components/General/PageTitle";
import { Dispatch, SetStateAction } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

const Hotel_Stars_Ratings = [
  {
    name: "مهم نیست",
    value: -1,
  },
  {
    name: "2 ستاره",
    value: 2,
  },
  {
    name: "3 ستاره",
    value: 3,
  },
  {
    name: "4 ستاره",
    value: 4,
  },
  {
    name: "5 ستاره",
    value: 5,
  },
];

function HotelStars({
  tmpHotelStars,
  setTmpHotelStars,
}: {
  tmpHotelStars: number | undefined;
  setTmpHotelStars: Dispatch<SetStateAction<number | undefined>>;
}) {
  return (
    <>
      <PageTitle
        title="هتل چند ستاره ؟"
        icon={<i className="icon-Star text-24" />}
        containerClassname="mb-16"
      />

      <div className="Make_swiper_slide_width_auto">
        <Swiper
          slidesPerView={"auto"}
          freeMode={true}
          slideToClickedSlide={false}
          spaceBetween={12}
          mousewheel={true}
          pagination={false}
        >
          {Hotel_Stars_Ratings.map((rating, idx: number) => {
            return (
              <SwiperSlide key={idx}>
                <div
                  className={`
                        py-4 px-16 text-14 leading-24 font-r border-1 border-solid rounded-full cursor-pointer shrink-0
                        ${
                          tmpHotelStars === rating.value || (rating.value === -1 && !tmpHotelStars)
                            ? "bg-black text-white border-black"
                            : "text-black bg-white border-gray-CACFD3"
                        }
                    `}
                  onClick={() => {
                    if (rating.value === -1) {
                      setTmpHotelStars(undefined);
                    } else {
                      setTmpHotelStars(rating.value);
                    }
                  }}
                >
                  {rating.name}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </>
  );
}

export default HotelStars;
