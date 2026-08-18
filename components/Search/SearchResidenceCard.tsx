import classes from "styles/Air-bnb-like-slider.module.css";
import LikeOrNot from "components/General/LikeOrNot";
import Link from "next/link";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import moment from "moment-jalaali";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/virtual";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination, Virtual } from "swiper";
// install Swiper modules
SwiperCore.use([Navigation, Pagination]);

import { I_Residence_display_type } from "@/interfaces/Residences";
import BedNMaxCapacityCode from "../General/BedNMaxCapacityCode";
import ResLocationWithoutBreadCrumb from "../General/ResLocationWithoutBreadCrumb";
import dynamic from "next/dynamic";
import EachNightPriceFromWithDiscount from "../General/EachNightPriceFrom";
const LastMomentForToday = dynamic(() => import("components/General/LastMomentForToday"), {
  ssr: true,
});
const FastReserveBox = dynamic(() => import("components/General/FastReserveBox"), {
  ssr: true,
});
const ResIsFull = dynamic(() => import("./ResIsFull"), {
  ssr: true,
});
const FinalCheckoutTotal = dynamic(() => import("./FinalCheckoutTotal"), {
  ssr: true,
});
import ResBlurImage from "./ResBlurImage";
import { useRouter } from "next/router";
import { IPrices } from "@/interfaces/Search/SearchResp";

interface I_SearchResidenceCard {
  name: string;
  provice: string;
  proviceId: number;
  cityId: number;
  city: string;
  displayType: I_Residence_display_type;
  neighborhood: string;
  rating: number;
  commentsN: number;
  price: number;
  nowruzPrice: number;
  prices: IPrices;
  bedN: number;
  referenceCode: number;
  maxCapacity: number;
  images: string[];
  mainImage: string;
  residenceId: number;
  isFastEnabled: boolean;
  discountP: number;
  isLastMomentForToday: boolean;
  isOffscreen: boolean;
  resPureNameAlone: string;
  isFull: boolean;
  capacity: number;
  peak_dates: [
    string, // start of range --> ex:
    string // end of range
  ][];
}

function SearchResidenceCard({
  name,
  provice,
  city,
  neighborhood,
  rating,
  commentsN,
  price,
  nowruzPrice,
  prices,
  bedN,
  referenceCode,
  maxCapacity,
  images,
  mainImage,
  residenceId,
  isFastEnabled,
  discountP,
  isLastMomentForToday,
  proviceId,
  cityId,
  displayType,
  isOffscreen,
  resPureNameAlone,
  isFull,
  capacity,
  peak_dates,
}: I_SearchResidenceCard) {
  const router = useRouter();

  const _href = getPropertyPageUrl({
    residenceId: residenceId,
    startDate: router?.query?.start as string,
    endDate: router?.query?.end as string,
    guestsCount: router?.query?.guests_count as string,
  });

  return (
    <Link target="_blank" prefetch={false} href={_href}>
      <article className="group cursor-pointer">
        <header>
          <div
            className={`relative ${classes["Air-bnb-like-slider"]} h-[280px] md:h-[240px] w-full Make_swiper_slide_width_full`}
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
              className="rounded-12"
            >
              {[mainImage, ...images]?.map((img, i) => {
                return (
                  <SwiperSlide
                    key={i}
                    virtualIndex={i}
                    className="relative w-full !h-[280px] md:!h-[240px]"
                  >
                    <ResBlurImage img={img} name={name} isOffscreen={isOffscreen} i={i} />
                  </SwiperSlide>
                );
              })}
              <div className="swiper-pagination"></div>
            </Swiper>

            {!!isFull && <ResIsFull />}

            <LikeOrNot
              hasBg={false}
              residenceId={residenceId}
              withoutWrapper={true}
              className="absolute top-12 left-12 z-1"
            />
          </div>

          {/* <div className="flex items-center justify-between mb-12 gap-x-4 mt-12"> */}

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
          {/* </div> */}
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

          {(!!isFastEnabled || !!isLastMomentForToday) && (
            <div className="flex items-center gap-x-8 mb-12">
              {!!isFastEnabled && <FastReserveBox />}

              {!!isLastMomentForToday && <LastMomentForToday />}
            </div>
          )}
        </div>

        <footer>
          <EachNightPriceFromWithDiscount
            nowruzPrice={nowruzPrice}
            price={price}
            discountP={discountP}
          />
        </footer>

        {!!router?.query?.start &&
          !!router?.query?.end &&
          // router?.query?.guests_count &&
          displayType === "suit" && (
            <FinalCheckoutTotal
              calculatedCheckoutDataParams={{
                serverCalendarData: {
                  peak_dates,
                  prices: {
                    extra_guests_price: prices?.extra_guests_price,
                    monthly_discount: prices?.monthly_discount,
                    peak_price: prices?.peak_price,
                    week_price: prices?.week_price,
                    weekend_price: prices?.weekend_price,
                    weekly_discount: prices?.weekly_discount,
                  },
                  special_dates: prices?.special_dates,
                },
                theRangeSelected: [
                  moment(router?.query?.start, "jYYYY/jMM/jDD"),
                  moment(router?.query?.end, "jYYYY/jMM/jDD"),
                ],
                numberOfPeople: !!router?.query?.guests_count
                  ? Number(router?.query?.guests_count)
                  : capacity,
                baseCapacity: capacity,
                extraGuestUnitPrice: prices?.extra_guests_price,
                discountedDays: prices?.discounted_days.map((day) => ({
                  ...day,
                  date: moment(day.date),
                })),
              }}
              basePrice={price}
            />
          )}
      </article>
    </Link>
  );
}

export default SearchResidenceCard;
