import dynamic from "next/dynamic";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import Divider from "@/components/General/Divider";
const TouristAttractionsPlaces = dynamic(
  () => import("@/components/ObserveResidenceDetails/ResCompleteInfo/TouristAttractionsPlaces"),
  {
    ssr: true,
  }
);
const ProjectMap = dynamic(() => import("components/Map"), {
  ssr: false,
});

function ResGeoLocation() {
  const { data } = useGetObserveResidence();

  return (
    <>
      <section id="resLocation" className="pb-24">
        <header>
          <h2 className="text-16 leading-28 text-zilgara font-m mb-24">
            {`موقعیت مکانی ${data?.params?.residence_info?.residence_type}`}
          </h2>
        </header>

        <p className="text-12 leading-21 text-zilgara font-l mb-12">
          آدرس و موقعیت دقیق پس از رزرو در فاکتور شما قابل مشاهده است.
        </p>

        <div className="w-full h-320">
          <ProjectMap
            userLat={
              !!data?.params?.residence_info?.latitude
                ? Number(data?.params?.residence_info?.latitude)
                : undefined
            }
            userLang={
              !!data?.params?.residence_info?.longitude
                ? Number(data?.params?.residence_info?.longitude)
                : undefined
            }
            showZoomControl={false}
            isPinpointDraggable={false}
            name="observe-reslatlng"
            mapClassname="rounded-12"
            hasUserLocationBtn={false}
          />
        </div>

        {!!data?.params?.distances?.length && (
          <TouristAttractionsPlaces
            places={data?.params?.distances}
            cityName={data?.params?.residence_info?.city}
            wrapperClassname="mt-24"
          />
        )}
      </section>

      <Divider className="mb-24" />
    </>
  );
}

export default ResGeoLocation;
