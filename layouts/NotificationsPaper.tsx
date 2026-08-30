import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationsRead } from "@/api/Notification";
import { TinyLoader } from "@/components/General/Loader/TinyLoader";
import UnHappyMessage from "@/components/General/UnHappyMessage";
import NotificationItem from "@/components/Notifications/NotificationItem";
import { UserType_enum, useUserProfile } from "@/providers/Profile";

/**
 * The header's notification dropdown: the five most recent, and a way to the
 * full page.
 *
 * No archive control and no tabs. This is a glance, and every control here is
 * one the reader has to aim at inside a small floating panel; the page has
 * room for them.
 */
const PREVIEW_COUNT = 5;

function NotificationsPaper({
  setShowNotificationsPaper,
}: {
  setShowNotificationsPaper: Dispatch<SetStateAction<boolean>>;
}) {
  const profile = useUserProfile();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", false, "preview"],
    queryFn: () => getNotifications({ take: PREVIEW_COUNT }),
    enabled: profile.user_type === UserType_enum.AUTH,
  });

  const items = data?.items ?? [];
  const hasUnread = items.some((n) => !n.is_read);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notificationsUnread"] });
  };

  return (
    <div>
      <div className="mb-12 flex items-center justify-between">
        <div className="flex items-center gap-x-8">
          <i aria-hidden="true" className="icon-Bell text-20" />
          <h2 className="text-14 leading-20 font-m text-black">اعلانات</h2>
        </div>

        {hasUnread && (
          <button
            type="button"
            onClick={async () => {
              await markNotificationsRead();
              refresh();
            }}
            className="rounded-8 px-8 py-4 text-12 leading-18 font-r text-primary-main transition-colors hover:bg-gray-F5F5F7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
          >
            خواندن همه
          </button>
        )}
      </div>

      {isLoading ? (
        <TinyLoader />
      ) : items.length === 0 ? (
        <UnHappyMessage
          title="هنوز اعلانی برایتان نیامده"
          iconSrc="/assets/No-notif.svg"
          containerClassname="py-24"
        />
      ) : (
        <>
          <div className="-mx-4">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={async (id) => {
                  await markNotificationsRead([id]);
                  refresh();
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setShowNotificationsPaper(false);
              router.push("/notifications");
            }}
            className="mt-12 flex w-full items-center justify-center gap-x-8 rounded-12 border-1 border-solid border-gray-EFEFEF py-10 text-13 leading-20 font-m text-black transition-colors hover:bg-gray-F5F5F7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
          >
            مشاهده همه اعلانات
          </button>
        </>
      )}
    </div>
  );
}

export default NotificationsPaper;
