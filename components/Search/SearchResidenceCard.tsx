import LikeOrNot from "components/General/LikeOrNot";
import Link from "next/link";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";

import { I_Residence_display_type } from "@/interfaces/Residences";
import BedNMaxCapacityCode from "../General/BedNMaxCapacityCode";
import ResLocationWithoutBreadCrumb from "../General/ResLocationWithoutBreadCrumb";
import dynamic from "next/dynamic";
import EachNightPriceFromWithDiscount, { StayQuote } from "../General/EachNightPriceFrom";
const LastMomentForToday = dynamic(() => import("components/General/LastMomentForToday"), {
  ssr: true,
});
const FastReserveBox = dynamic(() => import("components/General/FastReserveBox"), {
  ssr: true,
});
const ResIsFull = dynamic(() => import("./ResIsFull"), {
  ssr: true,
});
const StayPriceBreakdown = dynamic(() => import("./StayPriceBreakdown"), {
  ssr: true,
});
import SearchCardGallery from "./SearchCardGallery";
import { useRouter } from "next/router";

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
  /** Cards in the first row opt out of lazy loading — see SearchCardGallery. */
  priority?: boolean;
  /** Price for the dates the reader selected, when they selected any. */
  stay?: StayQuote | null;
  resPureNameAlone: string;
  isFull: boolean;
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
  priority,
  stay,
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
          <div className="relative h-[280px] md:h-[240px] w-full">
            <SearchCardGallery
              images={[mainImage, ...(images || [])]}
              name={name}
              priority={priority}
              isOffscreen={isOffscreen}
            />

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
            className="product-card text-14 leading-24 text-black font-r OnlyOneLineAndEndWithElipsis group-hover:text-primary-main mb-10"
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
            stay={stay}
          />
        </footer>

        {/*
          One condition, not three. The old gate also required
          `displayType === "suit"`, which meant a بوم‌گردی listing with the
          same dates picked never got a total at all — not because its price
          is computed differently (it is not; `stay` comes from the same
          `calculateStayPrice` regardless of type) but because nobody had
          reason to notice the gap. `stay` is already null whenever there is
          no date range or the quote could not be priced, so it is the one
          condition that means what it says.
        */}
        {!!stay && <StayPriceBreakdown stay={stay} />}
      </article>
    </Link>
  );
}

export default SearchResidenceCard;
