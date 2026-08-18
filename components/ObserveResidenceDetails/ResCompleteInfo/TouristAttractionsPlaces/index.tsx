import { IDistanceItem } from "@/interfaces/observe_residence";
import PlaceItem from "./PlaceItem";

function TouristAttractionsPlaces({
  cityName,
  places,
  wrapperClassname,
}: {
  cityName: string;
  places: IDistanceItem[];
  wrapperClassname?: string;
}) {
  return (
    <div className={`${wrapperClassname || ""}`}>
      <h3 className="text-16 leading-28 text-black font-m mb-24">
        فاصله تا جاذبه های گردشگری {cityName}
      </h3>
      {places?.slice(0, 6).map((place, idx) => {
        return (
          <PlaceItem
            key={idx}
            distance={place?.distance}
            name={place?.name}
            time={place?.time}
            className={"mb-16 last:mb-0"}
          />
        );
      })}
    </div>
  );
}

export default TouristAttractionsPlaces;
