import { I_Residence_display_type } from "@/interfaces/Residences";
import LikeOrNot from "@/components/General/LikeOrNot";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import Image from "next/image";
import Link from "next/link";
import classes from "styles/line-clamps.module.css";
import ResRate from "@/components/General/ResRate";
import dynamic from "next/dynamic";
const FastReserveBox = dynamic(() => import("@/components/General/FastReserveBox"), { ssr: true });
const LastMomentForToday = dynamic(() => import("@/components/General/LastMomentForToday"), {
  ssr: true,
});
const PercentBox = dynamic(() => import("@/components/General/PercentBox"), {
  ssr: true,
});

interface I_ResidencePopupInfoMobile {
  average_rating: number;
  reviews_count: number;
  name: string;
  province: string;
  city: string;
  neighborhood?: string;
  bedN: number;
  maxCapacity: number;
  referenceCode: number;
  discountP?: number;
  price: number;
  isFastEnabled: boolean;
  isLastMomentForToday: boolean;
  image: string;
  residenceId: number;
  displayType: I_Residence_display_type;
  //   setShowShareBottomSheet: Dispatch<SetStateAction<IShare>>;
}

function ResidencePopupInfoMobile({
  average_rating,
  reviews_count,
  name,
  province,
  city,
  neighborhood,
  bedN,
  maxCapacity,
  referenceCode,
  discountP,
  price,
  isFastEnabled,
  isLastMomentForToday,
  image,
  residenceId,
  displayType,
}: I_ResidencePopupInfoMobile) {
  return (
    <div className="fixed bottom-84 right-20 left-20 z-[3]">
      <div className="bg-white p-8 rounded-12 shadow-[0px_4px_16px_rgba(24,39,58,0.1)] flex items-start gap-x-12">
        <div className="w-[107px] h-[120px] relative shrink-0">
          <Link href={getPropertyPageUrl({ residenceId })} passHref prefetch={false}>
            <Image
              src={image}
              fill
              style={{ objectFit: "cover" }}
              alt={name}
              className="rounded-6"
            />
          </Link>
        </div>

        <div className="grow">
          <div className="flex items-center justify-between mb-4">
            <ResRate average_rating={average_rating} reviews_count={reviews_count} />

            <LikeOrNot residenceId={residenceId} />
          </div>

          <Link
            href={getPropertyPageUrl({ residenceId })}
            passHref
            prefetch={false}
            className={`text-14 leading-24 font-r !text-black ${classes["line-clamp-1"]} block mb-4`}
          >
            {name}
          </Link>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-4">
              <p className="text-10 leading-17 text-black font-l">هر شب از:</p>

              <p className="text-12 leading-21 text-black font-m">
                {(!!discountP ? price - price * (discountP / 100) : price)?.toLocaleString("en-US")}{" "}
                تومان
              </p>
            </div>

            {!!discountP && (
              <div className="mr-8">
                <PercentBox value={discountP} />
              </div>
            )}
          </div>

          <div className="flex items-center gap-x-8 mt-8">
            {!!isFastEnabled && <FastReserveBox withoutText />}

            {!!isLastMomentForToday && <LastMomentForToday />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResidencePopupInfoMobile;
