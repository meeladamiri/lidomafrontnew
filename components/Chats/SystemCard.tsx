import Link from "next/link";
import type { IChatMessage } from "@/api/chats";
import { dayLabelOf, timeOf } from "./chatFormat";

/**
 * A reservation event, rendered as a card rather than a chat bubble.
 *
 * The backend sends structured `meta` alongside the sentence, so this does not
 * parse anything back out of the text — it reads the `kind` and lays the
 * details out. The plain sentence is the fallback for a kind this build does
 * not know, which is what keeps an older client honest rather than blank.
 */

const faDate = new Intl.DateTimeFormat("fa-IR", { day: "numeric", month: "long" });

function formatDate(value: unknown): string {
  if (typeof value !== "string") return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : faDate.format(date);
}

interface Tone {
  ring: string;
  bg: string;
  icon: string;
  iconColor: string;
  title: string;
}

const TONES: Record<string, Tone> = {
  BOOKING_CREATED: {
    ring: "border-gray-F0F0F0",
    bg: "bg-white",
    icon: "icon-Calendar",
    iconColor: "text-primary-dark",
    title: "درخواست رزرو ثبت شد",
  },
  BOOKING_APPROVED: {
    ring: "border-[#B7E4C7]",
    bg: "bg-[#F1FAF4]",
    icon: "icon-Confirmed",
    iconColor: "text-[#1B8A4B]",
    title: "رزرو تأیید شد",
  },
  BOOKING_COMPLETED: {
    ring: "border-[#B7E4C7]",
    bg: "bg-[#F1FAF4]",
    icon: "icon-Confirmed",
    iconColor: "text-[#1B8A4B]",
    title: "رزرو تکمیل شد",
  },
  BOOKING_CANCELLED: {
    ring: "border-[#F5C2C2]",
    bg: "bg-[#FDF3F3]",
    icon: "icon-Close",
    iconColor: "text-[#C0392B]",
    title: "رزرو لغو شد",
  },
  BOOKING_EXPIRED: {
    ring: "border-[#F3DDB0]",
    bg: "bg-[#FDF8EE]",
    icon: "icon-Timer",
    iconColor: "text-[#B07D1A]",
    title: "مهلت رزرو تمام شد",
  },
  ADMIN_JOINED: {
    ring: "border-gray-F0F0F0",
    bg: "bg-gray-F8F8F8",
    icon: "icon-Information",
    iconColor: "text-gray-6C6A7D",
    title: "پشتیبانی وارد چت شد",
  },
};

const CANCELLED_BY: Record<string, string> = {
  HOST_CANCELLED: "لغو از سمت میزبان",
  GUEST_CANCELLED: "لغو از سمت مهمان",
};

function SystemCard({ message }: { message: IChatMessage }) {
  const meta = message.meta ?? {};
  const kind = typeof meta.kind === "string" ? meta.kind : "";
  const tone = TONES[kind];

  // An unknown kind still says something true, in the shape of a quiet note.
  if (!tone) {
    return (
      <div className="mx-auto my-14 flex max-w-[420px] flex-col items-center gap-y-2 rounded-14 bg-gray-F8F8F8 px-16 py-10 text-center">
        <p className="text-12 leading-20 font-r text-gray-6C6A7D">{message.body}</p>
        <span className="text-10 leading-16 font-r text-gray-A9B1BC">
          {dayLabelOf(message.created_at)} · {timeOf(message.created_at)}
        </span>
      </div>
    );
  }

  const start = formatDate(meta.startDate);
  const end = formatDate(meta.endDate);
  const residenceId = typeof meta.residenceId === "number" ? meta.residenceId : null;

  return (
    <div className="my-14 flex justify-center">
      <div
        className={`w-full max-w-[440px] rounded-20 border-1 border-solid px-16 py-14 shadow-[0_1px_3px_rgba(24,39,58,0.05)] ${tone.ring} ${tone.bg}`}
      >
        <div className="flex items-center gap-x-8">
          <span className={`flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white ${tone.iconColor}`}>
            <i aria-hidden="true" className={`${tone.icon} text-16`} />
          </span>
          <p className="flex-1 text-14 leading-22 font-m text-black">{tone.title}</p>
          <span className="shrink-0 text-10 leading-16 font-r text-gray-A9B1BC">
            {dayLabelOf(message.created_at)} · {timeOf(message.created_at)}
          </span>
        </div>

        {kind === "BOOKING_CREATED" && (
          <div className="mt-8 text-13 leading-22 font-r text-gray-6C6A7D">
            {residenceId && typeof meta.residenceName === "string" ? (
              <Link
                href={`/rentals/${residenceId}`}
                prefetch={false}
                className="text-primary-main hover:underline"
              >
                {meta.residenceName}
              </Link>
            ) : (
              <span>{String(meta.residenceName ?? "")}</span>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-4">
              {start && end && (
                <span>
                  {start} تا {end}
                </span>
              )}
              {typeof meta.guestsCount === "number" && <span>{meta.guestsCount} مهمان</span>}
              {typeof meta.reference === "string" && (
                <span className="text-gray-B0AFBC">{meta.reference}</span>
              )}
            </div>
          </div>
        )}

        {kind === "BOOKING_CANCELLED" && (
          <div className="mt-6 text-13 leading-22 font-r text-gray-6C6A7D">
            {typeof meta.cancelledBy === "string" && CANCELLED_BY[meta.cancelledBy] && (
              <span>{CANCELLED_BY[meta.cancelledBy]}</span>
            )}
            {typeof meta.reason === "string" && meta.reason && (
              <span className="block">دلیل: {meta.reason}</span>
            )}
          </div>
        )}

        {kind === "BOOKING_APPROVED" && (
          <p className="mt-6 text-13 leading-22 font-r text-gray-6C6A7D">
            برای قطعی‌شدن، مبلغ باقی‌مانده را پرداخت کنید.
          </p>
        )}
      </div>
    </div>
  );
}

export default SystemCard;
