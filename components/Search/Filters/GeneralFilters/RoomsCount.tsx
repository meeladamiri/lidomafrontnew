// import PageTitle from "@/components/General/PageTitle";
import { Dispatch, SetStateAction } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/navigation";
import Counter from "@/components/General/Counter";

function RoomsCount({
  tmpRoomsCount,
  setTmpRoomsCount,
}: {
  tmpRoomsCount: number;
  setTmpRoomsCount: Dispatch<SetStateAction<number>>;
}) {
  return (
    <>
      {/* <PageTitle
        title="تعداد اتاق"
        icon={<i className="icon-Rooms text-24" />}
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
          {Array.from({ length: 10 }).map((_, idx: number) => {
            return (
              <SwiperSlide key={idx}>
                <div
                  className={`
                        py-4 px-16 text-14 leading-24 font-r border-1 border-solid rounded-full cursor-pointer shrink-0
                        ${
                          tmpRoomsCount === idx || (idx === 0 && !tmpRoomsCount)
                            ? "bg-black text-white border-black"
                            : "text-black bg-white border-gray-CACFD3"
                        }
                    `}
                  onClick={() => {
                    if (idx === 0) {
                      setTmpRoomsCount(undefined);
                    } else {
                      setTmpRoomsCount(idx);
                    }
                  }}
                >
                  {idx === 0 ? "مهم نیست" : idx}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div> */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-10">
          <i className="icon-Rooms text-24" />
          <p className="text-14 leading-18 font-r text-black">حداقل تعداد اتاق</p>
        </div>

        <div className="w-[107px]">
          <Counter
            inputName={`choose-number-of-room-filter`}
            counterMinimum={0}
            customValue={tmpRoomsCount}
            onInc={() => setTmpRoomsCount((prev) => (prev as number) + 1)}
            onDec={() => setTmpRoomsCount((prev) => (prev as number) - 1)}
          />
        </div>
      </div>
    </>
  );
}

export default RoomsCount;
