import { THandleSmoothClose } from "components/General/core/BottomSheet";
const BottomSheet = dynamic(() => import("components/General/core/BottomSheet"), { ssr: true });
import { Button } from "components/General/core/Button";
import PageTitle from "components/General/PageTitle";
import { useEffect, useState } from "react";
const BankTransactionBottomSheet = dynamic(
  () => import("components/Notifications/BankTransactionBottomSheet"),
  { ssr: true }
);
const CalendarUpdateBottomSheet = dynamic(
  () => import("components/Notifications/CalendarUpdateBottomSheet"),
  { ssr: true }
);
const CancelledReserveBottomSheet = dynamic(
  () => import("components/Notifications/CancelledReserveBottomSheet"),
  { ssr: true }
);
const ConfirmedReserveBottomSheet = dynamic(
  () => import("components/Notifications/ConfirmedReserveBottomSheet"),
  { ssr: true }
);
const NewCommentBottomSheet = dynamic(
  () => import("components/Notifications/NewCommentBottomSheet"),
  { ssr: true }
);
const NewMessageBottomSheet = dynamic(
  () => import("components/Notifications/NewMessageBottomSheet"),
  { ssr: true }
);
const NewReserveRequestBottomSheet = dynamic(
  () => import("components/Notifications/NewReserveRequestBottomSheet"),
  { ssr: true }
);
const NotificationItem = dynamic(() => import("components/Notifications/NotificationItem"), {
  ssr: true,
});
const ProfileUpdateBottomSheet = dynamic(
  () => import("components/Notifications/ProfileUpdateBottomSheet"),
  { ssr: true }
);
const ResidanceSubmissionBottomSheet = dynamic(
  () => import("components/Notifications/ResidanceSubmissionBottomSheet"),
  { ssr: true }
);
const TasfieWalletBottomSheet = dynamic(
  () => import("components/Notifications/TasfieWalletBottomSheet"),
  { ssr: true }
);
import { Switch } from "components/General/core/Switch";
import { useQuery } from "@tanstack/react-query";
import { getNotificationsList, I_SERVER_NOTIF } from "@/api/Notification";
import exception from "@/utilities/exception";
import { defaultError, EXCEPTIONTYPES } from "@/constants/enums/exception_types";
import { NotificationStatus_enum } from "@/constants/enums/notification_status";
import { renderPagination } from "@/utilities/Pagination";
import UnHappyMessage from "../General/UnHappyMessage";
import { miladiToJalali } from "@/utilities/dateTools";
import { TinyLoader } from "../General/Loader/TinyLoader";
import Image from "next/image";
import dynamic from "next/dynamic";

interface IResidanceSubmission {
  show: boolean;
  isSuccess: null | boolean;
  residenceId: number;
  residenceName: string;
  image: string;
  residenceCode: number;
  rejectReason: string;
}

interface ICalendarUpdate {
  show: boolean;
  text: string;
}

interface ITasfieWallet {
  show: boolean;
  isSuccess: null | boolean;
  rejectReason?: string;
}

interface IBankTransaction {
  show: boolean;
  isSuccess: boolean | null;
  price: number;
  cartNumber?: string;
  reserveCode: number;
  date: string;
  rejectReason?: string;
}

const calendarUpdateInitialValues = {
  show: false,
  text: "",
};

const tasfieWalletInitialValues = {
  show: false,
  isSuccess: null,
  rejectReason: "",
};

const bankTransactionInitialValues = {
  show: false,
  isSuccess: null,
  rejectReason: "",
  cartNumber: "",
  reserveCode: 0,
  date: "",
  price: 0,
};

const residanceSubmissionInitialValues = {
  show: false,
  isSuccess: null,
  residenceId: 0,
  residenceName: "",
  image: "",
  residenceCode: 0,
  rejectReason: "",
};

