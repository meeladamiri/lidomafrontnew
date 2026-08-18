import TypicalResidenceCartForSwippableSlider from "@/components/Home/TypicalResidenceCartForSwippableSlider";
import { IProduct_SearchResidences } from "@/interfaces/Search/SearchResp";
import ManuallySwippableSliderComp from "../Home/ManuallySwippableSliderComp";

const HostResidencesList = ({
  hostResidencesList,
}: {
  hostResidencesList: IProduct_SearchResidences[];
}) => {
  return (
    <div>
      <div className="md:grid md:grid-cols-2 md:gap-16 hidden">
        {hostResidencesList?.map((item) => (
          <div key={item.reference}>
            <TypicalResidenceCartForSwippableSlider
              name={item.name}
              provice={item.province}
              proviceId={item.province_id}
              cityId={item.city_id}
              city={item.city}
              neighborhood={item.neighborhood || ""}
              rating={item.average_rating}
              commentsN={item.reviews_count}
              price={item.min_price || 0}
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
      </div>
      <div className="md:hidden block">
        <ManuallySwippableSliderComp
          title="لیست اقامتگاه ها ‌:"
          data_list={hostResidencesList}
          showArrowsForNextAndPrevSlide={false}
        />
      </div>
    </div>
  );
};

export default HostResidencesList;
