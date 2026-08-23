import Image from "next/image";
import HostInfoItem from "./HostInfoItem";
import Divider from "@/components/General/Divider";
import { useGetObserveResidence } from "Hooks/ObserveResidence/useGetObserveResidence";
import timeAgo from "persian-time-ago";
import { IObserveResidenceData } from "@/interfaces/observe_residence";
import moment from "moment-jalaali";
import { Button } from "@/components/General/core/Button";
// import AboutMizbanModal from "./AboutMizbanModal";
import MizbanInfo from "./MizbanInfo";
import { useRouter } from "next/router";
// import { getResIdFromURL } from "@/utilities/PropertyPage/getResIdFromURL";

function HostInfo() {
  // const [showAboutMizbanModal, setShowAboutMizbanModal] = useState<boolean>(false);
  const router = useRouter();
  const { data } = useGetObserveResidence();
  const resp: IObserveResidenceData = data?.params;

  return (
    <>
      <section className="mb-21" id="Host_Infographianno">
        <MizbanInfo
          containerClassname="mb-20"
          mizbanName={resp?.residence_info?.host?.name}
          mizbanImage={resp?.residence_info?.host?.image_url}
        />

        <ul className="pr-12">
          <HostInfoItem
            k="آخرین بروزرسانی تقویم: "
            v={
              !!resp?.residence_info?.host?.last_update
                ? timeAgo(
                    moment(resp?.residence_info?.host?.last_update, "YYYY-MM-DD hh:mm:dd").format(
                      "jYYYY-jMM-jDD hh:mm:ss"
                    )
                  )
                : ""
            }
            className="mt-16"
            icon={<i className="text-20 text-gray-616E7C icon-Calendar" />}
          />

          <HostInfoItem
            k="میزبان لیدوما از: "
            v={
              !!resp?.residence_info?.host?.joined_date
                ? moment(resp?.residence_info?.host?.joined_date, "YYYY-MM-DD hh:mm:ss").format(
                    "jMMMM jYYYY"
                  )
                : ""
            }
            className="mt-16"
            icon={
              <Image src="/assets/non-icomoon-icons/logo-grey.svg" width={20} height={20} alt="" />
            }
          />

          <HostInfoItem
            k="زمان بررسی درخواست: "
            v={`کمتر از ${Math.floor(resp?.residence_info?.host?.answer_time || 0)} دقیقه`}
            className="mt-16"
            icon={
              <Image src="/assets/non-icomoon-icons/timer-grey.svg" width={20} height={20} alt="" />
            }
          />
        </ul>
        <Button
          isFullWidth
          variant="outlined"
          color="grey"
          className="mt-24 md:w-[240px]"
          onClick={() => router.push(`/host/${resp?.residence_info?.host?.reference}`)}
          leftIcon={<i className="icon-FlashLeft text-20" />}
        >
          مشاهده پروفایل میزبان
        </Button>
      </section>

      {/* {!!showAboutMizbanModal && (
        <AboutMizbanModal
          showAboutMizbanModal={showAboutMizbanModal}
          setShowAboutMizbanModal={setShowAboutMizbanModal}
          productId={Number(query?.id)}
        />
      )} */}

      <Divider className="mb-24" />
    </>
  );
}
export default HostInfo;
