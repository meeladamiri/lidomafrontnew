// import { IHomePageData } from "@/api/Home";
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
const TypicalResidenceCartForSwippableSlider = dynamic(
  () => import("./TypicalResidenceCartForSwippableSlider"),
  {
    ssr: true,
  }
);

function ManuallySwippableSliderComp({
  loaderCondition,
  data_list = [],
  title,
  linkTo,
  showArrowsForNextAndPrevSlide,
  ManuallySwippableSliderCompClassname,
}: {
  loaderCondition?: boolean;
  data_list: any[]; // NOTE: In case we have more components like this, i will change it to 'any[]' maybe.
  title?: string;
  linkTo?: string;
  showArrowsForNextAndPrevSlide?: boolean;
  ManuallySwippableSliderCompClassname?: string;
}) {
  if (loaderCondition) {
    return (
      <section
        className={`mb-24 md:mb-40 CustomContainer ${ManuallySwippableSliderCompClassname || ""}`}
      >
        <ManuallySwippableSliderSkeleton />
      </section>
    );
  } else {
    if (data_list.length !== 0) {
      return (
        <section
          className={`mb-24 md:mb-40 CustomContainer ${ManuallySwippableSliderCompClassname || ""}`}
        >
          <ManuallySwippableSlider
            showArrowsForNextAndPrevSlide={showArrowsForNextAndPrevSlide}
            title={title}
            seeAllItemsLink={linkTo}
            data={data_list.map((item, i) => (
              <div className="w-[310px] shrink-0" key={i}>
                <TypicalResidenceCartForSwippableSlider
                  name={item.name}
                  provice={item.province}
                  proviceId={item.province_id}
                  cityId={item.city_id}
                  city={item.city}
                  neighborhood={item.neighborhood}
                  rating={item.average_rating}
                  commentsN={item.reviews_count}
                  price={item.min_price}
                  bedN={item.rooms_count}
                  referenceCode={item.reference}
                  maxCapacity={item.max_capacity}
                  image={item.main_image}
                  residenceId={item.id}
                  isFastEnabled={item.is_fast}
                  discountP={item.discount}
                  isLastMomentForToday={!!item.is_offer}
                  displayType={item.display_type}
                  resPureNameAlone={item.name2}
                  isFull={item.is_full}
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

export default ManuallySwippableSliderComp;
