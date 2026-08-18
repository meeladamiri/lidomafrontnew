import dynamic from "next/dynamic";
import { useMediaQuery } from "@/utilities/useMediaQuery";
// import LazyLoad from "react-lazyload";
import TopSection from "./TopSection";
import SuitPropertyPageDataProvider from "@/providers/SuitPropertyPage";
import ResCompleteInfo from "./ResCompleteInfo";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
// import ResPageNavigationTabs from "./TopSection/ResPageNavigationTabs";
import Footer from "@/layouts/Footer";
import SimilarReses from "./ResCompleteInfo/SimilarReses";
import LazyLoad from "react-lazyload";
import RelatedSearches from "../General/RelatedSearches";
// import { useEffect } from "react";
// import { useRouter } from "next/router";
const SuitMobileBottomFloater = dynamic(() => import("./BottomFloater/SuitMobileBottomFloater"), {
  ssr: true,
});
const SuitBillAndReserveSettingsPaper = dynamic(
  () => import("./BillAndReserveSettings/Suit/SuitBillAndReserveSettingsPaper"),
  {
    ssr: true,
  }
);
// const Footer = dynamic(() => import("@/layouts/Footer"), {
//   ssr: true,
// });

function SuitDetailsIndex() {
  // const router = useRouter();
  const { isLoading, data } = useGetObserveResidence();
  // const { setNumberOfPeople } = useSuitPropertyPageData();

  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");

  if (isLoading || !data) return null;

  // useEffect(() => {
  //   if (!!router?.query?.guests_count) {
  //     setNumberOfPeople(Number(router?.query?.guests_count));
  //   }
  // }, [router?.query?.guests_count]);

  return (
    <>
      <SuitPropertyPageDataProvider>
        <article>
          <header>
            <TopSection />
          </header>
          <div className="grid grid-cols-14 md:gap-x-24 CustomContainer">
            <div className="col-span-full md:col-span-9 relative">
              {/* <ResPageNavigationTabs /> */}
              <ResCompleteInfo />
            </div>
            <footer className="hidden md:block md:col-span-5 relative">
              {!!isDesktop && <SuitBillAndReserveSettingsPaper />}
            </footer>
          </div>

          {!isDesktop && (
            <footer className="md:hidden">
              <SuitMobileBottomFloater />
            </footer>
          )}
        </article>
        <aside className="CustomContainer">
          <LazyLoad height={360} once offset={120}>
            {!!data?.params?.similar_res?.length && <SimilarReses />}
          </LazyLoad>
          <LazyLoad height={236} once offset={120}>
            <RelatedSearches
              tags={data?.params?.tags}
              relatedSearchWrapperClassname="text-[#015046] text-14 leading-18 font-m !bg-[#03D6BB14]"
            />
          </LazyLoad>
        </aside>
      </SuitPropertyPageDataProvider>

      {/* <LazyLoad height={637} once offset={100}> */}
      <Footer className="mb-[82px] md:mb-0" />
      {/* </LazyLoad> */}
    </>
  );
}

export default SuitDetailsIndex;
