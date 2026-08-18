import Image from "next/image";
import { I_Residence_display_type } from "@/interfaces/Residences";
import Link from "next/link";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import ResLocationWithoutBreadCrumb from "../General/ResLocationWithoutBreadCrumb";
import BedNMaxCapacityCode from "../General/BedNMaxCapacityCode";
import EachNightPriceFromWithDiscount from "../General/EachNightPriceFrom";
import dynamic from "next/dynamic";
import ResIsFull from "../Search/ResIsFull";
import LikeOrNot from "../General/LikeOrNot";
const FastReserveBox = dynamic(() => import("components/General/FastReserveBox"), {
  ssr: true,
});
const LastMomentForToday = dynamic(() => import("components/General/LastMomentForToday"), {
  ssr: true,
});

interface I_TypicalResidenceCartForSwippableSlider {
  // onShareBtnClick: () => void;
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
  referenceCode: string | number;
  maxCapacity: number;
  image: string; // ex: "https://cdn.lidomatrip.com/web/image/product.image/46063/image/خانه-اجاره-ای-برای-مسافران-تبریز.jpg"
  residenceId: number;
  isFastEnabled: boolean;
  isFull: boolean;
  discountP: number;
  isLastMomentForToday: boolean;
  displayType: I_Residence_display_type;
  resPureNameAlone: string;
  nowruzPrice?: number;
}

function TypicalResidenceCartForSwippableSlider({
  // onShareBtnClick,
  name,
  provice,
  city,
  proviceId,
  cityId,
  neighborhood,
  rating,
  commentsN,
  price,
  bedN,
  referenceCode,
  maxCapacity,
  image,
  residenceId,
  isFastEnabled,
  isFull,
  discountP,
  isLastMomentForToday,
  displayType,
  resPureNameAlone,
  nowruzPrice,
}: I_TypicalResidenceCartForSwippableSlider) {
  return (
    <Link href={getPropertyPageUrl({ residenceId })} passHref>
      <article className="group cursor-pointer">
        <header>
          <div className="relative h-[280px] md:h-[240px] w-full">
            <Image
              src={image}
              fill
              style={{ objectFit: "cover" }}
              alt={name}
              className="rounded-12"
            />
            {!!isFull && <ResIsFull />}

            <LikeOrNot
              hasBg={false}
              residenceId={residenceId}
              withoutWrapper={true}
              className="absolute top-12 left-12 z-1"
            />
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
          {(!!isFastEnabled || !!isLastMomentForToday) && (
            <div className="flex items-center gap-x-8 mt-12">
              {!!isFastEnabled && <FastReserveBox />}

              {!!isLastMomentForToday && <LastMomentForToday />}
            </div>
          )}
        </div>

        <footer>
          <EachNightPriceFromWithDiscount price={price} discountP={discountP} />
        </footer>
      </article>
    </Link>
  );
}

export default TypicalResidenceCartForSwippableSlider;
