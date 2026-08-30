import { useCallback, useMemo, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  archiveAllNotifications,
  archiveNotification,
  getNotifications,
  markNotificationsRead,
  type INotification,
} from "@/api/Notification";
import PageTitle from "components/General/PageTitle";
import { Button } from "components/General/core/Button";
import UnHappyMessage from "../General/UnHappyMessage";
import { TinyLoader } from "../General/Loader/TinyLoader";
import NotificationItem from "./NotificationItem";

/**
 * The notifications page.
 *
 * What this replaces was 671 lines of Odoo-era scaffolding: ten BottomSheet
 * components rendered with hardcoded sample data ("سیامک احمدی", a 15,500,000
 * toman booking) that no code path could ever open, two disagreeing type maps,
 * and a fetch against an endpoint the new backend never implemented — so the
 * page's only real behaviour was an error toast on load.
 *
 * A notification's whole job is to say what happened and get out of the way,
 * so a row is a line of text and a link. Anything that needs a panel to
 * explain it has a page of its own to link to.
 */

const PAGE_SIZE = 20;

function Notifications() {
  const queryClient = useQueryClient();
  const [archived, setArchived] = useState(false);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ["notifications", archived],
    queryFn: ({ pageParam }) =>
      getNotifications({ archived, cursor: pageParam as number | undefined, take: PAGE_SIZE }),
    getNextPageParam: (last) => last.next_cursor ?? undefined,
    keepPreviousData: true,
  });

  const items: INotification[] = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data]
  );
  const unreadCount = items.filter((n) => !n.is_read).length;

  // Both lists and the header badge move together after any of these.
  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    queryClient.invalidateQueries({ queryKey: ["notificationsUnread"] });
  }, [queryClient]);

  const readAll = useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: refresh,
    onError: () => toast.error("انجام نشد. دوباره تلاش کنید."),
  });

  const readOne = useMutation({
    mutationFn: (id: number) => markNotificationsRead([id]),
    onSuccess: refresh,
  });

  const archiveOne = useMutation({
    mutationFn: (id: number) => archiveNotification(id, !archived),
    onSuccess: refresh,
    onError: () => toast.error("انجام نشد. دوباره تلاش کنید."),
  });

  const archiveEverything = useMutation({
    mutationFn: () => archiveAllNotifications(),
    onSuccess: refresh,
    onError: () => toast.error("انجام نشد. دوباره تلاش کنید."),
  });

  return (
    <div className="pb-40">
      <PageTitle
        title="اعلانات"
        icon={<i aria-hidden="true" className="icon-Bell text-24" />}
        containerClassname="mb-16"
      />

      {/* Two states, so a tab pair rather than a switch: "archived" is a place
          to go, not a setting to turn on. */}
      <div
        role="tablist"
        aria-label="نمای اعلان‌ها"
        className="mb-16 flex items-center gap-x-8 border-b-1 border-solid border-gray-EFEFEF"
      >
        {[
          { key: false, label: "اعلان‌ها" },
          { key: true, label: "بایگانی" },
        ].map((tab) => (
          <button
            key={String(tab.key)}
            role="tab"
            type="button"
            aria-selected={archived === tab.key}
            onClick={() => setArchived(tab.key)}
            className={`-mb-1 border-b-2 border-solid px-12 pb-12 pt-8 text-14 leading-20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main ${
              archived === tab.key
                ? "border-b-primary-main font-m text-primary-main"
                : "border-b-transparent font-r text-gray-6C6A7D hover:text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}

        {!archived && items.length > 0 && (
          <div className="mr-auto flex items-center gap-x-4 pb-8">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => readAll.mutate()}
                disabled={readAll.isLoading}
                className="rounded-8 px-10 py-6 text-13 leading-20 font-r text-primary-main transition-colors hover:bg-gray-F5F5F7 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
              >
                خواندن همه
              </button>
            )}
            <button
              type="button"
              onClick={() => archiveEverything.mutate()}
              disabled={archiveEverything.isLoading}
              className="rounded-8 px-10 py-6 text-13 leading-20 font-r text-gray-6C6A7D transition-colors hover:bg-gray-F5F5F7 hover:text-black disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
            >
              بایگانی همه
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <TinyLoader />
      ) : items.length === 0 ? (
        <UnHappyMessage
          title={archived ? "اعلان بایگانی‌شده‌ای ندارید" : "هنوز اعلانی برایتان نیامده"}
          iconSrc="/assets/No-notif.svg"
          containerClassname="py-[40px]"
        />
      ) : (
        <>
          <div className="rounded-16 border-1 border-solid border-gray-EFEFEF bg-white p-8">
            {items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={(id) => readOne.mutate(id)}
                onArchive={(id) => archiveOne.mutate(id)}
              />
            ))}
          </div>

          {hasNextPage && (
            <Button
              className="mt-24"
              isFullWidth
              variant="outlined"
              color="black"
              isLoading={isFetchingNextPage}
              loadingText="در حال دریافت"
              onClick={() => fetchNextPage()}
            >
              نمایش بیشتر
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default Notifications;
