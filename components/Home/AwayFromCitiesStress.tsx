import { awayFromCitiesStressItems } from "@/constants/awayFromCitiesStressItems";
import ManuallySwippableSlider from "../General/Sliders/ManuallySwippableSlider";
import AwayFromCitiesStressItem from "./AwayFromCitiesStressItem";

function AwayFromCitiesStress() {
  return (
    <ManuallySwippableSlider
      title="دور از هیاهوی شهر"
      // seeAllItemsLink={"#"}
      data={awayFromCitiesStressItems.map((item, i) => (
        <div className="w-[220px] shrink-0" key={i}>
          <AwayFromCitiesStressItem
            name={item.name}
            desc={`هرشب از : ${item.min_price.toLocaleString("en-US")} تومان`}
            linkToGo={item.link}
            image={item.image}
          />
        </div>
      ))}
    />
  );
}

export default AwayFromCitiesStress;
