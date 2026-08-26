import HeroSection from "./HeroSection";
// import MainCategoriesOfResidences from "./MainCategoriesOfResidences";
import { useQuery } from "@tanstack/react-query";
import { getHomePageData, IHomePageData } from "@/api/Home";
// import HomePageSpecialSliderSkeleton from "../General/Sliders/HomePageSpecialSlider/HomePageSpecialSliderSkeleton";
// import ReadyToBeDeliveredTonightRightSection from "./ReadyToBeDeliveredTonight-RightSection";
import dynamic from "next/dynamic";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import Image from "next/image";
import Link from "next/link";
import mayketBlack from "../../public/assets/home/MykeyButtonBlack.svg";
import bazaarBlack from "../../public/assets/home/BazaarButtonBlack.svg";
import downloadApp from "../../public/assets/home/DownloadApp.png";
import Footer from "@/layouts/Footer";
import HomePageBannerSkeleton from "./Skeletons/HomePageBannerSkeleton";
import ManuallySwippableSliderComp from "./ManuallySwippableSliderComp";

const WhereYouWannaGo = dynamic(() => import("./WhereYouWannaGo"), {
  ssr: true,
});
const HomePageBannerComp = dynamic(() => import("./HomePageBannerComp"), {
  ssr: true,
});
const AwayFromCitiesStress = dynamic(() => import("./AwayFromCitiesStress"), {
  ssr: true,
});
const TripGuideArticlesComp = dynamic(() => import("./TripGuideArticlesComp"), {
  ssr: true,
});
const PopularDestsComp = dynamic(() => import("./PopularDestsComp"), {
  ssr: true,
});
const SeasonalRecommendationsComp = dynamic(() => import("./SeasonalRecommendationsComp"), {
  ssr: true,
});
const LidomaFeatures = dynamic(() => import("./LidomaFeatures"), {
  ssr: true,
});

const HomePageFAQs = dynamic(() => import("./HomePageFAQs"), {
  ssr: true,
});
const ContinuedText = dynamic(() => import("./ContinuedText"), {
  ssr: true,
});
// const SpecialSliderCart = dynamic(
//   () => import("../General/Sliders/HomePageSpecialSlider/SpecialSliderCart"),
//   {
//     ssr: true,
//   }
// );
// const HomePageSpecialSlider = dynamic(
//   () => import("components/General/Sliders/HomePageSpecialSlider"),
//   {
//     ssr: true,
//   }
// );
// const Footer = dynamic(() => import("@/layouts/Footer"), {
//   ssr: true,
// });

