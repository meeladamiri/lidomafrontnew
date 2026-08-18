import { I_Residence_display_type } from "@/interfaces/Residences";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import Image from "next/image";
import Link from "next/link";
import ResLocationWithoutBreadCrumb from "../../ResLocationWithoutBreadCrumb";
import ResRate from "../../ResRate";
import BedNMaxCapacityCode from "../../BedNMaxCapacityCode";
import dynamic from "next/dynamic";
const PercentBox = dynamic(() => import("../../PercentBox"), {
  ssr: true,
});
const LastMomentForToday = dynamic(() => import("../../LastMomentForToday"), {
  ssr: true,
});
const FastReserveBox = dynamic(() => import("../../FastReserveBox"), {
  ssr: true,
});

interface ISpecialSliderCart {
  rating: number;
  commentsN: number;
  name: string;
  provice: string;
  proviceId: number;
  cityId: number;
  city: string;
  neighborhood: string;
  bedN: number;
  max_capacity: number;
  reference: string | number;
  min_price: number;
  discountP?: number;
  isFastEnabled: boolean;
  lastMomentForToday: boolean;
  image: string;
  resId: number;
  displayType: I_Residence_display_type;
  resPureNameAlone: string;
}

function SpecialSliderCart({
  rating,
  commentsN,
  name,
  provice,
  proviceId,
  cityId,
  city,
  neighborhood,
  bedN,
  max_capacity,
  reference,
  min_price,
  discountP,
  isFastEnabled,
  lastMomentForToday,
  image,
  resId,
  displayType,
  resPureNameAlone,
}: ISpecialSliderCart) {
  return (
    <article className="p-2 rounded-12 bg-white w-full h-full">
      <header>
        <Link
          passHref
          prefetch={false}
          href={getPropertyPageUrl({ residenceId: resId })}
          className="relative w-full h-[160px] mb-8 block"
        >
          <Image
            src={image}
            fill
            style={{ objectFit: "cover" }}
            alt={name}
            className="rounded-tr-12 rounded-tl-12"
          />
        </Link>
        <div className="px-12">
          <ResRate
            average_rating={rating}
            reviews_count={commentsN}
            className="mb-8 h-24"
            hideWhenAllAreZero={false}
          />

          <Link
            passHref
            prefetch={false}
            href={getPropertyPageUrl({ residenceId: resId })}
            className="text-14 leading-24 text-black font-r OnlyOneLineAndEndWithElipsis mb-4 block"
          >
            {name}
          </Link>
        </div>
      </header>

      <div className="px-12">
        <ResLocationWithoutBreadCrumb
          city={city}
          className="mb-4"
          neighborhood={neighborhood}
          province={provice}
        />

        <BedNMaxCapacityCode
          bedN={bedN}
          // displayType={displayType}
          className="mb-4"
          maxCapacity={max_capacity}
          // referenceCode={reference}
          // resPureNameAlone={resPureNameAlone}
        />
      </div>

      <footer className="px-12">
        <div className="flex items-center">
          <p className="text-12 leading-21 text-black font-l mr-4">هر شب از :</p>

          <p className="text-12 leading-21 text-black font-l">
            {min_price?.toLocaleString()} تومان
          </p>

          {!!discountP && (
            <div className="mr-12">
              <PercentBox value={discountP} />
            </div>
          )}
        </div>
      </footer>

      <div className="px-12 pb-12">
        {(!!isFastEnabled || !!lastMomentForToday) && (
          <div className="mt-8 flex items-center gap-x-8">
            {!!isFastEnabled && <FastReserveBox />}

            {!!lastMomentForToday && <LastMomentForToday />}
          </div>
        )}
      </div>
    </article>
  );
}

export default SpecialSliderCart;
