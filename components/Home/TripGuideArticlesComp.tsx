import { IHomePageData } from "@/api/Home";
import dynamic from "next/dynamic";

const ManuallySwippableSliderSkeleton = dynamic(
  () => import("./Skeletons/ManuallySwippableSliderSkeleton"),
  {
    ssr: true,
  }
);
const ManuallySwippableSlider = dynamic(
  () => import("components/General/Sliders/ManuallySwippableSlider"),
  {
    ssr: true,
  }
);
const TripGuideArticleCart = dynamic(() => import("./TripGuideArticleCart"), {
  ssr: true,
});

function TripGuideArticlesComp({
  loaderCondition,
  articlesList,
}: {
  loaderCondition: boolean;
  articlesList: IHomePageData["articles"];
}) {
  if (loaderCondition) {
    return (
      <section className="mb-24 md:mb-40 ContainerForSliders">
        <ManuallySwippableSliderSkeleton />
      </section>
    );
  } else {
    if (articlesList.length !== 0) {
      return (
        <section className="mb-24 md:mb-40 ContainerForSliders">
          <ManuallySwippableSlider
            title="مقالات راهنمای سفر"
            seeAllItemsLink={"https://lidomatrip.com/blog/"}
            data={articlesList.map((item, i) => (
              <div className="w-[300px] shrink-0" key={i}>
                <TripGuideArticleCart
                  title={item.title}
                  articleImage={item.image}
                  writerName={item.author}
                  writerImage={item.author_image}
                  linkToGo={item.link || "#"}
                />
              </div>
            ))}
          />
        </section>
      );
    } else {
      return null;
    }
  }
}

export default TripGuideArticlesComp;
