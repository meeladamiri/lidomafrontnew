import PageTitle from "components/General/PageTitle";
import Grid from "components/dashboard/Grid";
import PendingRequests from "components/dashboard/PendingRequests";
import { LinkButton } from "components/General/core/Button";
import Profile from "components/dashboard/Profile";
import GuestsComments from "components/dashboard/GuestsComments";
import Conversations from "components/dashboard/Conversations";
import DashboardPageSlider from "components/dashboard/Slider";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "api/Dashboard";
import { miladiToJalali } from "utilities/dateTools";
import IncompleteResidences from "components/dashboard/IncompleteResidences";
import { DashboardPageGrid } from "./Skeletons/DashboardPageGrid";
import { DashboardSlider } from "./Skeletons/DashboardSlider";
import { DashboardPageProfileSkeleton } from "./Skeletons/DashboardPageProfileSkeleton";
import { IncompleteResidencesSkeleton } from "./Skeletons/IncompleteResidencesSkeleton";
import { ConversationsSkeleton } from "./Skeletons/ConversationsSkeleton";
import { ReviewsSkeleton } from "./Skeletons/ReviewsSkeleton";
import { PendingRequestsSkeleton } from "./Skeletons/PendingRequestsSkeleton";
import { ResidencesWaitingForExpertsConfirmSkeleton } from "./Skeletons/ResidencesWaitingForExpertsConfirmSkeleton";
import ResidencesWaitingForExpertsConfirm from "./ResidencesWaitingForExpertsConfirm";
import useDialog from "Hooks/useDialog";
import Dialog from "../General/core/Dialog";
import { useEffect } from "react";
import Loader from "../General/Loader";

function Dashboard() {
  const { data, isLoading } = useQuery(["getDashboardData"], () => getDashboardData());
  const { ref, onOpen, onClose } = useDialog();

  useEffect(() => {
    if (!!data?.params?.announcement?.title && !!data?.params?.announcement?.text) {
      onOpen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <div className="pb-40">
      {(!!data?.params?.announcement?.title && !!data?.params?.announcement?.text) && (
        <>
          {isLoading ? (
            <Loader isShowing={isLoading} />
          ) : (
            <Dialog title={data?.params?.announcement?.title} ref={ref} onClose={onClose}>
              <p className="text-13 leading-28 text-black font-r">
                {data?.params?.announcement?.text}
              </p>
            </Dialog>
          )}
        </>
      )}
      <PageTitle
        title="پیشخوان"
        icon={<i className="icon-Counter text-24" />}
        containerClassname="mb-16 "
        element={
          <LinkButton
            color="grey"
            leftIcon={<i className="icon-FlashLeft text-24 text-black" />}
            className="!pl-8 !pr-16 !py-6"
            href="/"
            // onClick={() => router.back()}
          >
            برو به صفحه اصلی
          </LinkButton>
        }
      />

      <div className="md:w-[320px] md:mx-auto">
        {isLoading ? (
          <DashboardSlider />
        ) : (
          !!data &&
          !!data?.params?.slides &&
          data?.params?.slides?.length !== 0 && (
            <DashboardPageSlider slides={data?.params?.slides} />
          )
        )}
      </div>

      <div className="mt-16 mb-24 ">
        <div className="grid grid-cols-12 gap-10">
          {isLoading ? <DashboardPageGrid /> : <Grid />}
        </div>
      </div>

      {/* <div className="flex items-center justify-between rounded-16 bg-primary-light py-10 pr-20 pl-10 mb-24">
        <div className="flex items-center gap-x-8">
          <Image alt="نوروز" src="/assets/non-icomoon-icons/nowruz.svg" width={40} height={40} />
          <p className="text-16 text-black leading-22 font-r">بروزرسانی قیمت نوروز</p>
        </div>
        <LinkButton href="/nowruz-pricing">بروزرسانی</LinkButton>
      </div> */}

      {isLoading ? (
        <PendingRequestsSkeleton />
      ) : (
        !!data &&
        data?.params?.guest_current_requests && (
          <PendingRequests
            data={
              data?.params?.host_current_requests.map((r: any) => ({
                title: r.product.name,
                from: miladiToJalali(r.start_date),
                to: miladiToJalali(r.end_date),
                reserveId: r.id,
                image: r?.product?.image_url,
                expiry_date: r?.expiry_date,
              })) || []
            }
          />
        )
      )}

      {isLoading ? (
        <DashboardPageProfileSkeleton />
      ) : (
        !!data && (
          <Profile
            avatarNeedsChange={!data?.params?.partner?.has_avatar}
            shabaNeedsChange={!data?.params?.partner?.has_shaba}
            national_card_image_NeedsChange={!data?.params?.partner?.has_national_card_image}
          />
        )
      )}

      {isLoading ? (
        <IncompleteResidencesSkeleton />
      ) : (
        !!data &&
        data?.params?.new_residences?.length !== 0 && (
          <IncompleteResidences
            incompleteResidencesData={data?.params?.new_residences
              ?.filter((r: any) => r.completion_percent !== 100)
              ?.slice(0, 3)
              ?.map((residence: any) => {
                return {
                  title: residence.name,
                  updateDate: residence.last_update,
                  completePercentage: residence.completion_percent || 0,
                  residenceId: residence.id,
                  link: `/residences/submit?step=${residence.step}&productId=${residence.id}`,
                  residenceImage: residence.image_url,
                };
              })}
          />
        )
      )}

      {isLoading ? (
        <ResidencesWaitingForExpertsConfirmSkeleton />
      ) : (
        !!data &&
        data?.params?.new_residences?.length !== 0 && (
          <ResidencesWaitingForExpertsConfirm
            residencesWaitingForExpertsConfirmData={data?.params?.new_residences
              ?.filter((r: any) => r.completion_percent === 100)
              ?.slice(0, 3)
              ?.map((residence: any) => {
                return {
                  title: residence.name,
                  updateDate: residence.last_update,
                  completePercentage: residence.completion_percent || 0,
                  residenceId: residence.id,
                  // TODO: apply res_type to below link
                  link: `residences/${residence.id}/edit?residenceType=product`,
                  residenceImage: residence.image_url,
                };
              })}
          />
        )
      )}

      {isLoading ? (
        <ReviewsSkeleton />
      ) : (
        <GuestsComments pendingReviewsN={data?.params?.pending_reviews || 0} />
      )}

      {isLoading ? (
        <ConversationsSkeleton />
      ) : (
        <Conversations pendingConversationsN={data?.params?.pending_messages || 0} />
      )}
    </div>
  );
}

export default Dashboard;
