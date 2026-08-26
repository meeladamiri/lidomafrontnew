import HeroSectionDesktop from "./HeroSectionDesktop";
import HeroSectionMobile from "./HeroSectionMobile";
import { IHomePageData } from "@/api/Home";

// The hero carries the page's H1 and its LCP image, so both have to exist in
// the server HTML.
//
// This used to gate each breakpoint on useMediaQuery, which returns false
// during SSR and only becomes true in an effect. The desktop hero was
// therefore missing from the server response entirely — it appeared after
// hydration, taking the LCP image and the search box with it. Both variants
// now render and CSS picks one, which is also why the H1 lives here rather
// than inside each variant: one element, two strings, no duplicate H1.

function HeroSection({
  mobileHeroSectionItems,
  title,
  titleMobile,
  tagline,
  taglineMobile,
}: {
  mobileHeroSectionItems: IHomePageData["slides"];
  title?: string | null;
  titleMobile?: string | null;
  tagline?: string | null;
  taglineMobile?: string | null;
}) {
  const desktopTitle = title || "اجاره ویلا و سوئیت در سراسر ایران";
  const mobileTitle = titleMobile || desktopTitle;

  return (
    <>
      {/* The single H1. Each span is shown at one breakpoint, so the document
          has exactly one H1 whichever way it is rendered. */}
      <h1 className="sr-only">
        <span className="md:hidden">{mobileTitle}</span>
        <span className="hidden md:inline">{desktopTitle}</span>
      </h1>

      {/* // In 'h-[calc(100vh-190px)]' --> 190px comes from pb of 'main' tag in MainLayout */}
      <div className="hidden md:block w-full h-[calc(100vh-190px)] relative">
        <HeroSectionDesktop title={desktopTitle} tagline={tagline} />
      </div>

      <div className="CustomContainer md:hidden">
        <HeroSectionMobile
          mobileHeroSectionItems={mobileHeroSectionItems}
          title={mobileTitle}
          tagline={taglineMobile ?? tagline}
        />
      </div>
    </>
  );
}
export default HeroSection;
