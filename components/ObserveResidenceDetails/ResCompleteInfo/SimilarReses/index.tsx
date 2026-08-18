import { IObserveResidenceData } from "@/interfaces/observe_residence";
import SimilarResidencesSlider from "./SimilarResidencesSlider";
import Divider from "../../../General/Divider";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";

function SimilarReses() {
  const { data, isLoading } = useGetObserveResidence();

  const resp: IObserveResidenceData = data?.params;

  const similar_res = resp?.similar_res;

  return (
    <>
      <section className="pb-24">
        <div className="Make_swiper_slide_width_auto">
          <SimilarResidencesSlider
            isLoading={isLoading}
            similar_residences={[...similar_res.slice(0, 4)]}
          />
        </div>
      </section>

      <Divider className="mb-24" />
    </>
  );
}

export default SimilarReses;
