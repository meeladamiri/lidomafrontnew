import Image, { StaticImageData } from "next/image";
import { useMediaQuery } from "@/utilities/useMediaQuery";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import SectionMainImageAtSide from "./SectionMainImageAtSide";
import { useState } from "react";
import CustomLightbox from "../General/CustomLightbox/CustomLightbox";
// install Swiper modules
SwiperCore.use([Navigation]);

interface ISection {
  showMainImageAtRight?: boolean;
  showMainImageAtLeft?: boolean;
  title: string;
  images?: StaticImageData[];
  bodyText: string;
  wrapperClassName?: string;
}

function Section({
  title,
  bodyText,
  showMainImageAtRight,
  showMainImageAtLeft,
  images,
  wrapperClassName,
}: ISection) {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const [showLightbox, setShowLightbox] = useState<boolean>(false);

  return (
    <>
      <div
        className={`px-16 md:px-0 pb-16 md:pb-0 pt-24 md:pt-0 rounded-20 md:rounded-0 bg-white shadow-[0px_2px_6px_0px_rgba(24,39,58,0.08)] md:shadow-none ${
          wrapperClassName || ""
        }`}
      >
        <h1 className="text-20 md:text-32 leading-28 md:leading-40 text-black mb-32 md:mb-24">
          {title}
        </h1>

        <div className="">
          {/* mainImage in mobile */}
          {!!images && (
            <div className="w-full h-[200px] mb-16 relative md:hidden">
              <Image
                src={images[0]}
                fill
                style={{ objectFit: "cover", borderRadius: "12px" }}
                alt={title}
              />
            </div>
          )}

          {/* bodyText */}
          <div className="flex items-start gap-x-24">
            {!!showMainImageAtRight && !!isDesktop && !!images && (
              <SectionMainImageAtSide imgSrc={images[0]} />
            )}

            <div className="grow text-14 leading-26 text-black whitespace-pre-line -mt-26">
              <span>{bodyText}</span>
            </div>

            {!!showMainImageAtLeft && !!isDesktop && !!images && (
              <SectionMainImageAtSide imgSrc={images[0]} />
            )}
          </div>

          {!!images && (
            <div className="mt-24">
              <div className="md:hidden">
                <p className="text-14 leading-20 font-m text-black border-r-2 border-r-primary-main border-solid pr-8 py-4 mb-8">
                  تصاویر این بخش
                </p>

                <p className="text-12 leading-16 font-r text-gray-959FA7 mb-16">
                  جهت مشاهده هر تصویر، بر روی آن کلیک کنید
                </p>
              </div>

              {/* images slider */}
              <div className="Make_swiper_slide_width_auto_height_auto">
                <Swiper
                  slidesPerView={"auto"}
                  freeMode={true}
                  slideToClickedSlide={false}
                  spaceBetween={16}
                  mousewheel={true}
                  pagination={false}
                >
                  {[...images.slice(1), images[0]].map((image, i) => {
                    return (
                      <SwiperSlide key={i}>
                        <Image
                          src={image}
                          placeholder="blur"
                          width={240}
                          height={160}
                          style={{
                            borderRadius: "12px",
                            height: "160px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                          className="shrink-0"
                          alt=""
                          onClick={() => {
                            setShowLightbox(true);
                          }}
                        />
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            </div>
          )}
        </div>
      </div>

      {!!showLightbox && !!images && (
        <CustomLightbox
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
          staticImages={images}
        />
      )}
    </>
  );
}

export default Section;
