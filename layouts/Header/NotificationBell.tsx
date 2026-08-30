import { useQuery } from "@tanstack/react-query";
import { getUnreadNotificationCount } from "@/api/Notification";

/**
 * The bell, with its unread count.
 *
 * It was a bare `<i>` with an onClick: no count, no accessible name, and not
 * reachable from the keyboard — so the only way to learn you had a
 * notification was to open the panel and look.
 *
 * A poll rather than a stream. Notifications arrive from booking and review
 * events that a person causes minutes apart, not from someone typing, so a
 * minute of latency costs nothing and a second SSE connection alongside the
 * chat one would.
 */

const POLL_MS = 60_000;

function NotificationBell({
  isLight,
  isOpen,
  onToggle,
  buttonRef,
}: {
  isLight?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  buttonRef: React.MutableRefObject<any>;
}) {
  const { data: count = 0 } = useQuery({
    queryKey: ["notificationsUnread"],
    queryFn: getUnreadNotificationCount,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
  });

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label={count > 0 ? `اعلان‌ها، ${count.toLocaleString("fa-IR")} خوانده‌نشده` : "اعلان‌ها"}
      className="relative flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main rounded-8"
    >
      <i
        aria-hidden="true"
        className={`icon-Bell cursor-pointer text-24 hover:text-primary-main ${
          isLight ? "text-white" : "text-black"
        }`}
      />
      {count > 0 && (
        <span className="absolute -left-6 -top-4 flex h-16 min-w-[16px] items-center justify-center rounded-full bg-primary-main px-4 text-10 leading-14 font-m text-white">
          {count > 99 ? "۹۹+" : count.toLocaleString("fa-IR")}
        </span>
      )}
    </button>
  );
}

export default NotificationBell;
