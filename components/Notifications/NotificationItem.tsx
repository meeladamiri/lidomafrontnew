import Link from "next/link";
import type { INotification } from "@/api/Notification";
import { relativeTime, styleFor } from "./kinds";

/**
 * One row.
 *
 * A notification that leads somewhere is a real `<Link>`, so it can be opened
 * in a new tab and reaches the keyboard. What this replaces was a div whose
 * only affordance was a decorative chevron with an empty onClick — every row
 * looked tappable and none of them were.
 */
function NotificationItem({
  notification,
  onArchive,
  onRead,
}: {
  notification: INotification;
  onArchive?: (id: number) => void;
  onRead?: (id: number) => void;
}) {
  const { icon, tone } = styleFor(notification.kind);
  const unread = !notification.is_read;

  const inner = (
    <>
      <span
        className={`mt-2 flex h-40 w-40 shrink-0 items-center justify-center rounded-full bg-gray-F5F5F7 ${tone}`}
      >
        <i aria-hidden="true" className={`${icon} text-20`} />
      </span>

      <span className="min-w-0 grow">
        <span className="mb-4 flex items-center gap-x-8">
          <span className="text-14 leading-20 font-m text-black">{notification.title}</span>
          {unread && (
            <span
              className="h-8 w-8 shrink-0 rounded-full bg-primary-main"
              // The dot is decorative; the state is announced in the text below.
              aria-hidden="true"
            />
          )}
          <span className="mr-auto shrink-0 text-11 leading-16 font-r text-gray-959FA7">
            {relativeTime(notification.created_at)}
          </span>
        </span>
        <span className="block text-13 leading-22 font-r text-gray-6C6A7D">{notification.body}</span>
        {unread && <span className="sr-only">خوانده نشده</span>}
      </span>
    </>
  );

  const rowClass = `flex items-start gap-x-12 rounded-12 p-12 transition-colors ${
    unread ? "bg-primary-main bg-opacity-[3%]" : ""
  }`;

  return (
    <div className="group flex items-start gap-x-4 border-b-1 border-solid border-gray-EFEFEF last:border-b-0">
      {notification.link_url ? (
        <Link
          href={notification.link_url}
          prefetch={false}
          onClick={() => unread && onRead?.(notification.id)}
          className={`${rowClass} grow hover:bg-gray-F5F5F7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main`}
        >
          {inner}
        </Link>
      ) : (
        <div className={`${rowClass} grow`}>{inner}</div>
      )}

      {onArchive && (
        <button
          type="button"
          aria-label={`بایگانی «${notification.title}»`}
          onClick={() => onArchive(notification.id)}
          className="mt-12 shrink-0 rounded-8 p-8 text-gray-959FA7 transition-colors hover:bg-gray-F5F5F7 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-main"
        >
          <i aria-hidden="true" className="icon-Hide text-18" />
        </button>
      )}
    </div>
  );
}

export default NotificationItem;
