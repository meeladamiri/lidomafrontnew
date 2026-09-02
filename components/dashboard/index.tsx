import PageTitle from "components/General/PageTitle";
import Grid from "components/dashboard/Grid";
import PendingRequests from "components/dashboard/PendingRequests";
import { LinkButton } from "components/General/core/Button";
import ProfileCompletion from "components/dashboard/ProfileCompletion";
import CurrentReservations from "components/dashboard/CurrentReservations";
import Announcements from "components/dashboard/Announcements";
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
  const { data, isLoading, refetch } = useQuery(["getDashboardData"], () => getDashboardData());
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

      {/* Above everything: a notice below the fold is a notice nobody reads. */}
      {!isLoading && <Announcements items={data?.params?.announcements} />}

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
          {isLoading ? <DashboardPageGrid /> : <Grid isHost={!!data?.params?.partner?.is_host} badges={data?.params?.badges} />}
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
          <ProfileCompletion
            hasAvatar={!!data?.params?.partner?.has_avatar}
            hasShaba={!!data?.params?.partner?.has_shaba}
            hasNationalCard={!!data?.params?.partner?.has_national_card_image}
            isHost={!!data?.params?.partner?.is_host}
            avatarUrl={data?.params?.partner?.image_url}
            onDone={() => refetch()}
          />
        )
      )}

      {/* Current bookings — the thing a person opens this page to see. The
          guest list is shown to everyone, because every host is also a guest
          sometimes; the host list only to hosts, and each hides when empty. */}
      {!isLoading && !!data?.params?.guest_current_requests?.length && (
        <CurrentReservations
          title="سفرهای جاری شما"
          icon="icon-Reserve"
          emptyHref="/my-trips"
          rows={data.params.guest_current_requests}
          hrefFor={(r: any) => `/my-trips/${r.id}`}
        />
      )}

      {!isLoading &&
        !!data?.params?.partner?.is_host &&
        !!data?.params?.host_current_requests?.length && (
          <CurrentReservations
            title="رزروهای جاری اقامتگاه‌های شما"
            icon="icon-Homes"
            emptyHref="/reservations"
            rows={data.params.host_current_requests}
            hrefFor={(r: any) => `/reservations/${r.id}`}
          />
        )}

      {isLoading ? (
        <IncompleteResidencesSkeleton />
      ) : (
        !!data &&
        // `new_residences` is the DRAFT list and nothing else, so its length is
        // the right test. It used to be split at completion_percent === 100,
        // with the 100% half feeding the "awaiting expert" section below —
        // which meant a draft the host had filled in but never submitted was
        // reported as sitting with a reviewer, and the genuinely pending
        // listings (`residences_waiting_confirm`, built by the backend all
        // along) were rendered nowhere.
        !!data?.params?.partner?.is_host &&
        data?.params?.new_residences?.length > 0 && (
          <IncompleteResidences
            incompleteResidencesData={data?.params?.new_residences
              ?.slice(0, 3)
              ?.map((residence: any) => {
                return {
                  title: residence.name,
                  updateDate: residence.last_update,
                  completePercentage: residence.completion_percent || 0,
                  residenceId: residence.internal_id ?? residence.id,
                  // internal_id, not id: the wizard and every host endpoint
                  // take the primary key, while `id` is the public (Odoo) one.
                  link: `/residences/submit?productId=${residence.internal_id ?? residence.id}`,
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
        !!data?.params?.partner?.is_host &&
        data?.params?.residences_waiting_confirm?.length > 0 && (
          <ResidencesWaitingForExpertsConfirm
            residencesWaitingForExpertsConfirmData={data?.params?.residences_waiting_confirm
              ?.slice(0, 3)
              ?.map((residence: any) => {
                return {
                  title: residence.name,
                  updateDate: residence.last_update,
                  completePercentage: 100,
                  residenceId: residence.internal_id ?? residence.id,
                  link: `/residences/submit?productId=${residence.internal_id ?? residence.id}`,
                  residenceImage: residence.image_url,
                };
              })}
          />
        )
      )}

      {/* "نظرات مهمان‌ها" is about reviews left ON a host's listings — there is
          nothing there for someone who has never hosted. */}
      {!!data?.params?.partner?.is_host &&
        (isLoading ? (
          <ReviewsSkeleton />
        ) : (
          <GuestsComments pendingReviewsN={data?.params?.pending_reviews || 0} />
        ))}

      {isLoading ? (
        <ConversationsSkeleton />
      ) : (
        <Conversations pendingConversationsN={data?.params?.pending_messages || 0} />
      )}

      {/* The one thing a guest's dashboard should offer that a host's should
          not. Placed last: an invitation, not an interruption. */}
      {!isLoading && !!data && !data?.params?.partner?.is_host && (
        <div className="py-16">
          <div className="rounded-16 bg-primary-light p-20">
            <p className="text-16 leading-26 text-black font-m mb-4">
              اقامتگاه دارید؟ میزبان شوید
            </p>
            <p className="text-13 leading-22 text-gray-6C6A7D mb-14">
              اقامتگاهتان را ثبت کنید و از همین صفحه رزروها، تقویم و درآمدتان را مدیریت کنید.
            </p>
            <LinkButton href="/residences/submit" className="!w-auto !px-20">
              ثبت اقامتگاه
            </LinkButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