function Home() {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const isMobile: boolean = useMediaQuery("(max-width: 480px)");

  // The bundle is fixed for the life of the statically generated page, so the
  // hydrated copy is never stale. Without this the global 5-minute staleTime
  // made every visitor who landed on a page older than that refetch the whole
  // bundle on mount, for data identical to what the HTML already carried.
  const { data, isLoading } = useQuery(["getHomePageData"], () => getHomePageData(), {
    staleTime: Infinity,
  });

  // The two city rails used to call getCustomSliders with Odoo category ids
  // (1079 / 164). That endpoint does not exist on the new backend, so both
  // rails silently rendered empty. They come from the page bundle now.
  const params = data?.params as any;
  const shomalSlidersIsLoading = isLoading;
  const tehranSlidersIsLoading = isLoading;

  return (
    <div className="pt-[56px] md:pt-0">
      <div className="md:hidden">{!isDesktop && <WhereYouWannaGo />}</div>

      <section className="mb-24 md:mb-48">
        <HeroSection
          mobileHeroSectionItems={(data?.params as IHomePageData)?.slides}
          title={(data?.params as any)?.hero?.title}
          titleMobile={(data?.params as any)?.hero?.title_mobile}
          tagline={(data?.params as any)?.hero?.subtitle}
          taglineMobile={(data?.params as any)?.hero?.subtitle_mobile}
        />
      </section>

      {/* <section className="CustomContainer mb-24 md:mb-42">
        <MainCategoriesOfResidences />
      </section>
 */}
      <PopularDestsComp />

      {isLoading ? (
        <section className="mb-24 md:mb-40 CustomContainer">
          <HomePageBannerSkeleton />
        </section>
      ) : (
        // <LazyLoad height={270} once offset={100}>
        <section className="mb-24 md:mb-40 CustomContainer">
          <HomePageBannerComp
            loaderCondition={isLoading}
            link={(data?.params as IHomePageData)?.banners?.[3]?.link}
            mobile_image={(data?.params as IHomePageData)?.banners?.[3]?.mobile_image}
            pc_image={(data?.params as IHomePageData)?.banners?.[3]?.pc_image}
          />
        </section>
        // </LazyLoad>
      )}

      <section className="mb-24 md:mb-40 CustomContainer">
        {/* <LazyLoad height={86} once offset={100}> */}
        <LidomaFeatures />
        {/* </LazyLoad> */}
      </section>

      <ManuallySwippableSliderComp
        title="ویلاهای شمال"
        loaderCondition={shomalSlidersIsLoading}
        data_list={params?.shomal_reses || []}
        linkTo="/search/shomal?villa=1"
      />

      {/* <LazyLoad height={204} once offset={100}> */}
      <SeasonalRecommendationsComp
        loaderCondition={isLoading}
        suggestsList={(data?.params as IHomePageData)?.suggests || []}
      />
      {/* </LazyLoad> */}

      <ManuallySwippableSliderComp
        title="اقامتگاه های تهران"
        loaderCondition={tehranSlidersIsLoading}
        data_list={params?.tehran_reses || []}
        linkTo="/search/tehran"
      />
      <section className="mb-24 md:mb-40 ContainerForSliders">
        {/* <LazyLoad height={270} once offset={100}> */}
        <AwayFromCitiesStress />
        {/* </LazyLoad> */}
      </section>

      {/* <LazyLoad height={419} once offset={100}> */}
      {/* <HomePageSpecialSliderComp
        loaderCondition={isLoading}
        data_list={(data?.params as IHomePageData)?.last_time_offers || []}
        rightSectionComp={
          <LastMomentRecommendationsRightSection
            last_time_offers_arr={(data?.params as IHomePageData)?.last_time_offers || []}
          />
        }
        bgClassname="bg-red-main"
        seeAllResesLink={`/search/city/اقامتگاه-ها-1?tonight=true&discounted=true&fast=true`}
      /> */}
      {/* </LazyLoad> */}

      {/* <LazyLoad height={294} once offset={100}> */}
      {/* <PopularDestsComp
        loaderCondition={isLoading}
        popularsList={(data?.params as IHomePageData)?.populars || []}
      /> */}
      {/* </LazyLoad> */}

      {/* <LazyLoad height={304} once offset={100}>
        <HomePageBannerComp
          loaderCondition={isLoading}
          link={(data?.params as IHomePageData)?.banners?.[0]?.link}
          mobile_image={(data?.params as IHomePageData)?.banners?.[0]?.mobile_image}
          pc_image={(data?.params as IHomePageData)?.banners?.[0]?.pc_image}
        />
      </LazyLoad>
 */}
      {/* <LazyLoad height={314} once offset={100}> */}
      {/* AccordingToYourTasteComp was removed from the tree; the bundle still
          serves `your_taste` for whenever it comes back. */}
      {/* </LazyLoad> */}
      {/* <LazyLoad height={304} once offset={100}> */}
      <section className="mb-24 md:mb-40 CustomContainer h-[500px]">
        <div
          data-loaded="false"
          onLoad={(event) => {
            event.currentTarget.setAttribute("data-loaded", "true");
          }}
          className={`data-[loaded=false]:animate-pulse data-[loaded=false]:bg-gray-100/90 rounded-[23px] overflow-hidden bg-[url("/assets/home/DownloadAppBg.jpg")] bg-cover bg-no-repeat bg-right md:bg-center w-full flex pt-40 md:pt-24 sm:pt-40 px-40 ${
            isMobile ? "flex-col" : "flex-row"
          } items-center justify-center`}
        >
          <div
            className={`flex-[1_1_50%] flex flex-col items-center justify-center ${
              isMobile ? "pb-22" : "pb-0"
            }`}
          >
            <p
              className={`text-black ${isMobile ? "text-30" : "text-[60px]"} font-[YekanBakhBlack]`}
            >
              اپلیکیشن لیدوما
            </p>
            <p
              className={`text-black ${
                isMobile ? "text-14 my-10" : "text-[23px] my-18"
              } font-[YekanBakhRegular]`}
            >
              دریافت از مارکت های رسمی دانلود اپلیکیشن
            </p>
            <div className="flex items-center gap-x-18">
              <Link
                rel="nofollow"
                target="_blank"
                prefetch={false}
                passHref
                href={"https://myket.ir/app/app.lidomatrip.com"}
              >
                <Image
                  src={mayketBlack}
                  width={isDesktop ? 148 : 128}
                  height={isDesktop ? 50 : 44}
                  alt="دانلود از مایکت"
                  className="rounded-4 cursor-pointer"
                />
              </Link>
              <Link
                rel="nofollow"
                target="_blank"
                prefetch={false}
                passHref
                href={"https://cafebazaar.ir/app/app.lidomatrip.com"}
              >
                <Image
                  src={bazaarBlack}
                  width={isDesktop ? 148 : 128}
                  height={isDesktop ? 50 : 44}
                  alt="دانلود از بازار"
                  className="rounded-4 cursor-pointer"
                />
              </Link>
            </div>
          </div>
          <div className="flex-[1_1_50%] box-border">
            <Image
              height={isMobile ? 400 : 431}
              width={isMobile ? 300 : 529}
              src={downloadApp}
              style={{ objectFit: "contain" }}
              alt={"downloadApp"}
              placeholder="blur"
            />
          </div>
        </div>
      </section>
      {/* </LazyLoad> */}

      {/* <LazyLoad height={436} once offset={100}> */}
      <ManuallySwippableSliderComp
        loaderCondition={isLoading}
        data_list={params?.boomgardi_reses || []}
        title={(data?.params as any)?.sections?.boomgardi?.title || "اقامتگاه های بوم گردی"}
        linkTo="/search?boomgardi=1"
      />
      {/* </LazyLoad> */}

      {/* <LazyLoad height={304} once offset={100}>
        <HomePageBannerComp
          loaderCondition={isLoading}
          link={(data?.params as IHomePageData)?.banners?.[2]?.link}
          mobile_image={(data?.params as IHomePageData)?.banners?.[2]?.mobile_image}
          pc_image={(data?.params as IHomePageData)?.banners?.[2]?.pc_image}
        />
      </LazyLoad> */}

      {/* <LazyLoad height={419} once offset={100}> */}
      {/* <HomePageSpecialSliderComp
        loaderCondition={isLoading}
        data_list={(data?.params as IHomePageData)?.discounted_reses || []}
        rightSectionComp={<SpecialDiscountsRightSection />}
        styles={{
          background: "linear-gradient(117.55deg, #FF00A8 -0.33%, #FF0000 100.19%)",
        }}
        seeAllResesLink={`/search/city/اقامتگاه-ها-1?discounted=true`}
      /> */}
      {/* </LazyLoad> */}

      {/* SEO: this is the page's main descriptive copy and carries an <h2>.
          It used to sit inside <LazyLoad>, which renders an empty 200px
          placeholder on the server — the text was in __NEXT_DATA__ but never in
          the HTML a crawler reads. `defer-render` gets the same "skip the work
          until it is near the viewport" benefit while keeping the markup. */}
      <section className="mb-24 md:mb-40 CustomContainer defer-render">
        <ContinuedText
          videoUrl={
            <iframe
              className="w-full h-full rounded-12"
              src="https://www.aparat.com/video/video/embed/videohash/lCSq8/vt/frame"
              allowFullScreen
              loading="lazy"
              // webkitallowfullscreen
              // mozallowfullscreen="true"
            ></iframe>
          }
          // image="/assets/tmp/res-0.webp"
          title={(data?.params as IHomePageData)?.desc_boxes?.[0]?.title}
          desc={(data?.params as IHomePageData)?.desc_boxes?.[0]?.content}
        />
      </section>

      <section className="mb-24 md:mb-40 CustomContainer defer-render">
        <ContinuedText
          isReverse
          videoUrl={
            <iframe
              className="w-full h-full rounded-12"
              src="https://www.aparat.com/video/video/embed/videohash/73Nt6/vt/frame"
              allowFullScreen
              loading="lazy"
              // webkitallowfullscreen
              // mozallowfullscreen="true"
            ></iframe>
          }
          // image="/assets/tmp/res-1.webp"
          title={(data?.params as IHomePageData)?.desc_boxes?.[1]?.title}
          desc={(data?.params as IHomePageData)?.desc_boxes?.[1]?.content}
        />
      </section>

      {/* <LazyLoad height={150} once offset={100}> */}
      {!!(data?.params as IHomePageData)?.faqs?.length && (
        <HomePageFAQs faqs={(data?.params as IHomePageData)?.faqs} />
      )}
      {/* </LazyLoad> */}

      {/* <LazyLoad height={288} once offset={100}> */}
      <TripGuideArticlesComp
        loaderCondition={isLoading}
        articlesList={(data?.params as IHomePageData)?.articles || []}
      />
      {/* </LazyLoad> */}

      {/* <LazyLoad height={637} once offset={100}> */}
      <Footer />
      {/* </LazyLoad> */}
    </div>
  );
}
export default Home;
