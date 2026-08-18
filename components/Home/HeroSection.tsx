import HeroSectionDesktop from "./HeroSectionDesktop";
import HeroSectionMobile from "./HeroSectionMobile";
import { IHomePageData } from "@/api/Home";
import { useMediaQuery } from "@/utilities/useMediaQuery";

function HeroSection({
  mobileHeroSectionItems,
}: {
  mobileHeroSectionItems: IHomePageData["slides"];
}) {
  const isDesktop: boolean = useMediaQuery("(min-width: 480px)");

  return (
    <>
      {/* // In 'h-[calc(100vh-190px)]' --> 190px comes from pb of 'main' tag in MainLayout */}
      <div className="hidden md:block w-full h-[calc(100vh-190px)] relative">
        {!!isDesktop && <HeroSectionDesktop />}
      </div>

      <div className="CustomContainer md:hidden">
        {!isDesktop && <HeroSectionMobile mobileHeroSectionItems={mobileHeroSectionItems} />}
      </div>
    </>
  );
}
export default HeroSection;
