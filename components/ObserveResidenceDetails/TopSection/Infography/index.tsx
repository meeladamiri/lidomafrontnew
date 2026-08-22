import { useMediaQuery } from "@/utilities/useMediaQuery";
import ResRate from "@/components/General/ResRate";
import ResLocationWithBreadCrumb from "@/components/General/ResLocationWithBreadCrumb";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import classes from "styles/line-clamps.module.css";
import dynamic from "next/dynamic";
const InfographyBtns = dynamic(() => import("./InfographyBtns"), {
  ssr: true,
});

function Infography() {
  const isDesktop: boolean = useMediaQuery("(min-width: 1024px)");
  const { data } = useGetObserveResidence();

  const title = data?.params?.residence_info.name;
  // name2 is an optional alt/short name (mainly used for boomgardi listings)
  // — almost never set, so fall back to the real name rather than leaving
  // the breadcrumb's last item empty.
  const resPureNameAlone = data?.params?.residence_info.name2 || title;
  const average_rating = data?.params?.residence_info.average_rating;
  const reviews_count = data?.params?.residence_info.reviews_count;
  const reference = data?.params?.residence_info.reference;
  const residenceId = data?.params?.residence_info.id;
  const province = data?.params?.residence_info.province;
  const proviceEn = data?.params?.residence_info.province_title;
  const cityEn = data?.params?.residence_info.city_title;
  const city = data?.params?.residence_info.city;
  const neighborhood = "";

  return (
    <div className="CustomContainer">
      <ResLocationWithBreadCrumb
        province={province}
        city={city}
        cityEn={cityEn}
        proviceEn={proviceEn}
        neighborhood={neighborhood}
        resPureNameAlone={resPureNameAlone}
        residenceId={residenceId}
      />
      <div className="md:flex md:items-center md:justify-between">
        <div className="md:flex md:items-center gap-x-28">
          <div>
            <h1
              className={`text-17 md:text-18 leading-24 text-black font-m mt-16 mb-16 ${classes["line-clamp-1"]}`}
            >
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-x-16">
            <ResRate average_rating={average_rating} reviews_count={reviews_count} />

            <p className="text-12 leading-14 text-gray-57585C font-r">کد آگهی : {reference}</p>
          </div>
        </div>

        {!!isDesktop && <InfographyBtns />}
      </div>
    </div>
  );
}

export default Infography;
