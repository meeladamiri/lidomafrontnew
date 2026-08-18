import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import Infography from "./Infography/index";
import ResidenceImages from "./ResidenceImages";
import TopSectionSkeleton from "../Skeletons/TopSection/TopSectionSkeleton";

function TopSection() {
  const { isLoading } = useGetObserveResidence();

  return (
    <div className="w-full flex flex-col md:flex-col-reverse md:mt-16 mb-16 md:mb-20">
      {isLoading ? (
        <TopSectionSkeleton />
      ) : (
        <>
          <div id="residenceImages" className="mb-12 md:mb-0 md:mt-8">
            <ResidenceImages />
          </div>

          <Infography />
        </>
      )}
    </div>
  );
}

export default TopSection;
