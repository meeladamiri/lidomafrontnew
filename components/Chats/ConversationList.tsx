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
        <i aria-hidden="true" className="icon-message text-40 text-gray-CACFD3" />
        <p className="mt-12 text-14 leading-24 font-m text-black">هنوز گفتگویی ندارید</p>
        <p className="mt-4 text-12 leading-20 font-r text-gray-6C6A7D">
          با ثبت اولین رزرو، گفتگو با میزبان همین‌جا باز می‌شود.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y-1 divide-solid divide-gray-EFEFEF">
      {items.map((row) => {
        const isActive = row.id === selectedId;
        const isSupport = row.type === "SUPPORT";
        const title = isSupport
          ? row.subject || "پشتیبانی لیدوماتریپ"
          : row.peer?.name || "کاربر لیدوماتریپ";

        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row.id)}
              aria-current={isActive ? "true" : undefined}
              className={`flex w-full items-start gap-x-12 px-16 py-12 text-right transition-colors ${
                isActive ? "bg-primary-main bg-opacity-[6%]" : "bg-white hover:bg-gray-F5F5F7"
              }`}
            >
              <span className="relative flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-F5F5F7">
                {isSupport ? (
                  <i aria-hidden="true" className="icon-Information text-20 text-primary-main" />
                ) : row.residence?.image ? (
                  <img src={row.residence.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <i aria-hidden="true" className="icon-Profile text-20 text-gray-B0AFBC" />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-x-8">
                  <span className="truncate text-14 leading-22 font-m text-black">{title}</span>
                  <span className="shrink-0 text-11 leading-16 font-r text-gray-B0AFBC">
                    {listStampOf(row.last_message_at)}
                  </span>
                </span>

                {row.residence && !isSupport && (
                  <span className="mt-2 block truncate text-11 leading-18 font-r text-gray-B0AFBC">
                    {row.residence.name}
                  </span>
                )}

                <span className="mt-4 flex items-center justify-between gap-x-8">
                  <span
                    className={`truncate text-12 leading-20 ${
                      row.unread_count > 0 ? "font-m text-black" : "font-r text-gray-6C6A7D"
                    }`}
                  >
                    {row.last_message || "…"}
                  </span>

                  {row.unread_count > 0 && (
                    <span className="flex h-20 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary-main px-6 text-11 leading-16 font-m text-white">
                      {row.unread_count.toLocaleString("fa-IR")}
                      <span className="sr-only"> پیام خوانده‌نشده</span>
                    </span>
                  )}

                  {row.is_muted && (
                    <i
                      aria-hidden="true"
                      title="بی‌صدا"
                      className="icon-BellFill shrink-0 text-14 text-gray-CACFD3"
                    />
                  )}
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
