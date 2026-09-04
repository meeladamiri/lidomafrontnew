import type { IConversationRow } from "@/api/chats";
import { listStampOf } from "./chatFormat";

/**
 * The left column: every thread, newest first.
 *
 * Each row is a button rather than a link because selecting a thread is a
 * shallow route change on the same page — a real navigation would drop the
 * loaded messages and the open stream.
 */

interface Props {
  items: IConversationRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function ConversationList({ items, selectedId, onSelect }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-24 py-40 text-center">
        <span className="flex h-64 w-64 items-center justify-center rounded-full bg-gray-F8F8F8">
          <i aria-hidden="true" className="icon-message text-28 text-gray-CACFD3" />
        </span>
        <p className="mt-16 text-14 leading-24 font-m text-black">هنوز چتی ندارید</p>
        <p className="mt-4 text-12 leading-20 font-r text-gray-77828F">
          با ثبت اولین رزرو، چت با میزبان همین‌جا باز می‌شود.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {items.map((row, index) => {
        const isActive = row.id === selectedId;
        const isSupport = row.type === "SUPPORT";
        const title = isSupport
          ? row.subject || "پشتیبانی لیدوماتریپ"
          : row.peer?.name || "کاربر لیدوماتریپ";

        return (
          <li
            key={row.id}
            className={index > 0 ? "border-t-1 border-solid border-gray-F0F0F0" : ""}
          >
            <button
              type="button"
              onClick={() => onSelect(row.id)}
              aria-current={isActive ? "true" : undefined}
              className={`flex w-full items-start gap-x-12 px-16 py-13 text-right transition-colors ${
                isActive ? "bg-primary-light bg-opacity-40" : "bg-transparent hover:bg-gray-F8F8F8"
              }`}
            >
              <span className="relative shrink-0">
                <span className="flex h-46 w-46 items-center justify-center overflow-hidden rounded-full bg-gray-F8F8F8 ring-1 ring-white">
                  {isSupport ? (
                    <i aria-hidden="true" className="icon-Information text-20 text-primary-dark" />
                  ) : row.residence?.image ? (
                    <img src={row.residence.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <i aria-hidden="true" className="icon-Profile text-20 text-gray-A9B1BC" />
                  )}
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 top-1/2 h-20 w-3 -translate-y-1/2 rounded-full bg-primary-main"
                  />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-x-8">
                  <span
                    className={`truncate text-14 leading-22 ${
                      row.unread_count > 0 ? "font-b text-black" : "font-m text-black"
                    }`}
                  >
                    {title}
                  </span>
                  <span className="shrink-0 text-11 leading-16 font-r text-gray-A9B1BC">
                    {listStampOf(row.last_message_at)}
                  </span>
                </span>

                {row.residence && !isSupport && (
                  <span className="mt-2 block truncate text-11 leading-18 font-r text-gray-A9B1BC">
                    {row.residence.name}
                  </span>
                )}

                <span className="mt-4 flex items-center justify-between gap-x-8">
                  <span
                    className={`truncate text-12 leading-20 ${
                      row.unread_count > 0 ? "font-m text-black" : "font-r text-gray-77828F"
                    }`}
                  >
                    {row.last_message || "…"}
                  </span>

                  <span className="flex shrink-0 items-center gap-x-6">
                    {row.is_muted && (
                      <i
                        aria-hidden="true"
                        title="بی‌صدا"
                        className="icon-BellFill text-14 text-gray-CACFD3"
                      />
                    )}
                    {row.unread_count > 0 && (
                      <span className="flex h-20 min-w-[20px] items-center justify-center rounded-full bg-primary-main px-6 text-11 leading-16 font-b text-black">
                        {row.unread_count.toLocaleString("fa-IR")}
                        <span className="sr-only"> پیام خوانده‌نشده</span>
                      </span>
                    )}
                  </span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default ConversationList;
