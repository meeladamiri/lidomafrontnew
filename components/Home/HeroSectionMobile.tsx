// Import Swiper React components
// import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination } from "swiper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// install Swiper modules
SwiperCore.use([Navigation, Pagination]);

import Image from "next/image";
import { IHomePageData } from "@/api/Home";
import { useState } from "react";
import WhereYouWannaGoSearchBox from "../Search/WhereYouWannaGoSearchBox";
import WhereYouWannaGoModals from "../Search/WhereYouWannaGoSearchBox/WhereYouWannaGoModals";

function HeroSectionMobile({
  mobileHeroSectionItems,
  title,
  tagline,
}: {
  mobileHeroSectionItems: IHomePageData["slides"];
  title?: string | null;
  tagline?: string | null;
}) {
  const [showWhereYouWannaGoModal, setShowWhereYouWannaGoModal] = useState<boolean>(false);
  const [showCitiesListModal, setShowCitiesListModal] = useState<boolean>(false);

  return (
    <div className="relative">
      <Image
        src={"/assets/home/home-mobile.webp"}
        // `alt` was the file path — the mobile LCP image announced itself to
        // crawlers and screen readers as "/assets/home/home-mobile.webp".
        alt="اجاره ویلا، سوئیت و اقامتگاه بوم‌گردی در سراسر ایران"
        className="rounded-16"
        width={460}
        height={504}
        // Was `unoptimized`, which shipped the full 80KB original to every
        // phone. Through the optimizer a 390px-wide screen gets a ~20KB
        // rendition instead.
        sizes="(max-width: 480px) 100vw, 460px"
        style={{
          objectFit: "contain",
        }}
        priority
      />
      <div className="absolute bottom-12 right-16">
        <p className="text-15 text-white leading-30 font-r">{tagline || "هر جا بری باهاتیم ..."}</p>
        {/* Visual heading only — see HeroSection for the real H1. */}
        <p className="text-19 text-white leading-30 font-r">{title}</p>
      </div>
      <div className="absolute top-[16px] w-full">
        <div className="relative w-full">
          <div className="w-[90%] absolute left-1/2 transform -translate-x-1/2">
            <WhereYouWannaGoSearchBox setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal} />
          </div>
        </div>
      </div>
      <div className="absolute w-full left-1/2 transform -translate-x-1/2"></div>
      <WhereYouWannaGoModals
        setShowCitiesListModal={setShowCitiesListModal}
        setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal}
        showCitiesListModal={showCitiesListModal}
        showWhereYouWannaGoModal={showWhereYouWannaGoModal}
      />
    </div>
  );
}
export default HeroSectionMobile;

