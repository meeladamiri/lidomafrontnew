import { I_SERVER_NOTIF, getNotificationsList } from "@/api/Notification";
import GoToFlash from "@/components/General/GoToFlash";
import { TinyLoader } from "@/components/General/Loader/TinyLoader";
import PageTitle from "@/components/General/PageTitle";
import UnHappyMessage from "@/components/General/UnHappyMessage";
import { Switch } from "@/components/General/core/Switch";
import { ServerNotif_Types_Map_ToLocal } from "@/components/Notifications";
import NotificationItem from "@/components/Notifications/NotificationItem";
import { NotificationStatus_enum } from "@/constants/enums/notification_status";
import { UserType_enum, useUserProfile } from "@/providers/Profile";
import { miladiToJalali } from "@/utilities/dateTools";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction, useState } from "react";

function NotificationsPaper({
  setShowNotificationsPaper,
}: {
  setShowNotificationsPaper: Dispatch<SetStateAction<boolean>>;
}) {
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const profileData = useUserProfile();
  const router = useRouter();

  const { data, isSuccess, isLoading } = useQuery(
    ["getNotificationsList", showArchived, 1, 5],
    () =>
      getNotificationsList({
        status: !!showArchived ? NotificationStatus_enum.ARCHIVED : NotificationStatus_enum.ACTIVE,
        page: 1,
        page_size: 5,
      }),
    {
      enabled: profileData.user_type === UserType_enum.AUTH,
    }
  );

  // useEffect(() => {
  //   if (!!data) {
  //     if (data?.status === "success") {
  //       console.log("In success of getNotificationsList, data is: ", data);
  //     } else {
  //       // exception.message([{ type: EXCEPTIONTYPES.ERROR, title: data?.err_msg || defaultError }]);
  //     }
  //   }
  // }, [data]);

  return (
    <div>
      <div className="mb-24">
        <PageTitle
          title="اعلانات"
          icon={<i className="icon-Bell text-24" />}
          containerClassname="mb-16"
          element={
            <div>
              <Switch
                name={"show-archived"}
                label={"نمایش بایگانی شده ها"}
                checked={showArchived}
                onChange={(e) => {
                  setShowArchived(e.target.checked);
                }}
              />
            </div>
          }
        />
      </div>

      {isLoading ? (
        <TinyLoader />
      ) : data?.params?.notifications.length === 0 ? (
        <UnHappyMessage
          title={!!showArchived ? "هنوز اعلان بایگانی شده ای نداری !" : "هنوز اعلانی نیومده برات !"}
          // iconSrc={activeTab === 0 ? "/assets/No-comment.svg" : "/assets/No-comment.svg"}
          iconSrc={"/assets/No-notif.svg"}
          containerClassname="py-[40px]"
        />
      ) : (
        <>
          {data?.params?.notifications?.map((notif: I_SERVER_NOTIF, i: number) => {
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
          })}
          <div className="mt-24 flex items-center justify-between">
            <div className="flex items-center gap-x-8">
              <i className="text-24 icon-Bell" />

              <p className="text-14 leading-24 font-m text-black">مشاهده همه اعلانات</p>
            </div>

            <GoToFlash
              onClick={() => {
                setShowNotificationsPaper(false);
                router.push("/notifications");
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationsPaper;
