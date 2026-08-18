import Share from "components/General/Share/Share";
import Image from "next/image";
import { useRouter } from "next/router";
import classes from "styles/Air-bnb-like-slider.module.css";
import { useState } from "react";
import { IShare } from "../../General/Share/ShareBottomSheet";
import LikeOrNot from "../../General/LikeOrNot";

import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
SwiperCore.use([Navigation, Pagination]);

import dynamic from "next/dynamic";
import { THandleSmoothClose } from "@/components/General/core/BottomSheet";
import { BASE_URL_SITE } from "@/configs/info";
import { T_image } from "@/interfaces/observe_residence";
import all_blur_hashes_data from "@/constants/all_blur_hashes";
import ResPageDynamicHeaderInMobile from "./ResPageDynamicHeaderInMobile";
const BottomSheet = dynamic(() => import("@/components/General/core/BottomSheet"), {
  ssr: true,
});
const ShareBottomSheet = dynamic(() => import("@/components/General/Share/ShareBottomSheet"), {
  ssr: true,
});
const CustomLightbox = dynamic(() => import("@/components/General/CustomLightbox/CustomLightbox"), {
  ssr: true,
});

const shareInitialValues: IShare = {
  show: false,
  payload: {
    textToBeSmsed: "",
    link: "",
    whatsAppText: "",
    telegramText: "",
    twitter: {
      url_to_go: "",
      text_of_tweet: "",
      via: "",
    },
  },
};

function ResidenceImagesInMobile({ images, name }: { images: T_image[]; name: string }) {
  const router = useRouter();
  const [showShareBottomSheet, setShowShareBottomSheet] = useState<IShare>(shareInitialValues);
  const [showLightbox, setShowLightbox] = useState<boolean>(false);

  return (
    <>
      <div
        className={`${classes["Air-bnb-like-slider"]} relative`}
        onClick={() => setShowLightbox(true)}
      >
        <Swiper
          slidesPerView={1}
          pagination={{
            dynamicBullets: true,
            el: ".swiper-pagination",
            clickable: true,
            dynamicMainBullets: 1,
          }}
          className="h-[280px]"
        >
          {images?.map((img, i) => {
            return (
              <SwiperSlide key={i}>
                <Image
                  src={img.url}
                  alt={name}
                  fill
                  priority={i === 0}
                  style={{
                    objectFit: "cover",
                  }}
                  placeholder="blur"
                  blurDataURL={
                    all_blur_hashes_data[Math.floor(Math.random() * all_blur_hashes_data.length)]
                  }
                />
              </SwiperSlide>
            );
          })}
          <div className="swiper-pagination"></div>
        </Swiper>

        <div className="absolute top-16 right-20 left-20 flex items-start justify-between z-1">
          <div
            className="w-40 h-40 rounded-full bg-white flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();

              router.back();
            }}
          >
            <i className="icon-Back text-24 text-black" />
          </div>

          <div className="flex items-center gap-x-8">
            <Share
              onShareBtnClick={() => {
                const resName = router?.query?.id as string;
                const asPath = router?.asPath;
                const propertyPageUrl = `${BASE_URL_SITE}${asPath}`;

                setShowShareBottomSheet({
                  show: true,
                  payload: {
                    textToBeSmsed: propertyPageUrl,
                    link: propertyPageUrl,
                    whatsAppText: propertyPageUrl,
                    telegramText: propertyPageUrl,
                    twitter: {
                      url_to_go: propertyPageUrl,
                      text_of_tweet: resName,
                      via: "",
                    },
                  },
                });
              }}
            />

            <LikeOrNot residenceId={Number(router?.query?.id)} />
          </div>
        </div>

        <div className="px-12 py-6 border-1 border-solid border-gray-CACFD3 rounded-8 bg-white absolute bottom-16 left-20 z-1 text-14 leading-20 font-m text-black">
          مشاهده تصاویر
        </div>
      </div>

      <ResPageDynamicHeaderInMobile setShowShareBottomSheet={setShowShareBottomSheet} />

      {!!showShareBottomSheet.show && (
        <BottomSheet
          open={!!showShareBottomSheet.show}
          handleClose={() => setShowShareBottomSheet(shareInitialValues)}
          headerTitle="اشتراک گذاری"
          body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
            return (
              <ShareBottomSheet
                handleSmoothClose={handleSmoothClose}
                whatIsBeingShared="اقامتگاه"
                payload={showShareBottomSheet.payload}
              />
            );
          }}
        />
      )}

      {!!showLightbox && (
        <CustomLightbox
          isOpen={showLightbox}
          onClose={() => setShowLightbox(false)}
          images={images}
        />
      )}
    </>
  );
}

export default ResidenceImagesInMobile;