const NotificationTypes = [
  {
    type: "new_reserve_request",
    fa_name: "درخواست رزرو جدید",
    icon: <i className="icon-Reserve text-24 text-primary-main" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "reserve_confirmed",
    fa_name: "ثبت رزرو قطعی",
    icon: <i className="icon-Success text-24 text-success" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "reserve_cancelled",
    fa_name: "لغو درخواست رزرو",
    icon: <i className="icon-Error text-24 text-error-light" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "new_comment",
    fa_name: "نظر جدید از سوی کاربران",
    icon: <i className="icon-Comments text-24 text-black" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "new_message",
    fa_name: "پیام از سوی مهمان",
    icon: <i className="icon-message text-24 text-black" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "transaction_success",
    fa_name: "تراکنش بانکی موفق",
    icon: <i className="icon-Pay text-24 text-success" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "transaction_failure",
    fa_name: "تراکنش بانکی ناموفق",
    icon: <i className="icon-Pay text-24 text-error-light" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "residence_submit_success",
    fa_name: "ثبت موفق اقامتگاه",
    icon: <i className="icon-Reserve text-24 text-primary-main" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "residence_submit_failure",
    fa_name: "ثبت ناموفق اقامتگاه",
    icon: <i className="icon-Reserve text-24 text-primary-main" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "update_calendar",
    fa_name: "بروزرسانی تقویم",
    icon: <i className="icon-Calendar text-24 text-black" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "tasfie_request_success",
    fa_name: "درخواست تسویه کیف پول",
    icon: <i className="icon-CardBank text-24 text-green" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "tasfie_request_failure",
    fa_name: "درخواست تسویه کیف پول",
    icon: <i className="icon-CardBank text-24 text-error-light" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "confirmed_reserve_reminder",
    fa_name: "یادآوری رزرو قطعی",
    icon: <i className="icon-Reserve text-24 text-warning" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
  {
    type: "update_profile",
    fa_name: "بروزرسانی پروفایل",
    icon: <i className="icon-Profile text-24 text-black" />,
    serverName: "",
    howManyDaysBefore: 3,
  },
];

const initialPageSize = 10;

export const ServerNotif_Types_Map_ToLocal: {
  [
    // NOTE: keys which start with "host-*" are host-related notifications. And keys which start with "guest-*" are guest-related notifications.
    key: string
  ]: { icon: JSX.Element; title: string };
} = {
  // START OF 'HOST' NOTIFICATION TEMPLATES
  host_new_reserve: {
    icon: <i className="icon-Reserve text-24 text-black" />,
    title: "درخواست رزرو جدید",
  },
  host_approve_reserve: {
    icon: <i className="icon-Success text-24 text-black" />,
    title: "ثبت رزرو قطعی",
  },
  host_expired_reserve: {
    icon: <i className="icon-Error text-24 text-black" />,
    title: "رزرو منقضی شده",
  },
  host_confirmed_reserve: {
    icon: <i className="icon-Success text-24 text-black" />,
    title: "رزرو قطعی شده",
  },
  host_canceled_reserve: {
    icon: <i className="icon-Error text-24 text-black" />,
    title: "رزرو لغو شده",
  },
  host_reject_reserve: {
    icon: <i className="icon-Error text-24 text-black" />,
    title: "رزرو رد شده",
  },
  host_new_review: {
    icon: <Image width={24} height={24} alt="" src={"/assets/non-icomoon-icons/comment2.svg"} />,
    title: "نظر جدید",
  },
  host_new_message: {
    icon: <i className="icon-message text-24 text-black" />,
    title: "پیام جدید",
  },
  host_succeed_transaction: {
    icon: <i className="icon-Pay text-24 text-black" />,
    title: "تراکنش موفق",
  },
  host_failed_transaction: {
    icon: <i className="icon-Pay text-24 text-black" />,
    title: "تراکنش ناموفق",
  },
  host_new_residence: {
    icon: <i className="icon-AddHome text-24 text-black" />,
    title: "ثبت موفق اقامتگاه",
  },
  host_failed_new_residence: {
    icon: <i className="icon-AddHome text-24 text-black" />,
    title: "ثبت ناموفق اقامتگاه",
  },
  host_publish_residence: {
    icon: <i className="icon-AddHome text-24 text-black" />,
    title: "انتشار موفق اقامتگاه",
  },
  host_update_calendar: {
    icon: <i className="icon-Calendar text-24 text-black" />,
    title: "بروزرسانی تقویم",
  },
  host_succeed_checkout: {
    icon: <i className="icon-CardBank text-24 text-black" />,
    title: "تسوبه کیف پول",
  },
  host_failed_checkout: {
    icon: <i className="icon-CardBank text-24 text-black" />,
    title: "رد درخواست تسویه کیف پول",
  },
  host_update_profile: {
    icon: <i className="icon-Profile text-24 text-black" />,
    title: "بروزرسانی پروفایل",
  },
  host_remind_reserve: {
    icon: <i className="icon-Reserve text-24 text-black" />,
    title: "یادآوری رزرو قطعی",
  },
  host_happy_new_year: {
    icon: <i className="icon-Gift text-24 text-black" />,
    title: "تبریک سال نو",
  },
  // END OF 'HOST' NOTIFICATION TEMPLATES
  // START OF 'GUEST' NOTIFICATION TEMPLATES
  guest_new_reserve: {
    icon: <i className="icon-Reserve text-24 text-black" />,
    title: "ثبت درخواست جدید",
  },
  guest_approve_reserve: {
    icon: <i className="icon-Reserve text-24 text-black" />,
    title: "تایید رزرو از سوی میزبان",
  },
  guest_expired_reserve: {
    icon: <i className="icon-Error text-24 text-black" />,
    title: "رزرو منقضی شده",
  },
  guest_confirmed_reserve: {
    icon: <i className="icon-Success text-24 text-black" />,
    title: "رزرو قطعی شده",
  },
  guest_canceled_reserve: {
    icon: <i className="icon-Error text-24 text-black" />,
    title: "رزرو لغو شده",
  },
  guest_reject_reserve: {
    icon: <i className="icon-Error text-24 text-black" />,
    title: "رزرو رد شده",
  },
  guest_new_review: {
    icon: <Image width={24} height={24} alt="" src={"/assets/non-icomoon-icons/comment2.svg"} />,
    title: "نظر جدید",
  },
  guest_new_message: {
    icon: <i className="icon-message text-24 text-black" />,
    title: "پیام جدید",
  },
  guest_succeed_transaction: {
    icon: <i className="icon-Pay text-24 text-black" />,
    title: "تراکنش موفق",
  },
  guest_failed_transaction: {
    icon: <i className="icon-Pay text-24 text-black" />,
    title: "تراکنش ناموفق",
  },
  guest_suggestions: {
    icon: <i className="icon-Home text-24 text-black" />,
    title: "اقامتگاه های پیشنهادی",
  },
  guest_update_profile: {
    icon: <i className="icon-Profile text-24 text-black" />,
    title: "بروزرسانی پروفایل",
  },
  guest_remind_reserve: {
    icon: <i className="icon-Reserve text-24 text-black" />,
    title: "یادآوری رزرو قطعی",
  },
  guest_happy_new_year: {
    icon: <i className="icon-Gift text-24 text-black" />,
    title: "تبریک سال نو",
  },
  // END OF 'GUEST' NOTIFICATION TEMPLATES
};

function Notifications() {
  const [showNewReserveRequestBottomSheet, setShowNewReserveRequestBottomSheet] = useState(false);
  const [showConfirmedReserveBottomSheet, setShowConfirmedReserveBottomSheet] = useState(false);
  const [showCancelledReserveBottomSheet, setShowCancelledReserveBottomSheet] = useState(false);
  const [showNewCommentBottomSheet, setShowNewCommentBottomSheet] = useState(false);
  const [showNewMessageBottomSheet, setShowNewMessageBottomSheet] = useState(false);
  const [showResidanceSubmissionBottomSheet, setShowResidanceSubmissionBottomSheet] =
    useState<IResidanceSubmission>(residanceSubmissionInitialValues);
  const [showCalendarUpdateBottomSheet, setShowCalendarUpdateBottomSheet] =
    useState<ICalendarUpdate>(calendarUpdateInitialValues);
  const [showProfileUpdateBottomSheet, setShowProfileUpdateBottomSheet] = useState(false);
  const [tasfieWalletBottomSheet, setTasfieWalletBottomSheet] =
    useState<ITasfieWallet>(tasfieWalletInitialValues);
  const [bankTransactionBottomSheet, setBankTransactionBottomSheet] = useState<IBankTransaction>(
    bankTransactionInitialValues
  );

  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const { data, isSuccess, isLoading } = useQuery(
    ["getNotificationsList", showArchived, page, pageSize],
    () =>
      getNotificationsList({
        status: !!showArchived ? NotificationStatus_enum.ARCHIVED : NotificationStatus_enum.ACTIVE,
        page,
        page_size: pageSize,
      }),
    {
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    if (!!data) {
      if (data?.status === "success") {
        // console.log("In success of getNotificationsList, data is: ", data);
      } else {
        exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
      }
    }
  }, [data]);

  return (
    <>
      <div className="pb-40">
        <PageTitle
          title="اعلانات"
          icon={<i className="icon-Bell text-24" />}
          containerClassname="mb-16"
          element={
            <div>
              <Switch
                name={"range-select"}
                label={"نمایش بایگانی شده ها"}
                checked={showArchived}
                onChange={(e) => {
                  setShowArchived(e.target.checked);
                }}
              />
            </div>
          }
        />

        {isLoading ? (
          <TinyLoader />
        ) : data?.params?.notifications.length === 0 ? (
          <UnHappyMessage
            title={
              !!showArchived ? "هنوز اعلان بایگانی شده ای نداری !" : "هنوز اعلانی نیومده برات !"
            }
            // iconSrc={activeTab === 0 ? "/assets/No-comment.svg" : "/assets/No-comment.svg"}
            iconSrc={"/assets/No-notif.svg"}
            containerClassname="py-[40px]"
          />
        ) : (
          data?.params?.notifications
            ?.slice(0, pageSize * page)
            ?.map((notif: I_SERVER_NOTIF, i: number) => {
              return (
                <NotificationItem
                  key={`${notif.id}-${i}`}
                  name={ServerNotif_Types_Map_ToLocal[notif.template]?.title}
                  icon={ServerNotif_Types_Map_ToLocal[notif.template]?.icon}
                  time={miladiToJalali(notif.date)}
                  desc={notif.text}
                  // onClick={() => setShowProperNotifBottomSheet()}
                />
              );
            })
        )}

        {!!renderPagination(page, pageSize, data?.params?.total) && (
          <Button
            className="mt-24"
            isFullWidth
            variant="outlined"
            color="black"
            onClick={() => setPageSize((prev) => prev + 10)}
          >
            نمایش بیشتر
          </Button>
        )}
      </div>

      <BottomSheet
        open={showNewReserveRequestBottomSheet}
        handleClose={() => setShowNewReserveRequestBottomSheet(false)}
        headerTitle="درخواست رزرو جدید"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <NewReserveRequestBottomSheet
              handleSmoothClose={handleSmoothClose}
              residenceName={"اقامتگاه دوخوابه گلشن 2"}
              guestName="سیامک احمدی"
              stayTime={1}
              mainGuestsN={2}
              extraGuestsN={3}
              price={15500000}
              date={"10 مرداد تا 11 مرداد 1401"}
            />
          );
        }}
      />
      {/* 
      <BottomSheet
        open={showNotificationDetailsBottomSheet}
        handleClose={() => setShowNewReserveRequestBottomSheet(false)}
        headerTitle="درخواست رزرو جدید"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <NewReserveRequestBottomSheet
              handleSmoothClose={handleSmoothClose}
              residenceName={"اقامتگاه دوخوابه گلشن 2"}
              guestName="سیامک احمدی"
              stayTime={1}
              mainGuestsN={2}
              extraGuestsN={3}
              price={15500000}
              date={"10 مرداد تا 11 مرداد 1401"}
            />
          );
        }}
      /> */}

      <BottomSheet
        open={showConfirmedReserveBottomSheet}
        handleClose={() => setShowConfirmedReserveBottomSheet(false)}
        headerTitle="ثبت رزرو قطعی"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <ConfirmedReserveBottomSheet
              handleSmoothClose={handleSmoothClose}
              residenceName={"اقامتگاه دوخوابه گلشن 2"}
              guestName="سیامک احمدی"
              stayTime={1}
              mainGuestsN={2}
              extraGuestsN={3}
              price={15500000}
              date={"10 مرداد تا 11 مرداد 1401"}
            />
          );
        }}
      />

      <BottomSheet
        open={showCancelledReserveBottomSheet}
        handleClose={() => setShowCancelledReserveBottomSheet(false)}
        headerTitle="لغو درخواست"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <CancelledReserveBottomSheet
              handleSmoothClose={handleSmoothClose}
              residenceName={"اقامتگاه دوخوابه گلشن 2"}
              guestName="سیامک احمدی"
              stayTime={1}
              mainGuestsN={2}
              extraGuestsN={3}
              price={15500000}
              date={"10 مرداد تا 11 مرداد 1401"}
            />
          );
        }}
      />

      <BottomSheet
        open={showNewCommentBottomSheet}
        handleClose={() => setShowNewCommentBottomSheet(false)}
        headerTitle="نظر جدید"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <NewCommentBottomSheet
              handleSmoothClose={handleSmoothClose}
              residenceName={"اقامتگاه دوخوابه گلشن 2"}
              guestName="سیامک احمدی"
              date={"10 مرداد تا 11 مرداد 1401"}
            />
          );
        }}
      />

      <BottomSheet
        open={showNewMessageBottomSheet}
        handleClose={() => setShowNewMessageBottomSheet(false)}
        headerTitle="پیام جدید"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <NewMessageBottomSheet
              handleSmoothClose={handleSmoothClose}
              residenceName={"اقامتگاه دوخوابه گلشن 2"}
              guestName="سیامک احمدی"
              date={"10 مرداد تا 11 مرداد 1401"}
            />
          );
        }}
      />

      <BottomSheet
        open={!!showResidanceSubmissionBottomSheet.show}
        handleClose={() => setShowResidanceSubmissionBottomSheet(residanceSubmissionInitialValues)}
        headerTitle={
          !!showResidanceSubmissionBottomSheet.isSuccess
            ? "ثبت موفق اقامتگاه"
            : "ثبت ناموفق اقامتگاه"
        }
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <ResidanceSubmissionBottomSheet
              handleSmoothClose={handleSmoothClose}
              residenceName={" دوخوابه گلشن 2"}
              image="/assets/tmp/residence-1.webp"
              isSuccess={!!showResidanceSubmissionBottomSheet.isSuccess}
              residenceCode={1566654}
              residenceId={2}
              rejectReason="عدم وجود تصاویر مناسب"
            />
          );
        }}
      />

      <BottomSheet
        open={!!showCalendarUpdateBottomSheet.show}
        handleClose={() => setShowCalendarUpdateBottomSheet(calendarUpdateInitialValues)}
        headerTitle="بروزرسانی تقویم"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <CalendarUpdateBottomSheet
              handleSmoothClose={handleSmoothClose}
              text={showCalendarUpdateBottomSheet.text}
            />
          );
        }}
      />

      <BottomSheet
        open={showProfileUpdateBottomSheet}
        handleClose={() => setShowProfileUpdateBottomSheet(false)}
        headerTitle="بروزرسانی پروفایل"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return <ProfileUpdateBottomSheet handleSmoothClose={handleSmoothClose} />;
        }}
      />

      <BottomSheet
        open={!!tasfieWalletBottomSheet.show}
        handleClose={() => setTasfieWalletBottomSheet(tasfieWalletInitialValues)}
        headerTitle="تسویه کیف پول"
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <TasfieWalletBottomSheet
              handleSmoothClose={handleSmoothClose}
              isSuccess={!!tasfieWalletBottomSheet.isSuccess}
              rejectReason={tasfieWalletBottomSheet.rejectReason}
            />
          );
        }}
      />

      <BottomSheet
        open={!!bankTransactionBottomSheet.show}
        handleClose={() => setBankTransactionBottomSheet(bankTransactionInitialValues)}
        headerTitle={
          !!bankTransactionBottomSheet.isSuccess ? "تراکنش بانکی موفق" : "تراکنش بانکی ناموفق"
        }
        body={({ handleSmoothClose }: { handleSmoothClose: THandleSmoothClose }) => {
          return (
            <BankTransactionBottomSheet
              handleSmoothClose={handleSmoothClose}
              isSuccess={!!bankTransactionBottomSheet.isSuccess}
              rejectReason={bankTransactionBottomSheet.rejectReason}
              date="19 فروردین 1401 - 15:35"
            />
          );
        }}
      />
    </>
  );
}

export default Notifications;
