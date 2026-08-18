// import { IHomePageData } from "@/api/Home";
import { popularDestsComp } from "@/constants/popularDestsComp";
import dynamic from "next/dynamic";

const FavouriteDestinationItem = dynamic(() => import("./FavouriteDestinationItem"), {
  ssr: true,
});
// const ManuallySwippableSliderSkeleton = dynamic(
//   () => import("./Skeletons/ManuallySwippableSliderSkeleton"),
//   {
//     ssr: true,
//   }
// );
const ManuallySwippableSlider = dynamic(
  () => import("components/General/Sliders/ManuallySwippableSlider"),
  {
    ssr: true,
  }
);

function PopularDestsComp({
  // loaderCondition,
  // popularsList,
}: {
  // loaderCondition: boolean;
  // popularsList: IHomePageData["populars"];
}) {
  // if (loaderCondition) {
  //   return (
  //     <section className="mb-24 md:mb-40 CustomContainer">
  //       <ManuallySwippableSliderSkeleton />
  //     </section>
  //   );
  // } else {
    // if (popularsList?.length !== 0) {
      return (
        <section className="mb-24 md:mb-40 ContainerForSliders">
          <ManuallySwippableSlider
            title="مقصد های محبوب"
            // seeAllItemsLink={"#"}
            data={popularDestsComp.map((item, i) => (
              <div className="w-[240px] shrink-0" key={i}>
                <FavouriteDestinationItem
                  name={item.name}
                  // desc={`+${item.count} اقامتگاه`}
                  linkToGo={item.link}
                  image={item.image}
                />
              </div>
            ))}
          />
        </section>
      );
    // } else {
    //   return null;
    // }
  }
// }

export default PopularDestsComp;
