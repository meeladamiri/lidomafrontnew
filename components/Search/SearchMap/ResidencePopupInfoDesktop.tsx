import { I_Residence_display_type } from "@/interfaces/Residences";
import LikeOrNot from "@/components/General/LikeOrNot";
import Share from "@/components/General/Share/Share";
import { IShare } from "@/components/General/Share/ShareBottomSheet";
import { BASE_URL_SITE } from "@/configs/info";
import { getPropertyPageUrl } from "@/utilities/getPropertyPageUrl";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import ResRate from "@/components/General/ResRate";
import ResLocationWithoutBreadCrumb from "@/components/General/ResLocationWithoutBreadCrumb";
import BedNMaxCapacityCode from "@/components/General/BedNMaxCapacityCode";
import dynamic from "next/dynamic";
import EachNightPriceFromWithDiscount from "@/components/General/EachNightPriceFrom";
const LastMomentForToday = dynamic(() => import("@/components/General/LastMomentForToday"), {
  ssr: true,
});
const FastReserveBox = dynamic(() => import("@/components/General/FastReserveBox"), { ssr: true });

interface I_ResidencePopupInfoDesktop {
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
  setShowShareBottomSheet: Dispatch<SetStateAction<IShare>>;
  resPureNameAlone: string;
}

function ResidencePopupInfoDesktop({
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
  setShowShareBottomSheet,
  resPureNameAlone,
}: I_ResidencePopupInfoDesktop) {
  return (
    <>
      <div className="p-12 rounded-20 shadow-[0px_6px_24px_rgba(24,39,58,0.15)] w-[334px]">
        {/* slider */}
        <div className="w-[310px] h-[214px] relative">
          <Link href={getPropertyPageUrl({ residenceId })} passHref prefetch={false}>
            <Image
              src={image}
              fill
              style={{ objectFit: "cover" }}
              alt={name}
              className="rounded-12"
            />
          </Link>

          <div className="absolute top-12 left-12 flex items-center gap-x-8">
            <div>
              <Share
                onShareBtnClick={() => {
                  const propertyPageUrl = `${BASE_URL_SITE}${getPropertyPageUrl({
                    residenceId,
                  })}`;

                  setShowShareBottomSheet({
                    show: true,
                    payload: {
                      textToBeSmsed: propertyPageUrl,
                      link: propertyPageUrl,
                      whatsAppText: propertyPageUrl,
                      telegramText: propertyPageUrl,
                      twitter: {
                        url_to_go: propertyPageUrl,
                        text_of_tweet: name,
                        via: "",
                      },
                    },
                  });
                }}
              />
            </div>
            <div>
              <LikeOrNot residenceId={residenceId} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between mb-8">
            <Link
              href={getPropertyPageUrl({ residenceId })}
              passHref
              prefetch={false}
              className="text-14 leading-24 font-r !text-black OnlyOneLineAndEndWithElipsis block"
            >
              {name}
            </Link>

            <ResRate average_rating={average_rating} reviews_count={reviews_count} />
          </div>

          <ResLocationWithoutBreadCrumb
            city={city}
            province={province}
            neighborhood={neighborhood}
            className="mb-8"
          />

          <BedNMaxCapacityCode
            bedN={bedN}
            // displayType={displayType}
            className="!mb-8 text-right"
            maxCapacity={maxCapacity}
            // referenceCode={referenceCode}
            // resPureNameAlone={resPureNameAlone}
          />

          <EachNightPriceFromWithDiscount price={price} discountP={discountP} />

          <div className="flex items-center gap-x-8 mt-12">
            {!!isFastEnabled && <FastReserveBox />}

            {!!isLastMomentForToday && <LastMomentForToday />}
          </div>
        </div>
      </div>
    </>
  );
}

export default ResidencePopupInfoDesktop;
