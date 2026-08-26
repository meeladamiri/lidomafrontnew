import HeroSection from "./HeroSection";
import { useQuery } from "@tanstack/react-query";
import { getHomePageData, IHomePageData } from "@/api/Home";
import dynamic from "next/dynamic";
import { useMediaQuery } from "@/utilities/useMediaQuery";
import { toEmbedUrl } from "@/utilities/videoEmbed";
import Image from "next/image";
import Link from "next/link";
import mayketBlack from "../../public/assets/home/MykeyButtonBlack.svg";
import bazaarBlack from "../../public/assets/home/BazaarButtonBlack.svg";
import downloadApp from "../../public/assets/home/DownloadApp.png";
import Footer from "@/layouts/Footer";
import HomePageBannerSkeleton from "./Skeletons/HomePageBannerSkeleton";

const WhereYouWannaGo = dynamic(() => import("./WhereYouWannaGo"), { ssr: true });
const ResidenceTypes = dynamic(() => import("./ResidenceTypes"), { ssr: true });
const HomeRails = dynamic(() => import("./HomeRails"), { ssr: true });
const HomePageBannerComp = dynamic(() => import("./HomePageBannerComp"), { ssr: true });
const AwayFromCitiesStress = dynamic(() => import("./AwayFromCitiesStress"), { ssr: true });
const TripGuideArticlesComp = dynamic(() => import("./TripGuideArticlesComp"), { ssr: true });
const PopularDestsComp = dynamic(() => import("./PopularDestsComp"), { ssr: true });
const SeasonalRecommendationsComp = dynamic(() => import("./SeasonalRecommendationsComp"), {
  ssr: true,
});
const LidomaFeatures = dynamic(() => import("./LidomaFeatures"), { ssr: true });
const HomePageFAQs = dynamic(() => import("./HomePageFAQs"), { ssr: true });
const ContinuedText = dynamic(() => import("./ContinuedText"), { ssr: true });

/**
 * One banner slot. The CMS holds an ordered list and the page places them at
 * fixed points down the layout; `index` is the position in that list, so an
 * editor reorders banners in the panel rather than in this file.
 */
