import { useMediaQuery } from "@/utilities/useMediaQuery";
import TopSection from "./TopSection";
import ResCompleteInfo from "./ResCompleteInfo";
import BoomgardiPropertyPageDataProvider from "@/providers/BoomgardiPropertyPage";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import dynamic from "next/dynamic";
import Footer from "@/layouts/Footer";
// import LazyLoad from "react-lazyload";
// const Footer = dynamic(() => import("@/layouts/Footer"), {
//   ssr: true,
// });
const BoomgardiMobileBottomFloater = dynamic(
  () => import("@/components/ObserveResidenceDetails/BottomFloater/BoomgardiMobileBottomFloater"),
  {
    ssr: true,
  }
);
const BoomgardiBillAndReserveSettingsPaper = dynamic(
  () =>
    import(
      "@/components/ObserveResidenceDetails/BillAndReserveSettings/Boomgardi/BoomgardiBillAndReserveSettingsPaper"
    ),
  {
    ssr: true,
  }
);

function BoomgardiDetailsIndex2() {
  const { isLoading, data } = useGetObserveResidence();

  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  if (isLoading || !data) return null;

  return (
    <>
      <BoomgardiPropertyPageDataProvider>
        <article>
          <header>
            <TopSection />
          </header>

          <div className="grid grid-cols-14 md:gap-x-24 CustomContainer">
            <div className="col-span-full md:col-span-9">
              <ResCompleteInfo />
            </div>
            <footer className="hidden md:block md:col-span-5 relative">
              {!!isDesktop && <BoomgardiBillAndReserveSettingsPaper />}
            </footer>
          </div>

          {!isDesktop && (
            <footer className="md:hidden">
              <BoomgardiMobileBottomFloater />
            </footer>
          )}
        </article>
      </BoomgardiPropertyPageDataProvider>

      {/* <LazyLoad height={637} once offset={100}> */}
      <Footer className="mb-[82px] md:mb-0" />
      {/* </LazyLoad> */}
    </>
  );
}

export default BoomgardiDetailsIndex2;
