import ManuallySwippableSliderComp from "@/components/Home/ManuallySwippableSliderComp";
import { IObserveResidenceData } from "interfaces/observe_residence";
import SwiperCore, { Navigation } from "swiper";
import "swiper/css";

// install Swiper modules
SwiperCore.use([Navigation]);

function SimilarResidencesSlider({
  similar_residences,
  isLoading,
}: {
  similar_residences: IObserveResidenceData["similar_res"];
  isLoading: boolean;
}) {
  return (
    <>
      <ManuallySwippableSliderComp
        title="اقامتگاه های مشابه"
        loaderCondition={isLoading}
        data_list={similar_residences}
        showArrowsForNextAndPrevSlide={false}
      />
    </>
  );
}

export default SimilarResidencesSlider;
