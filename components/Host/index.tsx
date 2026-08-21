import MizbanInfo from "./MizbanInfo";
import AboutMizbanSection from "./AboutMizbanSection";
import HostPerformance from "./HostPerformance";
import HostResidencesList from "./HostResidencesList";
import GuestsReviews from "./GuestsReviews";
import { useQuery } from "@tanstack/react-query";
import {
  I_MizbanAccountInfo_Data,
  getMizbanAccountInfo,
} from "@/api/Residences/getMizbanAccountInfo";
import { TinyLoader } from "@/components/General/Loader/TinyLoader";
import { useRouter } from "next/router";

const Host = () => {
  const { query } = useRouter();
  const { data, isLoading } = useQuery(["getMizbanAccountInfo", query?.id], () => {
    return getMizbanAccountInfo({ reference: query?.id as string });
  });

  const mizbanData = data?.params as I_MizbanAccountInfo_Data;

  return (
    <div className="pt-[72px] md:pt-[148px] md:pb-[112px] CustomContainer md:grid md:grid-cols-3 md:gap-x-40">
      {isLoading ? (
        <TinyLoader />
      ) : (
        <>
          <div className="relative">
            <div
              className={`md:col-span-1 md:px-20 md:py-32 md:border md:border-gray-E5E5E6 md:rounded-16 sticky top-[85px]
            `}
            >
              <MizbanInfo
                containerClassname="mb-16 !items-start justify-center !flex-col gap-y-12"
                mizbanName={mizbanData?.host_info?.name}
                mizbanImage={mizbanData?.host_info?.image_url}
              />

              <HostPerformance
                activeResesN={mizbanData?.residences?.length || 0}
                confirmPerc={Number(mizbanData?.host_info?.confirm_percent?.toFixed(1))}
                // responseTime={mizbanData?.host_info?.answer_time}
                responseTime={mizbanData?.host_info?.answer_time}
              />

              {!!mizbanData?.host_info?.description && (
                <AboutMizbanSection
                  containerClassname="mb-24"
                  desc={mizbanData?.host_info?.description}
                />
              )}
            </div>
          </div>

          <div className="col-span-2">
            <HostResidencesList hostResidencesList={mizbanData?.residences} />
          </div>
        </>
      )}
      <div className="md:col-span-full">
        {!!mizbanData?.reviews?.length && (
          <GuestsReviews
            reviews={mizbanData?.reviews}
            mizbanAvatar={mizbanData?.host_info?.image_url}
          />
        )}
      </div>
    </div>
  );
};

export default Host;
