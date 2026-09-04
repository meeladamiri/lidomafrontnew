import type { IChatMessage } from "@/api/chats";
import { timeOf } from "./chatFormat";

/**
 * One message.
 *
 * Three states worth distinguishing at a glance, because they mean different
 * things to the sender: sent (one tick), read by the other side (two), and
 * still in flight or failed. An optimistic message that quietly looks
 * identical to a delivered one is how people end up believing they said
 * something they never sent.
 */

interface Props {
  message: IChatMessage;
  isMine: boolean;
  /** The other side has read everything up to and including this id. */
  peerReadUpTo: number | null;
  /** True when the previous message is from the same sender in the same minute. */
  grouped: boolean;
  onRetry?: (message: IChatMessage) => void;
}

function MessageBubble({ message, isMine, peerReadUpTo, grouped, onRetry }: Props) {
  const isAdmin = message.sender_role === "ADMIN";
  const read = isMine && peerReadUpTo !== null && message.id <= peerReadUpTo && !message.pending;

  if (message.deleted) {
    return (
      <div className={`flex ${isMine ? "justify-start" : "justify-end"} ${grouped ? "mt-4" : "mt-14"}`}>
        <div className="rounded-16 border-1 border-dashed border-gray-CACFD3 px-14 py-8 text-12 leading-20 font-r text-gray-A9B1BC">
          این پیام حذف شد
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isMine ? "justify-start" : "justify-end"} ${grouped ? "mt-4" : "mt-14"}`}
    >
      <div className="flex max-w-[85%] flex-col md:max-w-[68%]">
        {/* An admin speaking inside a two-person thread is named. Left
            unlabelled it reads as one of the participants, which is worse
            than not intervening at all. */}
        {isAdmin && !isMine && !grouped && (
          <span className="mb-5 flex items-center gap-x-4 px-2 text-11 leading-16 font-m text-primary-dark">
            <i aria-hidden="true" className="icon-Information text-14" />
            پشتیبانی لیدوماتریپ
          </span>
        )}

        <div
          className={[
            "rounded-20 px-14 py-9 text-14 leading-24 font-r",
            // The corner nearest the sender is squared off — the bubble's tail,
            // mirrored for RTL.
            isMine
              ? "rounded-bl-6 bg-primary-main text-black shadow-[0_2px_10px_rgba(3,214,187,0.25)]"
              : isAdmin
                ? "rounded-br-6 border-1 border-solid border-primary-main border-opacity-25 bg-primary-light bg-opacity-40 text-black"
                : "rounded-br-6 border-1 border-solid border-gray-F0F0F0 bg-white text-black shadow-[0_1px_2px_rgba(24,39,58,0.04)]",
            message.pending ? "opacity-55" : "",
            message.failed ? "border-1 border-solid border-error-light" : "",
          ].join(" ")}
        >
          {message.attachment_url && (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noreferrer"
              className="mb-8 block overflow-hidden rounded-14"
            >
              {/* Deliberately not next/image: these are user uploads on a
                  storage host, and the optimizer would need every one of them
                  whitelisted. */}
              <img
                src={message.attachment_url}
                alt={message.attachment_name || "پیوست"}
                loading="lazy"
                decoding="async"
                className="max-h-[260px] w-full object-cover"
              />
            </a>
          )}

          {/* Newlines are meaningful in a chat and the body is plain text —
              never HTML — so whitespace-pre-wrap is both correct and safe. */}
          {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}

          <div
            className={`mt-5 flex items-center justify-end gap-x-4 text-10 leading-14 ${
              isMine ? "text-black text-opacity-50" : "text-gray-A9B1BC"
            }`}
          >
            <span>{timeOf(message.created_at)}</span>
            {isMine && !message.failed && (
              <i
                aria-hidden="true"
                className={`${message.pending ? "icon-Timer" : read ? "icon-DoubleTick" : "icon-Tick"} text-12`}
              />
            )}
            {isMine && (
              <span className="sr-only">
                {message.failed ? "ارسال نشد" : message.pending ? "در حال ارسال" : read ? "خوانده شد" : "ارسال شد"}
              </span>
            )}
          </div>
        </div>

        {message.failed && (
          <button
            type="button"
            onClick={() => onRetry?.(message)}
            className="mt-6 self-start px-2 text-11 leading-16 font-m text-error-light hover:underline"
          >
            ارسال نشد — دوباره تلاش کنید
          </button>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
