import { IHomePageData } from "@/api/Home";
import dynamic from "next/dynamic";
const SeasonalRecommendationsSkeleton = dynamic(
  () => import("./Skeletons/SeasonalRecommendationsSkeleton"),
  {
    ssr: true,
  }
);
const SeasonalRecommendations = dynamic(() => import("./SeasonalRecommendations"), {
  ssr: true,
});

function SeasonalRecommendationsComp({
  loaderCondition,
  suggestsList,
}: {
  loaderCondition: boolean;
  suggestsList: IHomePageData["suggests"];
}) {
  if (loaderCondition) {
    return (
      <section className="mb-24 md:mb-42 ContainerForSliders">
        <SeasonalRecommendationsSkeleton data={Array.from({ length: 8 })} />
      </section>
    );
  } else {
    if (suggestsList.length !== 0) {
      return (
        <section className="mb-24 md:mb-42 ContainerForSliders">
          <SeasonalRecommendations
            data={suggestsList.map((item) => {
              return {
                // average: item.average,
                id: item.id,
                image: item.image,
                name: item.name,
                content: item.content,
                // The curated link, already resolved server-side past any 301.
                href: (item as any).link,
              };
            })}
          />
        </section>
      );
    } else {
      return null;
    }
  }
}

export default SeasonalRecommendationsComp;
