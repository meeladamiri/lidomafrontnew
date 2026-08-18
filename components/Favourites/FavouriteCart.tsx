import Image from "next/image";
import LikeOrNot from "components/General/LikeOrNot";
import Share from "components/General/Share/Share";
import classes from "styles/Air-bnb-like-slider.module.css";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination } from "swiper";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
// install Swiper modules
SwiperCore.use([Navigation, Pagination]);

import { I_Residence_display_type } from "@/interfaces/Residences";
import Link from "next/link";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import ResLocationWithoutBreadCrumb from "../General/ResLocationWithoutBreadCrumb";
import BedNMaxCapacityCode from "../General/BedNMaxCapacityCode";
import dynamic from "next/dynamic";
import EachNightPriceFromWithDiscount from "../General/EachNightPriceFrom";
const FastReserveBox = dynamic(() => import("components/General/FastReserveBox"), {
  ssr: true,
});

interface I_FavouriteCart {
  onShareBtnClick: () => void;
  name: string;
  provice: string;
  proviceId: number;
  cityId: number;
  city: string;
  neighborhood: string;
  rating: number;
  commentsN: number;
  price: number;
  bedN: number;
  referenceCode: string;
  maxCapacity: number;
  images: string[]; // ex: "https://cdn.lidomatrip.com/web/image/product.image/46063/image/خانه-اجاره-ای-برای-مسافران-تبریز.jpg"
  residenceId: number;
  isFastEnabled: boolean;
  discountP: number;
  displayType: I_Residence_display_type;
  resPureNameAlone: string;
}

function FavouriteCart({
  onShareBtnClick,
  name,
  provice,
  proviceId,
  cityId,
  city,
  neighborhood,
  rating,
  commentsN,
  price,
  bedN,
  referenceCode,
  maxCapacity,
  images,
  residenceId,
  isFastEnabled,
  discountP,
  displayType,
  resPureNameAlone,
}: I_FavouriteCart) {
  return (
    <>
      <Link prefetch={false} href={getPropertyPageUrl({ residenceId })}>
        <article className="group cursor-pointer">
          <header>
            <div className={`${classes["Air-bnb-like-slider"]} relative`}>
              <Swiper
                // spaceBetween={50}
                slidesPerView={1}
                onSlideChange={() => {
                  // console.log("slide change")
                }}
                onSwiper={(swiper) => {
                  // console.log(swiper)
                }}
                pagination={{
                  dynamicBullets: true,
                  el: ".swiper-pagination",
                  clickable: true,
                  dynamicMainBullets: 1,
                }}
                className="rounded-12"
              >
                {images.map((image, i) => {
                  return (
                    <SwiperSlide key={i}>
                      <div className="relative w-full h-[214px]">
                        <Image
                          src={image}
                          alt={name}
                          fill
                          sizes="100vw"
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
                <div className="swiper-pagination"></div>
              </Swiper>

              <div
                className={`
              absolute top-12 left-12 right-12 flex items-center z-1 justify-between
          `}
              >
                <div className="flex items-center gap-x-8">
                  <div>
                    <Share onShareBtnClick={onShareBtnClick} />
                  </div>
                  <div>
                    <LikeOrNot residenceId={residenceId} isItLiked={true} />
                  </div>
                </div>
              </div>
            </div>
            <ResLocationWithoutBreadCrumb
              city={city}
              className="my-10"
              neighborhood={neighborhood}
              province={provice}
            />
            <h2
              title={name}
              className="text-14 leading-24 text-black font-r OnlyOneLineAndEndWithElipsis group-hover:text-primary-main mb-10"
            >
              {name}
            </h2>
          </header>

          <div>
            <BedNMaxCapacityCode
              rating={rating}
              commentsN={commentsN}
              bedN={bedN}
              // displayType={displayType}
              className="mb-12"
              maxCapacity={maxCapacity}
              // referenceCode={referenceCode}
              // resPureNameAlone={resPureNameAlone}
            />
            {!!isFastEnabled && (
              <div className="mb-12">{!!isFastEnabled && <FastReserveBox />}</div>
            )}
          </div>
          <footer>
            <EachNightPriceFromWithDiscount price={price} discountP={discountP} />
          </footer>
        </article>
      </Link>
    </>
  );
}

export default FavouriteCart;