function BannerSlot({
  banners,
  index,
  isLoading,
}: {
  banners: IHomePageData["banners"] | undefined;
  index: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <section className="mb-24 md:mb-40 CustomContainer">
        <HomePageBannerSkeleton />
      </section>
    );
  }
  const banner = banners?.[index];
  if (!banner?.pc_image && !banner?.mobile_image) return null;

  // A plain div, not a <section>: HomePageBannerComp renders its own sectioning
  // element and its own bottom margin. Wrapping it in a second one nested two
  // headingless sections and doubled the gap underneath to 80px.
  return (
    <div className="CustomContainer">
      <HomePageBannerComp
        loaderCondition={false}
        link={banner.link}
        mobile_image={banner.mobile_image}
        pc_image={banner.pc_image}
      />
    </div>
  );
}

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

  const params = (data?.params ?? {}) as any;
  const sections = params.sections ?? {};
  const app = params.app;
  const video = params.video;
  const standaloneVideo = toEmbedUrl(video?.url);

  // The panel's app image is a free-text URL, and a localhost one pasted while
  // testing would 404 for every real visitor. Fall back to the bundled artwork
  // rather than render a broken image.
  const appImage: string | null =
    app?.image && !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(app.image) ? app.image : null;

  return (
    <div className="pt-[56px] md:pt-0">
      <div className="md:hidden">{!isDesktop && <WhereYouWannaGo />}</div>

      {/* The hero owns the H1, the search form and the shortcut chips: they are
          one unit, and the chips belong next to the control they shortcut. */}
      <div className="mb-24 md:mb-32">
        <HeroSection
          mobileHeroSectionItems={params.slides}
          title={params.hero?.title}
          titleMobile={params.hero?.title_mobile}
          tagline={params.hero?.subtitle}
          taglineMobile={params.hero?.subtitle_mobile}
          suggestions={params.search_suggestions || []}
        />
      </div>

      <ResidenceTypes
        types={params.res_types || []}
        title={sections.types?.title}
        headingLevel={sections.types?.heading_level}
      />

      <PopularDestsComp />

      <BannerSlot banners={params.banners} index={0} isLoading={isLoading} />

      <section className="mb-24 md:mb-40 CustomContainer">
        <LidomaFeatures />
      </section>

      {/* The configurable sliders. Which listings each one shows is set in the
          panel, not here. */}
      <HomeRails rails={params.rails || []} />

      <SeasonalRecommendationsComp
        loaderCondition={isLoading}
        suggestsList={params.suggests || []}
      />

      <BannerSlot banners={params.banners} index={1} isLoading={isLoading} />

      <section className="mb-24 md:mb-40 ContainerForSliders">
        <AwayFromCitiesStress />
      </section>

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
              {app?.title || "اپلیکیشن لیدوما"}
            </p>
            <p
              className={`text-black ${
                isMobile ? "text-14 my-10" : "text-[23px] my-18"
              } font-[YekanBakhRegular]`}
            >
              {app?.subtitle || "دریافت از مارکت های رسمی دانلود اپلیکیشن"}
            </p>
            <div className="flex items-center gap-x-18">
              <Link
                rel="nofollow"
                target="_blank"
                prefetch={false}
                passHref
                href={app?.myket || "https://myket.ir/app/app.lidomatrip.com"}
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
                href={app?.bazaar || "https://cafebazaar.ir/app/app.lidomatrip.com"}
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
            {appImage ? (
              <Image
                height={isMobile ? 400 : 431}
                width={isMobile ? 300 : 529}
                src={appImage}
                style={{ objectFit: "contain" }}
                alt={app?.title || "اپلیکیشن لیدوما"}
                loading="lazy"
              />
            ) : (
              <Image
                height={isMobile ? 400 : 431}
                width={isMobile ? 300 : 529}
                src={downloadApp}
                style={{ objectFit: "contain" }}
                alt={app?.title || "اپلیکیشن لیدوما"}
                placeholder="blur"
              />
            )}
          </div>
        </div>
      </section>

      <BannerSlot banners={params.banners} index={2} isLoading={isLoading} />

      {/* Standalone intro video — the "ویدیو معرفی" toggle in the panel. */}
      {!!standaloneVideo && (
        <section className="mb-24 md:mb-40 CustomContainer defer-render">
          <ContinuedText
            videoUrl={
              <iframe
                className="w-full h-full rounded-12"
                src={standaloneVideo}
                title={video?.title || "ویدیو معرفی لیدوما تریپ"}
                allowFullScreen
                loading="lazy"
              />
            }
            title={video?.title}
            desc={video?.description || ""}
          />
        </section>
      )}

      {/* SEO: the page's main descriptive copy, each block with its own <h2>.
          These used to sit inside <LazyLoad>, which renders an empty placeholder
          on the server — the text never reached the HTML a crawler reads.
          `defer-render` skips the rendering work while keeping the markup.
          The video beside each block now comes from the panel too; it used to be
          a hardcoded <iframe> with the Aparat hash inlined here. */}
      {(params.desc_boxes || []).map((box: any, i: number) => {
        const embed = toEmbedUrl(box.video);
        return (
          <section key={box.id ?? i} className="mb-24 md:mb-40 CustomContainer defer-render">
            <ContinuedText
              isReverse={i % 2 === 1}
              videoUrl={
                embed ? (
                  <iframe
                    className="w-full h-full rounded-12"
                    src={embed}
                    title={box.title || "ویدیو"}
                    allowFullScreen
                    loading="lazy"
                  />
                ) : box.pc_image ? (
                  <Image
                    src={box.pc_image}
                    width={320}
                    height={200}
                    alt={box.alt || box.title || ""}
                    className="h-full w-full object-cover rounded-12"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full rounded-12 bg-gray-F5F5F5" />
                )
              }
              title={box.title}
              desc={box.content}
            />
          </section>
        );
      })}

      {!!(data?.params as IHomePageData)?.faqs?.length && (
        <HomePageFAQs faqs={(data?.params as IHomePageData)?.faqs} />
      )}

      <TripGuideArticlesComp loaderCondition={isLoading} articlesList={params.articles || []} />

      <Footer />
    </div>
  );
}
export default Home;
