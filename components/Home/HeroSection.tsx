import { useState } from "react";
import dynamic from "next/dynamic";
import { IHomePageData } from "@/api/Home";
import villaMain from "../../public/assets/home/villa-main.webp";
import homeMobile from "../../public/assets/home/home-mobile.webp";
import SearchSuggestions, { SearchSuggestion } from "./SearchSuggestions";

const MainSearchBox = dynamic(() => import("../General/MainSearchBox"), { ssr: true });
const WhereYouWannaGoModals = dynamic(
  () => import("../Search/WhereYouWannaGoSearchBox/WhereYouWannaGoModals"),
  { ssr: false }
);

/** Next's image optimizer, addressed directly. See the note on <picture> below. */
function optimized(src: string, width: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=70`;
}

/**
 * The hero: headline, search, and the shortcuts under it.
 *
 * Three things this fixes, all of which were structural rather than cosmetic:
 *
 * 1. **The H1 was invisible.** It was `sr-only`, and the headline the reader
 *    saw was a `<p>` — so the page's most important heading existed only for
 *    crawlers, and the visible one carried no semantic weight at all. The H1 is
 *    now the headline.
 *
 * 2. **Both hero images were downloaded on every visit.** The desktop and
 *    mobile heroes were two components, each with its own `priority` image, and
 *    CSS hid one of them — but the browser still fetched both. A `<picture>`
 *    with `media` on the source is the only thing that actually prevents that,
 *    which is why this reaches for the optimizer URL directly instead of
 *    `next/image` (it has no art-direction API).
 *
 * 3. **The desktop image was being stretched.** `villa-main.webp` is 1440×480
 *    and the hero was `h-[calc(100vh-190px)]` — roughly 890px on a 1080p
 *    screen, so a 480px-tall photo was blown up nearly twice its size. The hero
 *    is now close to the asset's own 3:1 shape.
 */
function HeroSection({
  mobileHeroSectionItems,
  title,
  titleMobile,
  tagline,
  taglineMobile,
  suggestions = [],
}: {
  mobileHeroSectionItems: IHomePageData["slides"];
  title?: string | null;
  titleMobile?: string | null;
  tagline?: string | null;
  taglineMobile?: string | null;
  suggestions?: SearchSuggestion[];
}) {
  const [showWhereYouWannaGoModal, setShowWhereYouWannaGoModal] = useState(false);
  const [showCitiesListModal, setShowCitiesListModal] = useState(false);

  const desktopTitle = title || "اجاره ویلا و سوئیت در سراسر ایران";
  const mobileTitle = titleMobile || desktopTitle;
  const desktopTagline = tagline || "هرجا بری باهاتیم...";
  const mobileTagline = taglineMobile ?? tagline ?? "هر جا بری باهاتیم ...";

  return (
    <section aria-label="جستجوی اقامتگاه">
      {/* The photographic band. The chips below deliberately sit outside it —
          they are white pills and belong on the page background, not floating
          over the dark end of the hero image. */}
      <div className="relative">
        {/* The backdrop is its own layer, and it is the only thing that clips.
          Rounding the hero needs `overflow-hidden`, and while that lived on a
          wrapper that also held the search box it cut the destination list, the
          calendar and the guests popover off at the hero's edge. Keeping the
          content out of the clipper is what makes those popovers whole. */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden md:rounded-b-[32px]">
          {/* Painted before the photo arrives, so the headline never sits on
            white and the LCP frame is never a blank box. */}
          <div className="absolute inset-0 bg-[#0b3b3f]" />

          <picture>
            <source
              media="(min-width: 1024px)"
              // Only widths listed in next.config's deviceSizes/imageSizes are
              // valid — anything else is a 400 and the hero silently disappears —
              // so these stick to values that are in Next's own defaults. The
              // optimizer never upscales, so asking for 1920 of a 1440-wide source
              // returns it at its native 1440.
              srcSet={`${optimized(villaMain.src, 1080)} 1080w, ${optimized(
                villaMain.src,
                1920
              )} 1920w`}
              sizes="100vw"
            />
            <img
              src={optimized(homeMobile.src, 828)}
              srcSet={`${optimized(homeMobile.src, 640)} 640w, ${optimized(
                homeMobile.src,
                828
              )} 828w`}
              sizes="100vw"
              alt="اجاره ویلا، سوئیت و اقامتگاه بوم‌گردی در سراسر ایران"
              width={1440}
              height={480}
              // The LCP element: tell the browser before it works it out.
              // eslint-disable-next-line @next/next/no-img-element
              {...({ fetchpriority: "high" } as any)}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>

          {/* Contrast is not left to the photograph. */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
        </div>

        {/* `relative` with no z-index: enough to paint above the backdrop layer,
          not enough to trap the popovers inside a new stacking context. */}
        <div className="CustomContainer relative flex min-h-[440px] flex-col justify-end pb-24 pt-80 md:min-h-[460px] md:justify-center md:pb-40 md:pt-64">
          <div className="max-w-[720px]">
            <h1 className="font-b text-white text-26 leading-38 md:text-40 md:leading-48 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
              <span className="md:hidden">{mobileTitle}</span>
              <span className="hidden md:inline">{desktopTitle}</span>
            </h1>

            <p className="mt-8 font-r text-white/90 text-14 leading-24 md:mt-12 md:text-18 md:leading-30 [text-shadow:0_1px_10px_rgba(0,0,0,0.35)]">
              <span className="md:hidden">{mobileTagline}</span>
              <span className="hidden md:inline">{desktopTagline}</span>
            </p>
          </div>

          {/* Desktop: the full search form. Below 1024 the same journey runs
              through the existing full-screen picker, which is a better fit for
              a thumb than four fields on one row. */}
          <div className="mt-20 hidden md:mt-32 md:block">
            <MainSearchBox noCoOperation={false} containerClassname="!mx-0" />
          </div>

          <div className="mt-20 md:hidden">
            <button
              type="button"
              onClick={() => setShowWhereYouWannaGoModal(true)}
              className="flex w-full items-center gap-x-12 rounded-full bg-white px-18 py-14 text-right shadow-[0_8px_28px_rgba(24,39,58,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main focus-visible:ring-offset-2"
            >
              <i aria-hidden="true" className="icon-Search text-24 text-primary-main" />
              <span className="block grow">
                <span className="block font-m text-14 leading-20 text-black">کجا می‌روید؟</span>
                <span className="block font-r text-12 leading-16 text-gray-959FA7">
                  مقصد، تاریخ و تعداد نفرات
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* The quickest routes out of the hero, and the earliest internal links
          on the page. */}
      <SearchSuggestions suggestions={suggestions} />

      {showWhereYouWannaGoModal || showCitiesListModal ? (
        <WhereYouWannaGoModals
          setShowCitiesListModal={setShowCitiesListModal}
          setShowWhereYouWannaGoModal={setShowWhereYouWannaGoModal}
          showCitiesListModal={showCitiesListModal}
          showWhereYouWannaGoModal={showWhereYouWannaGoModal}
        />
      ) : null}
    </section>
  );
}

export default HeroSection;
