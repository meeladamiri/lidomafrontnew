import dynamic from "next/dynamic";
import ResFourInfos from "./ResFourInfos";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import ResVideo from "./ResVideo";
import ResDescription from "./ResDescription";
import ResFacilities from "./ResFacilities";
import LazyLoad from "react-lazyload";
import Divider from "@/components/General/Divider";
import { IObserveResidenceData } from "@/interfaces/observe_residence";
import HostPreview from "./HostPreview";

const SuitResCalendar = dynamic(() => import("./SuitResCalendar"), {
  ssr: true,
});
const ListAllAvailabeRooms = dynamic(() => import("../ListAllAvailabeRooms"), {
  ssr: true,
});
const ResFAQs = dynamic(() => import("./ResFAQs"), {
  ssr: true,
});
const HostInfo = dynamic(() => import("./HostInfo"), {
  ssr: true,
});
const ResCapacity = dynamic(() => import("./ResCapacity"), {
  ssr: true,
});
const ResGeoLocation = dynamic(() => import("../ResCompleteInfo/ResGeoLocation"), {
  ssr: true,
});
const ResRules = dynamic(() => import("./ResRules"), {
  ssr: true,
});
const ResCancelRules = dynamic(() => import("./ResCancelRules"), {
  ssr: true,
});
const ResReviews = dynamic(() => import("./ResReviews"), {
  ssr: true,
});

function ResCompleteInfo() {
  const { data } = useGetObserveResidence();
  const resp: IObserveResidenceData = data?.params;

  return (
    <>
      <HostPreview />

      {!!resp?.residence_info?.video_url && (
        <ResVideo video_url={resp?.residence_info?.video_url} />
      )}
      <Divider />
      <ResFourInfos />
      <Divider />
      <ResDescription
        description={resp?.residence_info.description}
        isFast={resp?.residence_info?.is_fast}
        residenceType={data?.params?.residence_info?.residence_type}
      />
      {resp?.residence_info?.display_type === "suit" ? <ResCapacity /> : null}
      <ResFacilities />
      {/* Boomgardi Specific starts here */}
      {resp?.residence_info?.display_type === "suit" ? (
        <SuitResCalendar />
      ) : resp?.residence_info?.display_type === "boomgardi" ? (
        <ListAllAvailabeRooms />
      ) : null}
      {/* Boomgardi Specific ends here */}
      <LazyLoad height={453} once offset={150}>
        <ResGeoLocation />
      </LazyLoad>
      {/* SEO: rules are crawlable text — must be in the SSR HTML, not behind
          a client-only LazyLoad placeholder */}
      <section>
        <header>
          <h2 className="pb-24">
            {`قوانین و مقررات ${data?.params?.residence_info?.residence_type}`}
          </h2>
        </header>
        <div className="grid grid-cols-12 gap-x-28">
          <ResRules />
          <ResCancelRules />
        </div>
      </section>
      {/* <LazyLoad height={155} once offset={150}> */}
      {/* {!!resp?.rules?.find(
          (el: any) => el.category === "مقررات لغو رزرو" && el.name === "مقررات لغو رزرو"
        ) &&  */}
      {/* } */}
      {/* </LazyLoad> */}
      <Divider className="mb-24" />
      {/* SEO: host info + reviews are crawlable content — keep in SSR HTML */}
      <HostInfo />
      {resp?.reviews?.length !== 0 && <ResReviews />}
      {/* Boomgardi Specific starts here */}
      {resp?.residence_info?.display_type === "suit" ? null : resp?.residence_info?.display_type ===
        "boomgardi" ? (
        <LazyLoad height={247} once offset={240}>
          <ResFAQs />
        </LazyLoad>
      ) : null}
      {/* Boomgardi Specific ends here */}
    </>
  );
}

export default ResCompleteInfo;
